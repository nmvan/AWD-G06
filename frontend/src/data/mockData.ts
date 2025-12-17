// src/data/mockData.ts

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  recipient?: string;
  recipientEmail?: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  folder: string; // e.g., "inbox", "sent", "trash"
  avatarColor?: string;
  attachments?: Attachment[];
  snoozeUntil?: string; // ISO Date string
}

export const FOLDERS = [
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "sent", label: "Sent", icon: "send" },
  { id: "drafts", label: "Drafts", icon: "file" },
  { id: "starred", label: "Starred", icon: "star" },
  { id: "trash", label: "Trash", icon: "trash" },
  { id: "archive", label: "Archive", icon: "archive" },
];

export const MOCK_EMAILS: Email[] = [
  {
    id: "1",
    sender: "Alice Williams",
    senderEmail: "alice@example.com",
    subject: "Project Update: Q4 Goals",
    preview: "Hi team, just wanted to share the latest updates on...",
    body: "<p>Hi team,</p><p>Just wanted to share the latest updates on the Q4 goals. We are on track to meet our targets.</p><p>Best,<br>Alice</p>",
    timestamp: "10:30 AM",
    isRead: false,
    isStarred: true,
    folder: "inbox",
    avatarColor: "bg-blue-500",
  },
  {
    id: "2",
    sender: "Google Cloud",
    senderEmail: "no-reply@google.com",
    subject: "Security Alert",
    preview: "New sign-in detected on your account...",
    body: "<p>We detected a new sign-in to your account from a generic device.</p>",
    timestamp: "Yesterday",
    isRead: true,
    isStarred: false,
    folder: "inbox",
    avatarColor: "bg-red-500",
  },
  {
    id: "3",
    sender: "Bob Smith",
    senderEmail: "bob@work.com",
    subject: "Lunch tomorrow?",
    preview: "Hey, are you free for lunch tomorrow at 12?",
    body: "Hey, are you free for lunch tomorrow at 12? I want to try that new pizza place.",
    timestamp: "2 days ago",
    isRead: true,
    isStarred: false,
    folder: "inbox",
    avatarColor: "bg-green-500",
  },
  {
    id: "4",
    sender: "HR Department",
    senderEmail: "hr@company.com",
    subject: "Holiday Schedule",
    preview: "Please find attached the holiday schedule for 2024.",
    body: "Please find attached the holiday schedule for 2024. Let us know if you have questions.",
    timestamp: "Last Week",
    isRead: false,
    isStarred: false,
    folder: "archive",
    avatarColor: "bg-purple-500",
  },
];