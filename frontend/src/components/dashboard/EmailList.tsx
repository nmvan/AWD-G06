import { useEffect, useRef } from "react";
import type { Email } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: EmailListProps) {
  const { user } = useAuth();
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div className="flex flex-col h-full border-r">
      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No emails found.
          </div>
        ) : (
          <div className="flex flex-col">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => onSelectEmail(email.id)}
                className={cn(
                  "flex flex-col items-start gap-2 p-4 text-left border-b transition-colors hover:bg-muted/50",
                  selectedEmailId === email.id ? "bg-muted" : "bg-background",
                  !email.isRead && "font-semibold" // Bold if unread
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {email.folder.toLowerCase() === "sent" && email.recipient
                        ? `To: ${user && (email.recipientEmail === user.email || email.recipient === user.email) ? "Me" : email.recipient}`
                        : (user && (email.senderEmail === user.email || email.sender === user.email) ? "Me" : email.sender)}
                    </span>
                    {!email.isRead && (
                      <span className="flex size-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {email.timestamp}
                  </span>
                </div>
                <div className="text-sm font-medium leading-none">
                  {email.subject}
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {email.preview}
                </div>
                <div className="flex items-center gap-2 mt-1">
                   {email.isStarred && (
                       <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Important</span>
                   )}
                   <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">{email.folder}</span>
                </div>
              </button>
            ))}

            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="h-4 w-full" />

            {isLoadingMore && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}