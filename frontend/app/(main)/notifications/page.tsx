"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Check,
  Trash2,
  Settings,
  Filter,
  CheckCheck,
  User,
  MessageSquare,
  Heart,
  DollarSign,
  AlertCircle,
  X,
} from "lucide-react";


type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
}

import {
  useGetNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "@/lib/hooks/notifications.hook";
import { string } from "zod";

const NotificationsPage = () => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { data: fetchedNotifications = [] } = useGetNotifications();
  const notifications = fetchedNotifications as Notification[];

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const clearAllNotificationsMutation = useClearAllNotifications();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: Notification["type"]) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "message":
        return <MessageSquare className={iconClass} />;
      case "like":
        return <Heart className={iconClass} />;
      case "comment":
        return <MessageSquare className={iconClass} />;
      case "payment":
        return <DollarSign className={iconClass} />;
      case "alert":
        return <AlertCircle className={iconClass} />;
      case "mention":
        return <User className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getIconColor = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return "bg-blue-100 text-blue-600";
      case "like":
        return "bg-pink-100 text-pink-600";
      case "comment":
        return "bg-purple-100 text-purple-600";
      case "payment":
        return "bg-green-100 text-green-600";
      case "alert":
        return "bg-orange-100 text-orange-600";
      case "mention":
        return "bg-indigo-100 text-indigo-600";
      default:
        return "bg-card text-gray-600";
    }
  };

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const clearAll = () => {
    clearAllNotificationsMutation.mutate();
  };

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="min-h-screen bg-card rounded-lg p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-accent rounded-lg shadow-sm border border-border 0 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-card rounded-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  Notifications
                </h1>
                <p className="text-sm text-secondary-foreground">
                  {unreadCount} unread{" "}
                  {unreadCount === 1 ? "notification" : "notifications"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 rounded-lg p-1">
              <div className="flex gap-2 bg-card  rounded-lg p-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    filter === "all"
                      ? " dark:bg-gray-600 text-primary shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    filter === "unread"
                      ? " dark:bg-gray-600 text-primary shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1"></div>

            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-lg shadow-sm border border-border p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-card dark:bg-gray-700 rounded-full mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                No notifications
              </h3>
              <p className="text-secondary-foreground">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg shadow-sm border border-border p-4 transition-all hover:shadow-md group ${
                  !notification.is_read
                    ? "ring-2 ring-blue-500 ring-opacity-50"
                    : ""
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getIconColor(
                      notification.type,
                    )}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          notification.is_read
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-primary"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.action_url && (
                      <a href={notification.action_url} className="text-sm text-blue-500 hover:underline mb-2 inline-block">
                        View details
                      </a>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-card dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
