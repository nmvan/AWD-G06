import { cn } from "@/lib/utils";
import { Inbox, Send, File, Star, Trash2, Archive, Pencil, Mail } from "lucide-react";

interface SidebarProps {
  folders: { id: string; label: string; icon: string }[];
  selectedFolder: string;
  onSelectFolder: (folderId: string) => void;
  onCompose: () => void;
}

// Map string icon names to Lucide components
const iconMap: Record<string, any> = {
  inbox: Inbox,
  send: Send,
  file: File,
  star: Star,
  trash: Trash2,
  archive: Archive,
  unread: Mail,
};

export function Sidebar({ folders, selectedFolder, onSelectFolder, onCompose }: SidebarProps) {
  // Filter out CHAT, remove CATEGORY_ prefix, and sort INBOX to top
  const processedFolders = folders
    .filter((f) => f.id !== "CHAT")
    .map((f) => ({
      ...f,
      label: f.label.replace("CATEGORY_", ""),
    }))
    .sort((a, b) => {
      const idA = a.id.toUpperCase();
      const idB = b.id.toUpperCase();

      const order = ["INBOX", "STARRED", "SENT", "DRAFT", "TRASH", "UNREAD"];
      const indexA = order.indexOf(idA);
      const indexB = order.indexOf(idB);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return 0;
    });

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col py-4 gap-2 border-r bg-muted/20">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold tracking-tight mb-4">Mail App</h2>
        <button 
          onClick={onCompose}
          className="flex items-center gap-2 bg-[#c2e7ff] hover:bg-[#b3d7ef] text-[#001d35] px-6 py-4 rounded-2xl font-medium transition-colors shadow-sm"
        >
          <Pencil className="size-5" />
          Compose email
        </button>
      </div>
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {processedFolders.map((folder) => {
          const Icon = iconMap[folder.icon] || Inbox;
          const isSelected = selectedFolder === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-r-full transition-colors",
                isSelected
                  ? "bg-[#d3e3fd] text-[#001d35]"
                  : "text-gray-700 hover:bg-gray-200"
              )}
            >
              <Icon className="size-4" />
              <span className="capitalize">{folder.label.toLowerCase()}</span>
              {folder.id === "INBOX" && (
                <span className="ml-auto text-xs font-bold"></span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}