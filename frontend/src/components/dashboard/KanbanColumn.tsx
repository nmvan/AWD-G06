import { useEffect, useRef } from "react";
import { Droppable } from "@hello-pangea/dnd";
import type { Email } from "@/data/mockData";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface KanbanColumnProps {
  id: string;
  title: string;
  emails: Email[];
  count: number;
  color?: string;
  onSnooze: (emailId: string, date: Date, sourceFolder?: string) => void;
  onOpenMail: (emailId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export function KanbanColumn({
  id,
  title,
  emails,
  count,
  color = "bg-gray-500",
  onSnooze,
  onOpenMail,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: KanbanColumnProps) {
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
    <div className="flex flex-col h-full flex-1 min-w-[250px] bg-muted/10 rounded-xl border border-border/50">
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/50 bg-background/50 rounded-t-xl backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className={cn("w-1 h-4 rounded-full", color)} />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/80">{title}</h3>
          <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(
              "flex-1 p-3 overflow-y-auto transition-colors min-h-[150px]",
              snapshot.isDraggingOver ? "bg-muted/20" : ""
            )}
          >
            {emails.map((email, index) => (
              <KanbanCard
                key={email.id}
                email={email}
                index={index}
                columnId={id}
                onSnooze={onSnooze}
                onOpenMail={onOpenMail}
              />
            ))}
            {provided.placeholder}

            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="h-4 w-full" />

            {isLoadingMore && (
              <div className="flex justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
