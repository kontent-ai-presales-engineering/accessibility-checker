import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AccessibilityIssue } from "@/lib/wcag";
import CheckProgress from "./CheckProgress";
import { useState, useEffect, useRef } from "react";

const formSchema = z.object({
  inputType: z.enum(["space", "url"]),
  spaceId: z.string().optional(),
  url: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.inputType === "space") {
    if (!data.spaceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a space",
        path: ["spaceId"],
      });
    }
  } else {
    if (!data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a URL",
        path: ["url"],
      });
    } else if (!z.string().url().safeParse(data.url).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid URL",
        path: ["url"],
      });
    }
  }
});

function normalizeUserInputUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  // If already has protocol, keep it
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Otherwise add https://
  return `https://${trimmed}`;
}

interface UrlFormProps {
  apiKey: string | null;
  projectId: string | null;
  onResults: (issues: AccessibilityIssue[], url: string, processedUrls: string[]) => void;
}

interface Space {
  id: string;
  name: string;
  url: string;
}

export default function UrlForm({ apiKey, projectId, onResults }: UrlFormProps) {
  const { toast } = useToast();
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [initialUrl, setInitialUrl] = useState<string>();
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [completedUrls, setCompletedUrls] = useState<string[]>([]);
  const [remainingUrls, setRemainingUrls] = useState<number>(0);
  const [accumulatedIssues, setAccumulatedIssues] = useState<AccessibilityIssue[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);
  const onResultsRef = useRef(onResults);
  const initialUrlRef = useRef<string>();

  // Keep refs updated
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  useEffect(() => {
    initialUrlRef.current = initialUrl;
  }, [initialUrl]);

  // Fetch spaces from Kontent.ai
  const { data: spaces = [] } = useQuery<Space[]>({
    queryKey: ['/api/spaces', apiKey, projectId],
    queryFn: async () => {
      const isVerbose = import.meta.env.VITE_VERBOSE_LOGGING === 'true';

      if (isVerbose) {
        console.log('[Spaces] Fetching spaces...');
      }

      const headers: Record<string, string> = {};
      if (apiKey) headers['x-kontent-api-key'] = apiKey;
      if (projectId) headers['x-kontent-project-id'] = projectId;

      const res = await apiRequest('GET', '/api/spaces', undefined, headers);
      const data = await res.json();

      if (isVerbose) {
        console.log('[Spaces] Received', data.length, 'spaces');
      }

      return data;
    },
    enabled: !!apiKey && !!projectId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputType: spaces.length > 0 ? "space" : "url",
      spaceId: "",
      url: "",
    },
  });

  const inputType = form.watch("inputType");

  // Reset state for new analysis
  const resetState = () => {
    setCurrentUrl(undefined);
    setInitialUrl(undefined);
    setTotalProcessed(0);
    setCompletedUrls([]);
    setRemainingUrls(0);
    setAccumulatedIssues([]);
  };

  const mutation = useMutation({
    mutationFn: async (data: { url: string }) => {
      const res = await apiRequest('POST', '/api/check', data);
      return res.json();
    },
    onSuccess: (data) => {
      // Combine accumulated issues with final results
      const allIssues = [...accumulatedIssues, ...data.issues];
      onResults(allIssues, initialUrl || data.url, completedUrls);

      resetState();

      toast({
        title: data.cancelled ? "Analysis Cancelled" : "Analysis Complete",
        description: `Found ${allIssues.length} accessibility issues across ${completedUrls.length} pages${data.cancelled ? ' (partial results)' : ''}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      resetState();
    }
  });

  const handleCancel = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'cancel' }));
      toast({
        title: "Cancelling...",
        description: "Waiting for current batch to complete...",
      });
      // Note: The mutation will complete naturally when the server responds
    }
  };

  // WebSocket connection management
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        // WebSocket connected
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'analysis_started':
              currentSessionIdRef.current = data.sessionId;
              initialUrlRef.current = data.initialUrl;
              setInitialUrl(data.initialUrl);
              setCurrentUrl(data.initialUrl);
              setAccumulatedIssues([]);
              setCompletedUrls([]);
              setTotalProcessed(0);
              setRemainingUrls(0);
              break;

            case 'processing_url':
              if (data.sessionId === currentSessionIdRef.current) {
                setCurrentUrl(data.url);
              }
              break;

            case 'url_completed':
              if (data.sessionId === currentSessionIdRef.current) {
                // Update completed URLs and trigger results update
                setCompletedUrls(prev => {
                  const newCompletedUrls = [...prev, data.url];

                  // Accumulate issues
                  if (data.issues && data.issues.length > 0) {
                    setAccumulatedIssues(prevIssues => {
                      const newIssues = [...prevIssues, ...data.issues];
                      // Update results in real-time with the new state using ref
                      onResultsRef.current(newIssues, initialUrlRef.current || data.url, newCompletedUrls);
                      return newIssues;
                    });
                  } else {
                    // Update even without new issues - use callback to get current state
                    setAccumulatedIssues(prevIssues => {
                      onResultsRef.current(prevIssues, initialUrlRef.current || data.url, newCompletedUrls);
                      return prevIssues;
                    });
                  }

                  return newCompletedUrls;
                });

                // Update counters
                if (typeof data.totalProcessed === 'number') {
                  setTotalProcessed(data.totalProcessed);
                }
                if (typeof data.remainingUrls === 'number') {
                  setRemainingUrls(data.remainingUrls);
                }
              }
              break;
          }
        } catch (error) {
          // Error parsing WebSocket message
        }
      };

      ws.onerror = () => {
        // WebSocket error
      };

      ws.onclose = () => {
        // Reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    resetState();

    // Get the URL to analyze
    let urlToAnalyze: string;
    if (values.inputType === "space" && values.spaceId) {
      const selectedSpace = spaces.find(s => s.id === values.spaceId);
      urlToAnalyze = selectedSpace?.url || "";
    } else {
      // Normalize user input URL (add https:// if missing)
      urlToAnalyze = normalizeUserInputUrl(values.url || "");
    }

    setInitialUrl(urlToAnalyze);
    // Clear previous results immediately when starting new analysis
    onResultsRef.current([], '', []);
    mutation.mutate({ url: urlToAnalyze });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {spaces.length > 0 && (
            <FormField
              control={form.control}
              name="inputType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={field.value === "space" ? "default" : "outline"}
                        onClick={() => field.onChange("space")}
                        disabled={mutation.isPending}
                        className="flex-1"
                      >
                        Select Space
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "url" ? "default" : "outline"}
                        onClick={() => field.onChange("url")}
                        disabled={mutation.isPending}
                        className="flex-1"
                      >
                        Enter URL
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {inputType === "space" && spaces.length > 0 ? (
            <FormField
              key="space-field"
              control={form.control}
              name="spaceId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex gap-3">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={mutation.isPending}
                      >
                        <SelectTrigger className="flex-1 h-10">
                          <SelectValue placeholder="Select a space" />
                        </SelectTrigger>
                        <SelectContent>
                          {spaces.map((space) => (
                            <SelectItem key={space.id} value={space.id}>
                              {space.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mutation.isPending ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleCancel}
                          size="default"
                          className="px-6"
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          size="default"
                          className="px-6 bg-primary hover:bg-primary/90"
                        >
                          Analyze
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              key="url-field"
              control={form.control}
              name="url"
              render={({ field }) => {
                // Ensure we only show string values that look like URLs or are empty
                const displayValue = (typeof field.value === 'string' && !field.value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/i))
                  ? field.value
                  : "";

                return (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-3">
                        <Input
                          placeholder="example.com"
                          value={displayValue}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="flex-1 h-10"
                          disabled={mutation.isPending}
                        />
                      {mutation.isPending ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleCancel}
                          size="default"
                          className="px-6"
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          size="default"
                          className="px-6 bg-primary hover:bg-primary/90"
                        >
                          Analyze
                        </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )}
        </div>

        {mutation.isPending && (
          <CheckProgress
            currentUrl={currentUrl}
            totalProcessed={totalProcessed}
            completedUrls={completedUrls}
            remainingUrls={remainingUrls}
          />
        )}
      </form>
    </Form>
  );
}
