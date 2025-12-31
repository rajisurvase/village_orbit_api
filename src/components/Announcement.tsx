import { useState, useEffect } from "react";
import { X, Megaphone, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface AnnouncementConfig {
  id: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
  link?: {
    text: string;
    url: string;
  };
  dismissible?: boolean;
  expiresAt?: string; // ISO date string
}

// Configure your announcements here or fetch from API
const ANNOUNCEMENTS: AnnouncementConfig[] = [
  // Example announcement - uncomment to show
  // {
  //   id: "maintenance-2025",
  //   message: "Scheduled maintenance on January 1st, 2025 from 2:00 AM to 4:00 AM IST.",
  //   type: "warning",
  //   dismissible: true,
  //   expiresAt: "2025-01-02T00:00:00",
  // },
  // {
  //   id: "new-feature",
  //   message: "🎉 New feature: Online exam system is now live!",
  //   type: "success",
  //   link: { text: "Try it now", url: "/exams" },
  //   dismissible: true,
  // },
];

const typeStyles = {
  info: {
    bg: "bg-blue-600",
    icon: Info,
  },
  warning: {
    bg: "bg-amber-500",
    icon: AlertTriangle,
  },
  success: {
    bg: "bg-green-600",
    icon: CheckCircle,
  },
  alert: {
    bg: "bg-red-600",
    icon: Megaphone,
  },
};

export function Announcement() {
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<AnnouncementConfig[]>([]);

  useEffect(() => {
    // Filter out expired and dismissed announcements
    const now = new Date();
    const dismissedIds = JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");

    const active = ANNOUNCEMENTS.filter((announcement) => {
      // Check if dismissed
      if (dismissedIds.includes(announcement.id)) return false;

      // Check if expired
      if (announcement.expiresAt && new Date(announcement.expiresAt) < now) return false;

      return true;
    });

    setVisibleAnnouncements(active);
  }, []);

  const dismissAnnouncement = (id: string) => {
    const dismissedIds = JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");
    localStorage.setItem("dismissedAnnouncements", JSON.stringify([...dismissedIds, id]));
    setVisibleAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="announcement-banner">
      {visibleAnnouncements.map((announcement) => {
        const { bg, icon: Icon } = typeStyles[announcement.type];

        return (
          <div
            key={announcement.id}
            className={`${bg} text-white px-4 py-2 text-center text-sm font-medium relative`}
          >
            <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{announcement.message}</span>
              {announcement.link && (
                <a
                  href={announcement.link.url}
                  className="underline hover:no-underline font-semibold ml-1"
                >
                  {announcement.link.text} →
                </a>
              )}
            </div>
            {announcement.dismissible && (
              <button
                onClick={() => dismissAnnouncement(announcement.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded"
                aria-label="Dismiss announcement"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Announcement;
