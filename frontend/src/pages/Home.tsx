// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { EmailList } from "@/components/dashboard/EmailList";
import { EmailDetail } from "@/components/dashboard/EmailDetail";
import { EmailDetailDialog } from "@/components/dashboard/EmailDetailDialog";
import { ComposeEmail } from "@/components/dashboard/ComposeEmail";
import { SnoozeDialog } from "@/components/dashboard/SnoozeDialog";
import { useAuth } from "@/contexts/AuthContext";
import { type Email } from "@/data/mockData";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { KanbanCard } from "@/components/dashboard/KanbanCard";
import { cn } from "@/lib/utils";
import { LogOut, Search, ArrowLeft } from "lucide-react";
import { useEmailLogic } from "@/hooks/useEmailLogic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { logout } = useAuth();

  // Dashboard State
  const [selectedFolder, setSelectedFolder] = useState<string>("INBOX");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<
    "compose" | "reply" | "forward"
  >("compose");
  const [composeOriginalEmail, setComposeOriginalEmail] =
    useState<Email | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">(
    () => (localStorage.getItem("viewMode") as "list" | "kanban") || "list"
  );
  const [isKanbanDetailOpen, setIsKanbanDetailOpen] = useState(false);
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);
  const [snoozeTargetId, setSnoozeTargetId] = useState<string | null>(null);
  const [snoozeSourceFolder, setSnoozeSourceFolder] = useState<
    string | undefined
  >(undefined);

  // Search State
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "unread" | "has_attachment">("all");

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  // Custom Hook for Business Logic
  const {
    emails,
    fetchNextList,
    hasNextList,
    isFetchingNextList,
    folders,
    kanbanData,
    selectedEmail,
    isLoadingList,
    isLoadingKanban,
    isLoadingDetail,
    moveEmail,
    snoozeEmail,
    executeEmailAction,
    searchResults,
    isLoadingSearch,
    searchError,
  } = useEmailLogic({
    selectedFolder,
    selectedEmailId,
    viewMode,
    searchQuery: activeSearchQuery,
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      setActiveSearchQuery(searchInput);
      setSearchFilter("all");
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearchQuery("");
    setSearchFilter("all");
  };

  // UI Handlers
  const handleSnooze = (emailId: string, date: Date, sourceFolder?: string) => {
    const folder = sourceFolder || snoozeSourceFolder;
    snoozeEmail(emailId, date, folder);
    setIsSnoozeOpen(false);
    setSnoozeTargetId(null);
    setSnoozeSourceFolder(undefined);
  };

  const handleOpenMail = (emailId: string) => {
    setSelectedEmailId(emailId);
    setIsKanbanDetailOpen(true);

    const allKanbanEmails = [
      ...kanbanData.inbox.emails,
      ...kanbanData.todo.emails,
      ...kanbanData.done.emails,
      ...kanbanData.snoozed.emails,
    ];
    const email = allKanbanEmails.find((e: any) => e.id === emailId);
    if (email && !email.isRead) {
      executeEmailAction("markAsRead", { id: emailId, email });
    }
  };

  const handleMoveEmail = (
    emailId: string,
    sourceFolder: string,
    destinationFolder: string
  ) => {
    if (destinationFolder === "snoozed") {
      setSnoozeTargetId(emailId);
      setSnoozeSourceFolder(sourceFolder);
      setIsSnoozeOpen(true);
      return;
    }
    moveEmail(emailId, destinationFolder, sourceFolder);
  };

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    const email = emails.find((e: any) => e.id === id);
    if (email && !email.isRead) {
      executeEmailAction("markAsRead", { id, email });
    }
  };

  const handleEmailAction = (
    action: "toggleRead" | "delete" | "star" | "reply" | "forward"
  ) => {
    if (!selectedEmailId || !selectedEmail) return;

    if (action === "reply") {
      setComposeMode("reply");
      setComposeOriginalEmail(selectedEmail);
      setIsComposeOpen(true);
      return;
    }

    if (action === "forward") {
      setComposeMode("forward");
      setComposeOriginalEmail(selectedEmail);
      setIsComposeOpen(true);
      return;
    }

    executeEmailAction(action, { id: selectedEmailId, email: selectedEmail });

    if (action === "delete") {
      setIsKanbanDetailOpen(false);
      setSelectedEmailId(null);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* COLUMN 1: SIDEBAR */}
      <aside
        className={cn(
          "hidden md:flex w-64 flex-col shrink-0 border-r transition-all duration-300 ease-in-out",
          viewMode === "kanban" && "hidden md:hidden"
        )}
      >
        <Sidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onSelectFolder={(id) => {
            setSelectedFolder(id);
            setSelectedEmailId(null);
          }}
          onCompose={() => {
            setComposeMode("compose");
            setComposeOriginalEmail(null);
            setIsComposeOpen(true);
          }}
        />
        <div className="p-4 border-t bg-muted/20">
          <button
            onClick={logout}
            className="text-sm font-medium text-red-600 hover:underline cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar with Toggle */}
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background shrink-0 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="font-semibold text-lg shrink-0">
              {viewMode === "list" ? "Search" : "Kanban Board"}
            </h2>
            <div className="flex items-center gap-2 max-w-md w-full">
              <Input
                placeholder="Search emails..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="h-9"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-lg p-1 bg-muted/20">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-3 py-1 text-sm rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-background shadow-sm font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "px-3 py-1 text-sm rounded-md transition-colors",
                  viewMode === "kanban"
                    ? "bg-background shadow-sm font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Kanban
              </button>
            </div>

            {viewMode === "kanban" && (
              <button
                onClick={logout}
                className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {activeSearchQuery ? (
            <div className="flex-1 p-4 overflow-y-auto bg-muted/10">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleClearSearch}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Board
                  </Button>
                  <h2 className="text-lg font-semibold">
                    Search Results for "{activeSearchQuery}"
                  </h2>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">Filter:</span>
                  <Button
                    variant={searchFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={searchFilter === "unread" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchFilter("unread")}
                  >
                    Unread
                  </Button>
                  <Button
                    variant={searchFilter === "has_attachment" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchFilter("has_attachment")}
                  >
                    Has Attachment
                  </Button>
                </div>
              </div>

              {isLoadingSearch ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Searching...
                </div>
              ) : searchError ? (
                <div className="flex items-center justify-center h-64 text-red-500">
                  Error searching emails.
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                  {searchResults
                    .filter((email) => {
                      if (searchFilter === "unread") return !email.isRead;
                      if (searchFilter === "has_attachment")
                        return (
                          email.attachments && email.attachments.length > 0
                        );
                      return true;
                    })
                    .map((email, index) => (
                      <KanbanCard
                        key={email.id}
                        email={email}
                        index={index}
                        onSnooze={(id, date) => handleSnooze(id, date)}
                        onOpenMail={handleOpenMail}
                        isDraggable={false}
                      />
                    ))}
                  {searchResults.filter((email) => {
                    if (searchFilter === "unread") return !email.isRead;
                    if (searchFilter === "has_attachment")
                      return email.attachments && email.attachments.length > 0;
                    return true;
                  }).length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      No results found.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : viewMode === "kanban" ? (
            <div className="flex-1 p-4 overflow-hidden bg-muted/10">
              {isLoadingKanban ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading Kanban...
                </div>
              ) : (
                <KanbanBoard
                  kanbanData={kanbanData}
                  onMoveEmail={handleMoveEmail}
                  onSnooze={(id, date) => {
                    if (date) {
                      handleSnooze(id, date);
                    } else {
                      setSnoozeTargetId(id);
                      setIsSnoozeOpen(true);
                    }
                  }}
                  onOpenMail={handleOpenMail}
                />
              )}
            </div>
          ) : (
            <>
              {/* COLUMN 2: EMAIL LIST */}
              <div
                className={`flex-1 md:flex md:w-[400px] md:flex-none flex-col border-r bg-background
                 ${selectedEmailId ? "hidden md:flex" : "flex"} 
              `}
              >
                {isLoadingList ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Loading emails...
                  </div>
                ) : (
                  <EmailList
                    emails={emails}
                    selectedEmailId={selectedEmailId}
                    onSelectEmail={handleSelectEmail}
                    onLoadMore={fetchNextList}
                    hasMore={hasNextList}
                    isLoadingMore={isFetchingNextList}
                  />
                )}
              </div>

              {/* COLUMN 3: EMAIL DETAIL */}
              <main
                className={`flex-1 flex-col bg-background
                  ${!selectedEmailId ? "hidden md:flex" : "flex"}
              `}
              >
                {selectedEmailId && (
                  <div className="md:hidden p-2 border-b flex items-center">
                    <button
                      onClick={() => setSelectedEmailId(null)}
                      className="text-sm font-medium text-blue-600 px-2 py-1"
                    >
                      &larr; Back to list
                    </button>
                  </div>
                )}
                {isLoadingDetail ? (
                  <div className="p-8 text-center">Loading detail...</div>
                ) : (
                  <EmailDetail
                    email={selectedEmail}
                    onAction={handleEmailAction}
                  />
                )}
              </main>
            </>
          )}
        </div>
      </div>

      {/* COMPOSE EMAIL MODAL */}
      {isComposeOpen && (
        <ComposeEmail
          onClose={() => setIsComposeOpen(false)}
          mode={composeMode}
          originalEmail={composeOriginalEmail}
        />
      )}

      {/* Dialogs */}
      <SnoozeDialog
        isOpen={isSnoozeOpen}
        onClose={() => {
          setIsSnoozeOpen(false);
          setSnoozeTargetId(null);
        }}
        onSnooze={(date) => {
          if (snoozeTargetId) {
            handleSnooze(snoozeTargetId, date);
          }
        }}
      />

      {/* KANBAN EMAIL DETAIL MODAL */}
      <EmailDetailDialog
        isOpen={isKanbanDetailOpen}
        onClose={() => {
          setIsKanbanDetailOpen(false);
          setSelectedEmailId(null);
        }}
        email={selectedEmail}
        isLoading={isLoadingDetail}
        onAction={handleEmailAction}
      />
    </div>
  );
}
