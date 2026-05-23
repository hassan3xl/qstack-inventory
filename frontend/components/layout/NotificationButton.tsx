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
      className="relative group rounded-md bg-background p-2"
    >
      <BellIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-in fade-in zoom-in">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationButton;
