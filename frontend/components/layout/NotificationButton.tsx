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
      title={`${unreadCount} unread notifications`}
    >
      <BellIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500/60 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 dark:bg-red-500"></span>
        </span>
      )}
    </Link>
  );
};

export default NotificationButton;
