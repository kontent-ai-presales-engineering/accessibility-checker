import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UrlForm from "@/components/UrlForm";
import AccessibilityResults from "@/components/AccessibilityResults";
import { useState, useEffect } from "react";
import type { AccessibilityIssue } from "@/lib/wcag";

export default function Home() {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [url, setUrl] = useState<string>("");
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Initialize Kontent.ai custom app SDK
  useEffect(() => {
    const initKontentApp = async () => {
      try {
        // Dynamically import the SDK to avoid issues in standalone mode
        const { getCustomAppContext } = await import("@kontent-ai/custom-app-sdk");

        console.log('[Kontent.ai] Initializing SDK (works from any deployment - Railway, Render, etc.)');
        const context = await getCustomAppContext();

        console.log('[Kontent.ai] Full context received:', context);

        // Parse config if it's a JSON string
        let config = context?.config;
        if (typeof config === 'string') {
          console.log('[Kontent.ai] Config is a string, parsing JSON...');
          try {
            config = JSON.parse(config);
            console.log('[Kontent.ai] ✓ Config parsed successfully:', config);
          } catch (e) {
            console.error('[Kontent.ai] ✗ Failed to parse config JSON:', e);
            config = {};
          }
        }

        console.log('[Kontent.ai] Config keys available:', Object.keys(config || {}));

        // Extract Management API key from config
        const managementApiKey = (config as any)?.KONTENT_AI_MANAGEMENT_API_KEY;
        if (managementApiKey) {
          setApiKey(managementApiKey);
          console.log('[Kontent.ai] ✓ Management API key found - spaces dropdown will be available');
        } else {
          console.warn('[Kontent.ai] ✗ No Management API key found in config');
          console.warn('[Kontent.ai] To enable spaces: Add KONTENT_AI_MANAGEMENT_API_KEY parameter in Kontent.ai custom app settings');
        }

        // Get environment ID - it's nested at context.context.environmentId
        const envId = (context as any)?.context?.environmentId;
        if (envId) {
          setProjectId(envId);
          console.log('[Kontent.ai] ✓ Environment ID found:', envId);
        } else {
          console.warn('[Kontent.ai] ✗ No environment ID found');
        }
      } catch (error) {
        console.error('[Kontent.ai] Failed to initialize custom app SDK:', error);
        console.log('[Kontent.ai] This is expected when running standalone (not embedded in Kontent.ai)');
      }
    };

    // Check if we're in an iframe (embedded in Kontent.ai)
    if (window.self !== window.top) {
      console.log('[Kontent.ai] Detected iframe context - will attempt to load Kontent.ai integration');
      console.log('[Kontent.ai] This works regardless of deployment location (Railway, Render, Vercel, etc.)');
      initKontentApp();
    } else {
      console.log('[Kontent.ai] Running standalone - Kontent.ai integration disabled');
      console.log('[Kontent.ai] To use spaces: Deploy to Railway/Render and configure as Kontent.ai custom app');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Web Accessibility Checker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze your website for WCAG compliance issues
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Card className="shadow-sm border-border">
          <CardHeader className="border-b bg-white rounded-t-lg">
            <CardTitle className="text-lg font-medium">
              Enter URL to analyze
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <UrlForm
              apiKey={apiKey}
              projectId={projectId}
              onResults={(results, checkedUrl, urls) => {
                setIssues(results);
                setUrl(checkedUrl);
                setProcessedUrls(urls);
              }}
            />
          </CardContent>
        </Card>

        {issues.length > 0 && (
          <div className="mt-6">
            <AccessibilityResults
              issues={issues}
              url={url}
              processedUrls={processedUrls}
            />
          </div>
        )}
      </div>
    </div>
  );
}