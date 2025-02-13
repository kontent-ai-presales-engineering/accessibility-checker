import type { Express } from "express";
import { createServer, type Server } from "http";
import * as cheerio from 'cheerio';
import AxePuppeteer from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';
import { z } from "zod";

const urlSchema = z.object({
  url: z.string().url()
});

export function registerRoutes(app: Express): Server {
  app.post("/api/check", async (req, res) => {
    try {
      const { url } = urlSchema.parse(req.body);

      console.log('Launching browser with system Chromium...');
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

      try {
        console.log('Creating new page...');
        const page = await browser.newPage();

        console.log('Setting viewport...');
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`Navigating to ${url}...`);
        await page.goto(url, { 
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        console.log('Running accessibility analysis...');
        const results = await new AxePuppeteer(page).analyze();

        // Transform results into our format with more WCAG details
        const issues = results.violations.map((violation: any) => {
          // Get detailed WCAG criteria info
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
                return tag; // Return original tag if it doesn't match expected format
              } catch (error) {
                console.error('Error parsing WCAG tag:', tag, error);
                return tag; // Return original tag on error
              }
            })
            .filter(Boolean) // Remove any undefined/null values
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
              .join(', ')
          };
        });

        res.json({ issues });
      } catch (error) {
        console.error('Error during page operations:', error);
        throw error;
      } finally {
        await browser.close();
      }
    } catch (error) {
      console.error('Error checking accessibility:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to check accessibility'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}