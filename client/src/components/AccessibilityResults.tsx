import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessibilityIssue, severityColors, exportToCSV, exportToJSON } from "@/lib/wcag";
import IssueSeverity from "./IssueSeverity";
import WCAGCriteria from "./WCAGCriteria";
import { Button } from "@/components/ui/button";
import { Copy, Download, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccessibilityResultsProps {
  issues: AccessibilityIssue[];
  url: string;
  processedUrls: string[];
}

export default function AccessibilityResults({ issues, url }: AccessibilityResultsProps) {
  const { toast } = useToast();
  const severities = ['critical', 'serious', 'moderate', 'minor'] as const;

  // Universal bookmarklet that reads selector from page URL hash
  const universalBookmarklet = `javascript:(function(){const hash=window.location.hash;const match=hash.match(/selector=([^&]+)/);if(match){const selector=decodeURIComponent(match[1]);try{const el=document.querySelector(selector);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.style.outline='3px solid red';el.style.outlineOffset='2px';el.style.backgroundColor='rgba(255,0,0,0.1)';const o=document.createElement('div');o.style.cssText='position:fixed;top:10px;right:10px;background:#ef4444;color:white;padding:12px 20px;border-radius:8px;z-index:999999;font-family:sans-serif;font-size:14px;box-shadow:0 4px 6px rgba(0,0,0,0.1)';o.textContent='🔍 Element Highlighted';document.body.appendChild(o);setTimeout(()=>o.remove(),5000)}else alert('Element not found')}catch(e){alert('Error: '+e.message)}}else alert('No selector in URL hash. Use this bookmarklet on pages opened from the scanner.')})();`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "The selector has been copied to your clipboard."
    });
  };

  const locateElement = (issue: AccessibilityIssue) => {
    // Open URL with selector in hash
    const encodedSelector = encodeURIComponent(issue.selector);
    const targetUrl = `${issue.sourceUrl}#selector=${encodedSelector}`;
    window.open(targetUrl, '_blank');

    toast({
      title: "Page Opening...",
      description: "Click the 'Highlight Element' bookmark in your bookmarks bar to highlight the element automatically.",
      duration: 6000,
    });
  };


  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="border-b bg-white rounded-t-lg">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-medium text-foreground">Analysis Results</div>
              <div className="text-sm font-normal text-muted-foreground mt-1">{url}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportToCSV(issues, url)}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToJSON(issues, url)}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-3 inline-block max-w-2xl">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                  <a
                    href={universalBookmarklet}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded cursor-move text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "How to Install",
                        description: "Drag this button to your browser's bookmarks bar to install the helper tool.",
                        duration: 5000,
                      });
                    }}
                  >
                    <MapPin className="h-3 w-3" />
                    Highlight Tool
                  </a>
                </div>
                <div className="text-blue-900">
                  <span className="font-semibold">Setup once:</span> Drag this button to your bookmarks bar.
                  <span className="block mt-1"><span className="font-semibold">When locating elements:</span> Click 📍 on any issue → page opens → click this bookmark to auto-highlight the element.</span>
                </div>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="critical" className="w-full">
          <div className="border-b bg-muted/30 px-6">
            <TabsList className="h-12 bg-transparent border-0 w-full justify-start gap-6">
              {severities.map((severity) => (
                <TabsTrigger
                  key={severity}
                  value={severity}
                  className="capitalize data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                >
                  <span className="font-medium">{severity}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({issues.filter(i => i.impact === severity).length})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {severities.map((severity) => (
            <TabsContent key={severity} value={severity} className="m-0">
              <div className="divide-y">
                {issues
                  .filter(issue => issue.impact === severity)
                  .map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-6 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <IssueSeverity impact={issue.impact} />
                            <h3 className="font-medium text-foreground">
                              {issue.message}
                            </h3>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Found on: <span className="font-medium">{issue.sourceUrl}</span>
                          </p>

                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                              <span className="text-muted-foreground">Context:</span>
                              <code className="text-xs bg-muted px-2 py-1 rounded">{issue.context}</code>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                              <span className="text-muted-foreground">Selector:</span>
                              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{issue.selector}</code>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                              <span className="text-muted-foreground">WCAG Criteria:</span>
                              <WCAGCriteria wcagTags={issue.wcagCriteria} helpUrl={issue.helpUrl} />
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-accent/50 rounded-md border border-border">
                            <p className="text-sm font-medium text-foreground mb-2">How to fix:</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{issue.suggestion}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => locateElement(issue)}
                            title="Locate element on page"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(issue.selector)}
                            title="Copy selector"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {issues.filter(issue => issue.impact === severity).length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-muted-foreground">No {severity} issues found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}