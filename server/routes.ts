import type { Express } from "express";
import { createServer, type Server } from "http";
import * as cheerio from 'cheerio';
import AxePuppeteer from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';
import { z } from "zod";
import { db } from "@db";
import { urls } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { getDomain, isInternalLink, normalizeUrl } from "./utils";
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';

const urlSchema = z.object({
  url: z.string().url()
});

async function analyzeUrl(url: string) {
  console.log(`Analyzing URL: ${url}`);
  const domain = getDomain(url);

  // Launch a new browser instance for each URL
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions'
    ]
  });

  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 15000 // Reduced timeout to fail faster
    });

    // Extract links
    const content = await page.content();
    const $ = cheerio.load(content);
    const links = new Set<string>();

    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const normalizedUrl = normalizeUrl(href, url);
        if (normalizedUrl && isInternalLink(normalizedUrl, domain)) {
          links.add(normalizedUrl);
        }
      }
    });

    // Store new internal links
    const linkArray = Array.from(links);
    for (const link of linkArray) {
      await db.insert(urls).values({
        url: link,
        parentUrl: url,
        domain,
        processed: false,
      }).onConflictDoNothing();
    }

    // Run accessibility analysis
    console.log('Running accessibility analysis...');
    const results = await new AxePuppeteer(page).analyze();

    // Transform results and include source URL
    const issues = results.violations.map((violation: any) => {
      const wcagTags = violation.tags
        .filter((t: string) => t.startsWith('wcag'))
        .map((tag: string) => {
          try {
            const parts = tag.split('.');
            if (parts.length >= 3) {
              const level = parts[1];
              const criterion = parts[2];
              return `WCAG ${level.toUpperCase()} ${criterion}`;
            }
            return tag;
          } catch (error) {
            console.error('Error parsing WCAG tag:', tag, error);
            return tag;
          }
        })
        .filter(Boolean)
        .join(', ');

      return {
        code: violation.id,
        type: 'error',
        message: violation.help,
        context: violation.nodes[0]?.html || '',
        selector: violation.nodes[0]?.target[0] || '',
        wcagCriteria: wcagTags || 'Not specified',
        impact: violation.impact as 'critical' | 'serious' | 'moderate' | 'minor',
        suggestion: violation.nodes[0]?.failureSummary || violation.description,
        helpUrl: violation.helpUrl,
        category: violation.tags
          .filter((t: string) => !t.startsWith('wcag'))
          .join(', '),
        sourceUrl: url
      };
    });

    // Mark current URL as processed
    await db.update(urls)
      .set({ processed: true })
      .where(eq(urls.url, url));

    return { issues, linksFound: links.size };
  } catch (error) {
    console.error(`Error analyzing URL ${url}:`, error);
    // Mark as processed even if it fails to avoid endless retries
    await db.update(urls)
      .set({ processed: true })
      .where(eq(urls.url, url));
    return { issues: [], linksFound: 0 };
  } finally {
    try {
      await page.close();
    } catch (e) {
      console.error('Error closing page:', e);
    }
    try {
      await browser.close();
    } catch (e) {
      console.error('Error closing browser:', e);
    }
  }
}

async function getNextUnprocessedUrl(domain: string) {
  const [nextUrl] = await db.select()
    .from(urls)
    .where(
      and(
        eq(urls.domain, domain),
        eq(urls.processed, false)
      )
    )
    .limit(1);

  return nextUrl;
}

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Create WebSocket server with specific path
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  // Store WSS instance in app locals for access in routes
  app.locals.wss = wss;

  app.post("/api/check", async (req, res) => {
    try {
      const { url } = urlSchema.parse(req.body);
      const domain = getDomain(url);
      let allIssues: any[] = [];
      let totalLinksFound = 0;
      const processedUrls: string[] = [];

      try {
        // Analyze initial URL
        const initialResults = await analyzeUrl(url);
        allIssues.push(...initialResults.issues);
        totalLinksFound += initialResults.linksFound;
        processedUrls.push(url);

        // Process discovered links with a limit
        let processedCount = 0;
        const MAX_URLS = 5; // Reduced limit for better stability

        while (processedCount < MAX_URLS) {
          const nextUrl = await getNextUnprocessedUrl(domain);
          if (!nextUrl) break;

          // Emit processing status via WebSocket
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ 
                type: 'processing', 
                url: nextUrl.url 
              }));
            }
          });

          const results = await analyzeUrl(nextUrl.url);
          allIssues.push(...results.issues);
          totalLinksFound += results.linksFound;
          processedUrls.push(nextUrl.url);
          processedCount++;
        }

        res.json({ 
          issues: allIssues,
          linksFound: totalLinksFound,
          processedUrls: processedUrls
        });

      } catch (error) {
        console.error('Error during page operations:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error checking accessibility:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to check accessibility'
      });
    }
  });

  // Add endpoint to get unprocessed URLs for a domain
  app.get("/api/pending-urls", async (req, res) => {
    try {
      const domain = req.query.domain as string;
      if (!domain) {
        return res.status(400).json({ message: "Domain parameter is required" });
      }

      const pendingUrls = await db.select()
        .from(urls)
        .where(
          and(
            eq(urls.domain, domain),
            eq(urls.processed, false)
          )
        );

      res.json({ pendingUrls });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch pending URLs'
      });
    }
  });

  return httpServer;
}