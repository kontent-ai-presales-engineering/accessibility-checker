import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UrlForm from "@/components/UrlForm";
import AccessibilityResults from "@/components/AccessibilityResults";
import { useState } from "react";
import type { AccessibilityIssue } from "@/lib/wcag";

export default function Home() {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [url, setUrl] = useState<string>("");
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Web Accessibility Checker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UrlForm onResults={(results, checkedUrl, urls) => {
              setIssues(results);
              setUrl(checkedUrl);
              setProcessedUrls(urls);
            }} />
          </CardContent>
        </Card>

        {issues.length > 0 && (
          <AccessibilityResults 
            issues={issues} 
            url={url} 
            processedUrls={processedUrls}
          />
        )}
      </div>
    </div>
  );
}