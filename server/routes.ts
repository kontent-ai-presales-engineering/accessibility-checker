import type { Express } from "express";
import { createServer, type Server } from "http";
import * as cheerio from 'cheerio';
import AxePuppeteer from '@axe-core/puppeteer';
import puppeteer, { Browser, Page } from 'puppeteer';
import { z } from "zod";
import { db } from "@db";
import { urls, spaces } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { getDomain, isInternalLink, normalizeUrl, stripUrlParams, isCommunicationLink } from "./utils";
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';

// ===== Types =====
interface AnalysisSession {
  id: string;
  domain: string;
  cancelled: boolean;
  browser: Browser | null;
  activeTasks: Set<Promise<any>>;
}

interface AnalysisResult {
  issues: any[];
  linksFound: number;
}

// ===== Session Management =====
let currentSession: AnalysisSession | null = null;

function createSession(domain: string): AnalysisSession {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: sessionId,
    domain,
    cancelled: false,
    browser: null,
    activeTasks: new Set()
  };
}

async function cancelSession(session: AnalysisSession) {
  session.cancelled = true;

  // Wait for all active tasks to complete
  if (session.activeTasks.size > 0) {
    await Promise.allSettled(Array.from(session.activeTasks));
  }

  // Close browser if open
  if (session.browser) {
    try {
      await session.browser.close();
    } catch (error) {
      console.error(`[SESSION] Error closing browser:`, error);
    }
  }
}

async function cleanupSession(session: AnalysisSession) {
  // Wait for all active tasks to complete
  if (session.activeTasks.size > 0) {
    await Promise.allSettled(Array.from(session.activeTasks));
  }

  // Close browser if open
  if (session.browser) {
    try {
      await session.browser.close();
    } catch (error) {
      console.error(`[SESSION] Error closing browser:`, error);
    }
  }
}

// ===== Browser Management =====
async function getBrowser(session: AnalysisSession): Promise<Browser> {
  if (session.browser && session.browser.isConnected()) {
    return session.browser;
  }

  session.browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  return session.browser;
}

// ===== URL Analysis =====
async function analyzeUrl(
  url: string,
  session: AnalysisSession,
  wss: WebSocketServer
): Promise<AnalysisResult> {
  if (session.cancelled) {
    return { issues: [], linksFound: 0 };
  }

  // Broadcast current URL
  broadcastToClients(wss, {
    type: 'processing_url',
    url,
    sessionId: session.id
  });

  const browser = await getBrowser(session);
  const page = await browser.newPage();

  try {
    // Check cancellation
    if (session.cancelled) {
      await page.close();
      return { issues: [], linksFound: 0 };
    }

    // Configure page
    await page.setViewport({ width: 1280, height: 800 });
    await page.setRequestInterception(true);

    page.on('request', (req: any) => {
      const resourceType = req.resourceType();
      if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate to page
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Check cancellation
    if (session.cancelled) {
      await page.close();
      return { issues: [], linksFound: 0 };
    }

    // Wait for page to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract links
    const content = await page.content();
    const $ = cheerio.load(content);
    const links = new Set<string>();
    const domain = getDomain(url);

    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href && !isCommunicationLink(href)) {
        const normalizedUrl = normalizeUrl(href, url);
        if (normalizedUrl && isInternalLink(normalizedUrl, domain)) {
          links.add(normalizedUrl);
        }
      }
    });

    // Store discovered URLs in database
    for (const link of links) {
      try {
        await db.insert(urls).values({
          url: link,
          parentUrl: url,
          domain,
          processed: false,
        }).onConflictDoNothing();
      } catch (error) {
        // Ignore conflicts
      }
    }

    // Check cancellation before accessibility analysis
    if (session.cancelled) {
      await page.close();
      return { issues: [], linksFound: links.size };
    }

    // Run accessibility analysis
    let results: any;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      results = await new AxePuppeteer(page).analyze();
    } catch (error: any) {
      console.error(`[ANALYSIS] Accessibility check failed for ${url}:`, error.message);
      results = { violations: [] };
    }

    // Process violations
    const issues = results.violations.map((violation: any) => {
      // Extract WCAG tags without modification - let frontend handle parsing
      const wcagTags = violation.tags
        .filter((t: string) => t.startsWith('wcag'))
        .join(','); // Comma-separated for frontend parsing

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
        category: violation.tags.filter((t: string) => !t.startsWith('wcag')).join(', '),
        sourceUrl: url
      };
    });

    await page.close();
    return { issues, linksFound: links.size };
  } catch (error: any) {
    console.error(`[ANALYSIS] Error analyzing ${url}:`, error.message);
    try {
      await page.close();
    } catch (e) {
      // Ignore
    }
    return { issues: [], linksFound: 0 };
  }
}

// ===== URL Processing =====
async function processAllUrls(
  session: AnalysisSession,
  wss: WebSocketServer
): Promise<{ issues: any[], processedUrls: string[] }> {
  const allIssues: any[] = [];
  const allProcessedUrls: string[] = [];
  const BATCH_SIZE = 5;

  while (!session.cancelled) {
    // Get unprocessed URLs
    const unprocessedUrls = await db.select()
      .from(urls)
      .where(
        and(
          eq(urls.domain, session.domain),
          eq(urls.processed, false)
        )
      )
      .limit(BATCH_SIZE);

    if (unprocessedUrls.length === 0) {
      break;
    }

    // Process batch in parallel
    const batchPromises = unprocessedUrls.map(async (urlRecord) => {
      if (session.cancelled) {
        return null;
      }

      const task = (async () => {
        try {
          // Analyze URL
          const result = await analyzeUrl(urlRecord.url, session, wss);

          if (session.cancelled) {
            return null;
          }

          // Mark as processed
          await db.update(urls)
            .set({ processed: true })
            .where(eq(urls.id, urlRecord.id));

          // Get counts
          const processedCount = await db.select()
            .from(urls)
            .where(
              and(
                eq(urls.domain, session.domain),
                eq(urls.processed, true)
              )
            );

          const remainingCount = await db.select()
            .from(urls)
            .where(
              and(
                eq(urls.domain, session.domain),
                eq(urls.processed, false)
              )
            );

          const totalProcessed = processedCount.length;
          const remainingUrls = remainingCount.length;

          // Broadcast completion
          broadcastToClients(wss, {
            type: 'url_completed',
            url: urlRecord.url,
            issues: result.issues,
            totalProcessed,
            remainingUrls,
            sessionId: session.id
          });

          return {
            url: urlRecord.url,
            issues: result.issues
          };
        } catch (error: any) {
          console.error(`[PROCESSING] Error processing ${urlRecord.url}:`, error.message);

          // Mark as processed even on error
          await db.update(urls)
            .set({ processed: true })
            .where(eq(urls.id, urlRecord.id));

          return {
            url: `${urlRecord.url} (failed)`,
            issues: []
          };
        }
      })();

      session.activeTasks.add(task);
      const result = await task;
      session.activeTasks.delete(task);

      return result;
    });

    const results = await Promise.all(batchPromises);

    // Collect results
    for (const result of results) {
      if (result) {
        allIssues.push(...result.issues);
        allProcessedUrls.push(result.url);
      }
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { issues: allIssues, processedUrls: allProcessedUrls };
}

// ===== WebSocket Helper =====
function broadcastToClients(wss: WebSocketServer, message: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// ===== Route Registration =====
const urlSchema = z.object({
  url: z.string().url()
});

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws'
  });

  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'cancel' && currentSession) {
          await cancelSession(currentSession);
        }
      } catch (error) {
        console.error('[WEBSOCKET] Error parsing message:', error);
      }
    });
  });

  // Get all spaces from Kontent.ai
  app.get("/api/spaces", async (req, res) => {
    try {
      // Try to get API key from header first (from custom app), then from env
      const apiKey = req.headers['x-kontent-api-key'] as string || process.env.KONTENT_MANAGEMENT_API_KEY;
      // Also try to get environment ID (passed as project ID)
      const environmentId = req.headers['x-kontent-project-id'] as string || req.query.projectId as string;

      if (!apiKey) {
        return res.json([]);
      }

      if (!environmentId) {
        return res.json([]);
      }

      // Get preview configuration which contains spaces with their domains
      const previewConfigUrl = `https://manage.kontent.ai/v2/projects/${environmentId}/preview-configuration`;

      const response = await fetch(previewConfigUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Kontent.ai API returned ${response.status}: ${errorText}`);
        return res.json([]);
      }

      const previewConfig = await response.json();

      // Extract space configurations
      const spaceConfigurations = previewConfig.space_domains || [];

      const spacesWithDomains = [];

      // Process each space configuration
      for (const spaceConfig of spaceConfigurations) {
        // Check if this space has a configured domain
        if (spaceConfig.domain) {
          try {
            // Fetch space details to get the name
            const spaceUrl = `https://manage.kontent.ai/v2/projects/${environmentId}/spaces/${spaceConfig.space.id}`;

            const spaceResponse = await fetch(spaceUrl, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            });

            let spaceName = spaceConfig.space.codename || spaceConfig.space.id;

            if (spaceResponse.ok) {
              const spaceData = await spaceResponse.json();
              spaceName = spaceData.name || spaceData.codename || spaceName;
            }

            spacesWithDomains.push({
              id: spaceConfig.space.id,
              name: spaceName,
              url: `https://${spaceConfig.domain}`,
              codename: spaceConfig.space.codename
            });
          } catch (error) {
            console.error(`[API] Error fetching space ${spaceConfig.space.id}:`, error);
          }
        }
      }

      res.json(spacesWithDomains);
    } catch (error: any) {
      console.error('[API] Error fetching spaces from Kontent.ai:', error);
      // Return empty array on error to allow graceful fallback
      res.json([]);
    }
  });

  // Main analysis endpoint
  app.post("/api/check", async (req, res) => {
    try {
      // Cancel any existing session
      if (currentSession) {
        await cancelSession(currentSession);
        currentSession = null;
      }

      // Parse and normalize URL
      const { url: rawUrl } = urlSchema.parse(req.body);
      const url = stripUrlParams(rawUrl);
      const domain = getDomain(url);

      // Create new session
      const session = createSession(domain);
      currentSession = session;

      // Clear existing URLs for this domain
      await db.delete(urls).where(eq(urls.domain, domain));

      // Insert initial URL
      await db.insert(urls).values({
        url,
        parentUrl: null,
        domain,
        processed: false,
      });

      // Broadcast analysis start
      broadcastToClients(wss, {
        type: 'analysis_started',
        domain,
        initialUrl: url,
        sessionId: session.id
      });

      // Process all URLs
      const { issues, processedUrls } = await processAllUrls(session, wss);

      // Check if it was cancelled before cleanup
      const wasCancelled = session.cancelled;

      // Cleanup session (without marking as cancelled)
      await cleanupSession(session);
      currentSession = null;

      // Send response
      res.json({
        issues,
        processedUrls,
        totalProcessed: processedUrls.length,
        cancelled: wasCancelled
      });

    } catch (error: any) {
      console.error('[API] Error during analysis:', error);

      // Cleanup on error
      if (currentSession) {
        await cancelSession(currentSession);
        currentSession = null;
      }

      res.status(400).json({
        message: error.message || 'Failed to check accessibility'
      });
    }
  });

  // Cleanup on server shutdown
  const cleanup = async () => {
    if (currentSession) {
      await cancelSession(currentSession);
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  return httpServer;
}
