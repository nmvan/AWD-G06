import { useState, useRef, useEffect, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { fetchEmailSummary } from "@/services/apiService";

interface AISummaryWidgetProps {
  emailId: string;
  preview: string;
}

export const AISummaryWidget = memo(function AISummaryWidget({ emailId, preview }: AISummaryWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (summaryRef.current) {
      observer.observe(summaryRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["summary", emailId],
    queryFn: () => fetchEmailSummary(emailId),
    enabled: isVisible,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return (
    <div 
      ref={summaryRef}
      className="bg-muted/50 rounded-md p-3 mb-3 border border-border/50"
    >
      <div className="flex items-center gap-1.5 mb-1 text-xs font-medium text-primary">
        <Sparkles className="w-3 h-3" />
        <span>AI Summary</span>
      </div>
      {isSummaryLoading ? (
        <div className="space-y-1.5 animate-pulse">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 animate-spin" />
            <span>Generating summary...</span>
          </div>
          <div className="h-3 bg-muted-foreground/20 rounded w-full" />
          <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {summary || preview}
        </p>
      )}
    </div>
  );
});
