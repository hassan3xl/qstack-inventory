"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
  User,
  MessageSquare,
  Heart,
  DollarSign,
  AlertCircle,
  X,
  Clock,
} from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
};

import {
  useGetNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "@/lib/hooks/notifications.hook";

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
    const iconClass = "w-5 h-5 animate-pulse-slow";
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
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10";
      case "like":
        return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/10";
      case "comment":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/10";
      case "payment":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10";
      case "alert":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10";
      case "mention":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10";
      default:
        return "bg-muted text-muted-foreground border border-border/50";
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header component */}
      <Header
        title="Notifications"
        subtitle={`Stay updated with the latest alerts for your store.`}
        showRefresh={false}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="rounded-xl h-9 text-xs font-bold border-border/60 hover:bg-accent/40"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Mark all read
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="rounded-xl h-9 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-500/5 border-red-500/20 hover:border-red-500/30"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear all
              </Button>
            )}
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex bg-muted/60 p-1.5 rounded-xl w-fit border border-border/30">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
            filter === "all"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
            filter === "unread"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              No notifications
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {filter === "unread"
                ? "You're all caught up! No unread notifications at this time."
                : "You don't have any notifications yet. We'll let you know when something happens."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border transition-all duration-300 p-5 group flex items-start gap-4 ${
                !notification.is_read
                  ? "bg-primary/[0.01] border-primary/20 shadow-xs"
                  : "bg-card border-border/40 hover:border-border/80"
              }`}
            >
              {/* Icon container */}
              <div
                className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getIconColor(
                  notification.type,
                )}`}
              >
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3
                    className={`text-sm font-bold tracking-tight ${
                      notification.is_read
                        ? "text-foreground/80"
                        : "text-foreground"
                    }`}
                  >
                    {notification.title}
                  </h3>
                  {!notification.is_read && (
                    <span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {notification.message}
                </p>

                {notification.action_url && (
                  <a
                    href={notification.action_url}
                    className="text-xs font-bold text-primary hover:underline mb-3 inline-block"
                  >
                    View details
                  </a>
                )}

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(notification.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
