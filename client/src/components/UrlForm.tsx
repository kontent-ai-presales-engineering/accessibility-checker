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
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AccessibilityIssue } from "@/lib/wcag";
import { Loader2 } from "lucide-react";
import CheckProgress from "./CheckProgress";
import { useState, useEffect } from "react";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

interface UrlFormProps {
  onResults: (issues: AccessibilityIssue[], url: string, processedUrls: string[]) => void;
}

export default function UrlForm({ onResults }: UrlFormProps) {
  const { toast } = useToast();
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [completedUrls, setCompletedUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<'analyzing' | 'completed' | 'batch_start'>('analyzing');
  const [ws, setWs] = useState<WebSocket | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: { url: string }) => {
      const res = await apiRequest('POST', '/api/check', data);
      return res.json();
    },
    onSuccess: (data) => {
      onResults(data.issues, data.url, data.processedUrls);
      if (ws) {
        ws.close();
      }
      // Reset state
      setCurrentUrl(undefined);
      setTotalProcessed(0);
      setCurrentBatch(0);
      setCompletedUrls([]);
      toast({
        title: data.cancelled ? "Analysis Cancelled" : "Analysis Complete",
        description: `Found ${data.issues.length} accessibility issues across ${data.processedUrls.length} pages${data.cancelled ? ' (partial results)' : ''}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      if (ws) {
        ws.close();
      }
      // Reset state
      setCurrentUrl(undefined);
      setTotalProcessed(0);
      setCurrentBatch(0);
      setCompletedUrls([]);
    }
  });

  const handleCancel = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'cancel' }));
      toast({
        title: "Cancelling...",
        description: "Analysis will stop after the current batch completes.",
      });
    }
  };

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newWs = new WebSocket(wsUrl);

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'processing') {
          setCurrentUrl(data.url);
          setStatus('analyzing');
        } else if (data.type === 'completed') {
          setCompletedUrls(prev => [...prev, data.url]);
          setStatus('completed');
        } else if (data.type === 'batch_start') {
          setCurrentBatch(data.currentBatch);
          setTotalProcessed(data.totalProcessed);
          setStatus('batch_start');
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(newWs);

    return () => {
      if (newWs.readyState === WebSocket.OPEN) {
        newWs.close();
      }
    };
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter website URL (e.g., https://example.com)"
                    {...field}
                    className="flex-1"
                  />
                  {mutation.isPending ? (
                    <Button 
                      type="button" 
                      variant="destructive"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button type="submit">
                      Check Accessibility
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {mutation.isPending && (
          <CheckProgress 
            currentUrl={currentUrl}
            totalProcessed={totalProcessed}
            currentBatch={currentBatch}
            completedUrls={completedUrls}
            status={status}
          />
        )}
      </form>
    </Form>
  );
}