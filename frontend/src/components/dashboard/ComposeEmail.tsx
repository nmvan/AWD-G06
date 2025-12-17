import { useState, useRef, useEffect } from "react";
import { X, Minus, Maximize2, Minimize2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendEmail, replyEmail, forwardEmail } from "@/services/apiService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type Email } from "@/data/mockData";

interface ComposeEmailProps {
  onClose: () => void;
  mode?: "compose" | "reply" | "forward";
  originalEmail?: Email | null;
}

export function ComposeEmail({ onClose, mode = "compose", originalEmail }: ComposeEmailProps) {
  const [to, setTo] = useState(() => {
    if (mode === "reply" && originalEmail) {
      return originalEmail.senderEmail;
    }
    return "";
  });
  const [subject, setSubject] = useState(() => {
    if (mode === "reply" && originalEmail) {
      return originalEmail.subject.startsWith("Re:") ? originalEmail.subject : `Re: ${originalEmail.subject}`;
    }
    if (mode === "forward" && originalEmail) {
      return originalEmail.subject.startsWith("Fwd:") ? originalEmail.subject : `Fwd: ${originalEmail.subject}`;
    }
    return "";
  });
  const [body, setBody] = useState(() => {
    if (mode === "forward" && originalEmail) {
       return `<br><br><div class="gmail_quote"><div dir="ltr" class="gmail_attr">---------- Forwarded message ---------<br>From: <strong>${originalEmail.sender}</strong> &lt;${originalEmail.senderEmail}&gt;<br>Date: ${originalEmail.timestamp}<br>Subject: ${originalEmail.subject}<br>To: ${originalEmail.recipient || "Me"}<br></div><br>${originalEmail.body}</div>`;
    }
    return "";
 });
  const [isSending, setIsSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  const checkFormats = () => {
    setFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    });
  };

  useEffect(() => {
    if (editorRef.current && body) {
        if (editorRef.current.innerHTML === "") {
            editorRef.current.innerHTML = body;
        }
    }
  }, []);

  const execFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        setBody(editorRef.current.innerHTML);
        editorRef.current.focus();
    }
    checkFormats();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to && mode !== "reply") {
      toast.error("Please specify a recipient.");
      return;
    }
    
    setIsSending(true);
    try {
      // Use the current HTML content from the editor
      const content = editorRef.current?.innerHTML || body;

      if (mode === "reply" && originalEmail) {
        await replyEmail(originalEmail.id, content);
      } else if (mode === "forward" && originalEmail) {
        await forwardEmail(originalEmail.id, to, subject, content);
      } else {
        await sendEmail(to, subject, content);
      }

      toast.success("Email sent successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-20 w-64 bg-white border border-gray-300 rounded-t-lg shadow-lg z-[100] flex justify-between items-center p-3 cursor-pointer" onClick={() => setIsMinimized(false)}>
        <span className="font-medium truncate text-sm">New Message</span>
        <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} className="hover:bg-gray-100 p-1 rounded"><Minus size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="hover:bg-gray-100 p-1 rounded"><X size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isMaximized && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90]" 
          onClick={() => setIsMaximized(false)}
        />
      )}
      <div 
        className={cn(
          "bg-white flex flex-col font-sans transition-all duration-200 ease-in-out z-[100] shadow-xl overflow-hidden",
          isMaximized 
            ? "fixed inset-10 rounded-lg border border-gray-200" 
            : "fixed bottom-0 right-20 w-[500px] h-[500px] border border-gray-300 rounded-t-lg"
        )}
      >
        {/* Header */}
        <div 
          className="flex justify-between items-center px-4 py-2 bg-[#f2f6fc] border-b border-gray-200 cursor-pointer shrink-0" 
          onClick={() => !isMaximized && setIsMinimized(true)}
        >
          <span className="font-medium text-sm text-gray-700">New Message</span>
          <div className="flex gap-2 text-gray-600">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} 
              className="hover:bg-gray-200 p-1 rounded"
            >
              <Minus size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }} 
              className="hover:bg-gray-200 p-1 rounded"
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="hover:bg-gray-200 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="flex flex-col flex-1 overflow-hidden">
          <div className="border-b border-gray-200 shrink-0">
              <Input 
                  placeholder="To" 
                  value={to} 
                  onChange={(e) => setTo(e.target.value)} 
                  disabled={mode === "reply"}
                  className="border-none shadow-none focus-visible:ring-0 px-4 py-3 text-sm rounded-none disabled:opacity-50"
              />
          </div>
          <div className="border-b border-gray-200 shrink-0">
              <Input 
                  placeholder="Subject" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  disabled={mode === "reply"}
                  className="border-none shadow-none focus-visible:ring-0 px-4 py-3 text-sm rounded-none disabled:opacity-50"
              />
          </div>
          <div 
            ref={editorRef}
            contentEditable
            className="flex-1 w-full overflow-auto p-4 text-sm focus:outline-none"
            onInput={(e) => setBody(e.currentTarget.innerHTML)}
            onKeyUp={checkFormats}
            onMouseUp={checkFormats}
            style={{ minHeight: "200px" }}
          />

          {/* Formatting Toolbar */}
          {showFormatting && (
            <div className="flex items-center gap-1 px-4 py-2 border-t border-gray-100 bg-gray-50">
               <button type="button" onMouseDown={(e) => { e.preventDefault(); execFormat('bold'); }} className={cn("p-1 hover:bg-gray-200 rounded text-gray-600", formats.bold && "bg-gray-300 text-black")} title="Bold"><Bold size={16} /></button>
               <button type="button" onMouseDown={(e) => { e.preventDefault(); execFormat('italic'); }} className={cn("p-1 hover:bg-gray-200 rounded text-gray-600", formats.italic && "bg-gray-300 text-black")} title="Italic"><Italic size={16} /></button>
               <button type="button" onMouseDown={(e) => { e.preventDefault(); execFormat('underline'); }} className={cn("p-1 hover:bg-gray-200 rounded text-gray-600", formats.underline && "bg-gray-300 text-black")} title="Underline"><Underline size={16} /></button>
               <div className="w-px h-4 bg-gray-300 mx-1" />
               <button type="button" onMouseDown={(e) => { e.preventDefault(); execFormat('justifyLeft'); }} className={cn("p-1 hover:bg-gray-200 rounded text-gray-600", formats.justifyLeft && "bg-gray-300 text-black")} title="Align Left"><AlignLeft size={16} /></button>
               <button type="button" onMouseDown={(e) => { e.preventDefault(); execFormat('justifyCenter'); }} className={cn("p-1 hover:bg-gray-200 rounded text-gray-600", formats.justifyCenter && "bg-gray-300 text-black")} title="Align Center"><AlignCenter size={16} /></button>
               <button type="button" onMouseDown={(e) => { e.preventDefault(); execFormat('justifyRight'); }} className={cn("p-1 hover:bg-gray-200 rounded text-gray-600", formats.justifyRight && "bg-gray-300 text-black")} title="Align Right"><AlignRight size={16} /></button>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center p-3 border-t border-gray-100 mt-auto shrink-0">
            <div className="flex gap-2 items-center">
              <Button 
                  type="submit" 
                  disabled={isSending}
                  className="bg-[#0b57d0] hover:bg-[#0b57d0]/90 text-white rounded-full px-6 h-9 font-medium text-sm"
              >
                {isSending ? "Sending..." : "Send"}
              </Button>
              {/* Formatting options placeholders */}
              <div className="flex items-center gap-1 text-gray-500 ml-2">
                  <span 
                    className={cn("p-2 hover:bg-gray-100 rounded cursor-pointer font-bold text-gray-600", showFormatting && "bg-gray-200")}
                    onClick={() => setShowFormatting(!showFormatting)}
                    title="Formatting options"
                  >
                    A
                  </span>
              </div>
            </div>
            <div className="text-gray-500">
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                  <X size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
