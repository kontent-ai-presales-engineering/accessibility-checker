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
  const [checkStep, setCheckStep] = useState(-1);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [progress, setProgress] = useState<{ current: number; total: number; } | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      setCheckStep(0); 
      setCurrentUrl(values.url);
      const res = await apiRequest("POST", "/api/check", values);
      return res.json();
    },
    onSuccess: (data) => {
      setCheckStep(-1); 
      setCurrentUrl(""); 
      setProgress(undefined);
      onResults(data.issues, form.getValues("url"), data.processedUrls);
      toast({
        title: "Analysis Complete",
        description: `Found ${data.issues.length} accessibility issues across ${data.processedUrls.length} pages`,
      });
    },
    onError: (error) => {
      setCheckStep(-1);
      setCurrentUrl("");
      setProgress(undefined);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'processing') {
          setCurrentUrl(data.url);
          if (data.progress) {
            setProgress(data.progress);
          }
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    if (checkStep >= 0 && checkStep < 2) {
      const timer = setTimeout(() => {
        setCheckStep((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [checkStep]);

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
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing
                      </>
                    ) : (
                      "Check Accessibility"
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {checkStep >= 0 && (
          <CheckProgress 
            currentStep={checkStep} 
            currentUrl={currentUrl}
            progress={progress}
          />
        )}
      </form>
    </Form>
  );
}