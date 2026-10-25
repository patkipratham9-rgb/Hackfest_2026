"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Store,
  Sparkles,
  ShoppingBag,
  Clock,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AppNotification,
  getSavedNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "@/lib/notificationSystem";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = () => {
    setNotifications(getSavedNotifications());
  };

  useEffect(() => {
    refresh();

    const handleUpdate = () => refresh();
    window.addEventListener("localloop:notifications_updated", handleUpdate);
    return () => window.removeEventListener("localloop:notifications_updated", handleUpdate);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "new_store":
        return <Store className="w-4 h-4 text-terracotta-500" />;
      case "new_product":
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case "order_status":
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case "recommendation":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-forest-600" />;
    }
  };

  const formatTime = (ts: string) => {
    try {
      const diffMinutes = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.round(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.round(diffHours / 24)}d ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="header-notifications-button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-cream-200 hover:bg-cream-300 text-forest-800 transition-colors border border-cream-300 shadow-xs cursor-pointer"
        aria-label="View notifications"
        title="Live Store & Product Alerts"
      >
        <Bell className="w-4 h-4 text-forest-700" />
        {unreadCount > 0 && (
          <span
            data-testid="notification-unread-badge"
            className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for click outside */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-cream-50 border border-cream-300 shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-3.5 bg-forest-900 text-cream-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-terracotta-400" />
                  <span className="font-serif font-bold text-sm text-cream-50">
                    Live Alerts &amp; Updates
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-terracotta-600 px-2 py-0.5 rounded-full text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] font-semibold text-cream-300 hover:text-white px-2 py-1 rounded-md"
                      title="Mark all as read"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-cream-300 hover:text-white hover:bg-forest-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-cream-200 p-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2 text-forest-500">
                    <Bell className="w-8 h-8 mx-auto opacity-30 text-forest-400" />
                    <p className="font-bold text-xs text-forest-800">No notifications yet</p>
                    <p className="text-[11px] text-forest-500">
                      You will be alerted when new stores register or items arrive in your area.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div
                      key={notif.id || `notif-${idx}`}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-2.5 ${
                        notif.read ? "bg-cream-50 opacity-70" : "bg-white shadow-xs font-semibold"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-cream-200 flex items-center justify-center shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-forest-950 truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-forest-400 shrink-0">
                            {formatTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-forest-700 leading-snug mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-terracotta-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-2.5 bg-cream-100 border-t border-cream-200 flex items-center justify-between text-[11px]">
                  <span className="text-forest-600">
                    {notifications.length} total notification{notifications.length > 1 ? "s" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    className="text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
