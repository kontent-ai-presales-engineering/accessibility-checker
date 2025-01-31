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

      // Launch headless browser
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });

        // Run accessibility tests
        const results = await new AxePuppeteer(page).analyze();

        // Transform results into our format
        const issues = results.violations.map((violation: any) => ({
          code: violation.id,
          type: 'error',
          message: violation.help,
          context: violation.nodes[0]?.html || '',
          selector: violation.nodes[0]?.target[0] || '',
          wcagCriteria: violation.tags.filter((t: string) => t.startsWith('wcag')).join(', '),
          impact: violation.impact as 'critical' | 'serious' | 'moderate' | 'minor',
          suggestion: violation.nodes[0]?.failureSummary || violation.description
        }));

        res.json({ issues });
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