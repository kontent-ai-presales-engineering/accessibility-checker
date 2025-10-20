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
        const context = await getCustomAppContext();

        // Extract Management API key from config
        const managementApiKey = context?.config?.KONTENT_AI_MANAGEMENT_API_KEY;
        if (managementApiKey) {
          setApiKey(managementApiKey);
        }

        // Get environment ID - it's nested at context.context.environmentId
        const envId = (context as any)?.context?.environmentId;
        if (envId) {
          setProjectId(envId);
        }
      } catch (error) {
        // Running standalone - this is expected and not an error
      }
    };

    // Only try to init if we're in an iframe
    if (window.self !== window.top) {
      initKontentApp();
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