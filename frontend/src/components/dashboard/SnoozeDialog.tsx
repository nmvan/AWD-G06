import { Clock, X, Sun, Moon, Calendar, CalendarClock, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SnoozeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSnooze: (date: Date) => void;
}

export function SnoozeDialog({ isOpen, onClose, onSnooze }: SnoozeDialogProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customDate, setCustomDate] = useState("");

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsCustomMode(false);
      setCustomDate("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSnooze = (type: "later" | "tomorrow" | "nextWeek") => {
    const now = new Date();
    let snoozeDate = new Date();

    switch (type) {
      case "later":
        // +4 hours
        snoozeDate.setHours(now.getHours() + 4);
        break;
      case "tomorrow":
        // 9:00 AM next day
        snoozeDate.setDate(now.getDate() + 1);
        snoozeDate.setHours(9, 0, 0, 0);
        break;
      case "nextWeek":
        // Next Monday 9:00 AM
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1) + 7; // Next Monday
        snoozeDate.setDate(diff);
        snoozeDate.setHours(9, 0, 0, 0);
        break;
    }
    onSnooze(snoozeDate);
    onClose();
  };

  const handleCustomSnooze = () => {
    if (!customDate) return;
    const date = new Date(customDate);

    // Basic validation
    if (isNaN(date.getTime())) return;
    if (date < new Date()) {
      toast.error("Please select a future date and time");
      return; // Prevent past dates
    }

    onSnooze(date);
    onClose();
  };

  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const nowString = new Date(now.getTime() - offset).toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-sm border border-border p-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          {isCustomMode ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCustomMode(false)}
                className="text-muted-foreground hover:text-foreground rounded-full p-1 hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold">Pick Date & Time</h3>
            </div>
          ) : (
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Snooze until...
            </h3>
          )}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-full p-1 hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isCustomMode ? (
          <div className="space-y-2">
            <button
              onClick={() => handleSnooze("later")}
              className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Later today</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">
                +4 hours
              </span>
            </button>

            <button
              onClick={() => handleSnooze("tomorrow")}
              className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Tomorrow</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">
                9:00 AM
              </span>
            </button>

            <button
              onClick={() => handleSnooze("nextWeek")}
              className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Next Week</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">
                Mon, 9:00 AM
              </span>
            </button>

            <button
              onClick={() => {
                setIsCustomMode(true);
                setCustomDate(nowString);
              }}
              className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <CalendarClock className="w-4 h-4 text-green-500" />
                <span className="font-medium">Pick Date & Time</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Select a future date and time
              </label>
              <input
                type="datetime-local"
                min={nowString}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCustomMode(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCustomSnooze}
                disabled={!customDate}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
