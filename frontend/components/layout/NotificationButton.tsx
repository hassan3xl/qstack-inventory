import { BellIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const NotificationButton = () => {
  const notification = {
    messages: 4,
  };
  return (
    <Link
      href="/notifications"
      className="relative group rounded-md bg-background p-2"
    >
      <BellIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
      {notification.messages > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-in fade-in zoom-in">
          {notification.messages}
        </span>
      )}
    </Link>
  );
};

export default NotificationButton;
