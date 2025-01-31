import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessibilityIssue, severityColors } from "@/lib/wcag";
import IssueSeverity from "./IssueSeverity";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AccessibilityResultsProps {
  issues: AccessibilityIssue[];
  url: string;
}

export default function AccessibilityResults({ issues, url }: AccessibilityResultsProps) {
  const { toast } = useToast();
  const severities = ['critical', 'serious', 'moderate', 'minor'] as const;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "The selector has been copied to your clipboard."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Results for: {url}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="critical">
          <TabsList className="grid w-full grid-cols-4">
            {severities.map((severity) => (
              <TabsTrigger 
                key={severity} 
                value={severity}
                className="capitalize"
              >
                {severity} ({issues.filter(i => i.impact === severity).length})
              </TabsTrigger>
            ))}
          </TabsList>

          {severities.map((severity) => (
            <TabsContent key={severity} value={severity}>
              <ScrollArea className="h-[600px] rounded-md border p-4">
                {issues
                  .filter(issue => issue.impact === severity)
                  .map((issue, idx) => (
                    <div 
                      key={idx} 
                      className="mb-6 pb-6 border-b last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <IssueSeverity impact={issue.impact} />
                          <h3 className={`font-semibold ${severityColors[issue.impact]}`}>
                            {issue.message}
                          </h3>
                        </div>
                        <Button
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(issue.selector)}
                          title="Copy selector"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <strong>Context:</strong> {issue.context}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Selector:</strong> <code className="px-1 py-0.5 bg-muted rounded">{issue.selector}</code>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>WCAG Criteria:</strong> {issue.wcagCriteria}
                        </p>
                        <div className="mt-4 p-4 bg-muted rounded-md">
                          <p className="text-sm font-medium">How to fix:</p>
                          <p className="text-sm">{issue.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
