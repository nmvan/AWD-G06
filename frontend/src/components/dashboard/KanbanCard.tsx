import { useState, memo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { cva } from "class-variance-authority";
import type { Email } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Clock, GripVertical, Maximize2 } from "lucide-react";
import { SnoozeDialog } from "./SnoozeDialog";
import { AISummaryWidget } from "./AISummaryWidget";

const cardVariants = cva(
  "rounded-lg border shadow-sm p-4 mb-3 select-none transition-all cursor-pointer bg-card text-card-foreground",
  {
    variants: {
      isDragging: {
        true: "shadow-lg ring-2 ring-primary/20 scale-[1.02] z-50",
        false: "hover:shadow-md hover:border-primary/50",
      },
      isRead: {
        true: "opacity-80",
        false: "opacity-100",
      }
    },
    defaultVariants: {
      isDragging: false,
      isRead: false,
    },
  }
);

interface KanbanCardProps {
  email: Email;
  index: number;
  columnId?: string;
  onSnooze: (emailId: string, date: Date, sourceFolder?: string) => void;
  onOpenMail: (emailId: string) => void;
  isDraggable?: boolean;
}

export const KanbanCard = memo(function KanbanCard({ email, index, columnId, onSnooze, onOpenMail, isDraggable = true }: KanbanCardProps) {
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  const renderCard = (provided?: any, snapshot?: any) => (
    <div
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      onClick={() => onOpenMail(email.id)}
      className={cn(cardVariants({ isDragging: snapshot?.isDragging || false, isRead: email.isRead }))}
      style={provided?.draggableProps?.style}
    >
      {/* Header: Sender & Actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", email.avatarColor || "bg-gray-500")}>
            {email.sender.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className={cn("text-sm leading-none", !email.isRead ? "font-bold" : "font-normal")}>{email.sender}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{email.timestamp}</span>
              {!email.isRead && (
                <span className="w-2 h-2 bg-blue-500 rounded-full" title="Unread" />
              )}
            </div>
          </div>
        </div>
        {isDraggable && (
          <div 
            className="cursor-grab text-muted-foreground/50 hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Subject */}
      <h4 className={cn("text-sm mb-2 line-clamp-1", !email.isRead ? "font-bold" : "font-normal")}>{email.subject}</h4>

      {/* AI Summary Section */}
      <AISummaryWidget emailId={email.id} preview={email.preview} />

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-2">
        {columnId === 'snoozed' && email.snoozeUntil ? (
          <div className="flex items-center gap-2 text-xs text-orange-500 font-medium">
            <Clock className="w-3 h-3" />
            <span>{formatDate(email.snoozeUntil)}</span>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSnoozeOpen(true);
            }}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Clock className="w-3 h-3" />
            <span>Snooze</span>
          </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onOpenMail(email.id);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <span>Open Mail</span>
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <SnoozeDialog
        isOpen={isSnoozeOpen}
        onClose={() => setIsSnoozeOpen(false)}
        onSnooze={(date) => onSnooze(email.id, date, columnId)}
      />
      {isDraggable ? (
        <Draggable draggableId={email.id} index={index}>
          {(provided, snapshot) => renderCard(provided, snapshot)}
        </Draggable>
      ) : (
        renderCard()
      )}
    </>
  );
});
