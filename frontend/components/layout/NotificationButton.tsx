import { BellIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

import { useGetNotificationStats } from "@/lib/hooks/notifications.hook";

const NotificationButton = () => {
  const { data: stats } = useGetNotificationStats();
  const unreadCount = stats?.unread_count || 0;
  return (
    <Link
      href="/notifications"
      className="relative group rounded-xl hover:bg-accent/80 p-2 h-9 w-9 flex items-center justify-center transition-all duration-200 border border-border/50 hover:border-border"
    >
      <BellIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold border-2 border-background animate-in fade-in zoom-in shadow-md shadow-red-500/20">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationButton;
