import { X, Loader2 } from "lucide-react";
import { EmailDetail } from "./EmailDetail";
import type { Email } from "@/data/mockData";
import { Button } from "@/components/ui/button";

interface EmailDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: Email | null;
  isLoading?: boolean;
  onAction: (action: "toggleRead" | "delete" | "star" | "reply" | "forward") => void;
}

export function EmailDetailDialog({ isOpen, onClose, email, isLoading, onAction }: EmailDetailDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl h-[80vh] bg-background rounded-lg shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">Email Details</span>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : email ? (
            <EmailDetail email={email} onAction={onAction} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select an email to view details
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
