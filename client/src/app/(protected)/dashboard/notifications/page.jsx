"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, FolderKanban, Loader2, MailOpen, RefreshCw } from "lucide-react";

import AppLoader from "@/components/common/AppLoader";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/features/notifications/services/notification.service";
import { showToast } from "@/lib/toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications]);

  const loadNotifications = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNotifications()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        showToast.error(error?.response?.data?.message || "Failed to load notifications");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleMarkOne = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, is_read: 1 } : item));
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to update notification");
    }
  };

  const handleMarkAll = async () => {
    try {
      setActionLoading(true);
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: 1 })));
      showToast.success("All notifications marked as read");
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to update notifications");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <AppLoader fullScreen message="Loading notifications..." />;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-black tracking-tight">
            <Bell className="text-[var(--primary)]" />
            Notifications
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            Task, project, and assignment updates sent to your account.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={loadNotifications} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-black hover:bg-[var(--hover)] cursor-pointer">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button disabled={actionLoading || unreadCount === 0} onClick={handleMarkAll} className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-black text-white disabled:opacity-50 cursor-pointer">
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
            Mark all read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric title="Total" value={notifications.length} />
        <Metric title="Unread" value={unreadCount} highlight />
        <Metric title="Read" value={notifications.length - unreadCount} />
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <MailOpen size={32} className="text-[var(--muted)]" />
            <p className="text-sm font-black">No notifications yet</p>
            <p className="text-xs font-medium text-[var(--muted)]">New project and task updates will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {notifications.map((notification) => (
              <article key={notification.id} className={`p-4 md:p-5 ${notification.is_read ? "bg-[var(--card)]" : "bg-[var(--primary)]/5"}`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${notification.is_read ? "bg-[var(--border)]" : "bg-[var(--primary)]"}`} />
                      <h2 className="text-sm font-black">{notification.title}</h2>
                    </div>
                    <p className="text-xs font-medium leading-relaxed text-[var(--muted)]">{notification.message}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      <span className="rounded-lg bg-[var(--input)] px-2 py-1">{notification.type}</span>
                      {notification.entity_type && (
                        <span className="flex items-center gap-1 rounded-lg bg-[var(--input)] px-2 py-1">
                          <FolderKanban size={11} />
                          {notification.entity_type} #{notification.entity_id}
                        </span>
                      )}
                      {notification.project?.name && (
                        <span className="rounded-lg bg-[var(--input)] px-2 py-1">
                          Project: {notification.project.name}
                        </span>
                      )}
                      {notification.task?.title && (
                        <span className="rounded-lg bg-[var(--input)] px-2 py-1">
                          Task: {notification.task.title}
                        </span>
                      )}
                      <span>{notification.created_at ? new Date(notification.created_at).toLocaleString() : "Just now"}</span>
                    </div>
                  </div>

                  {!notification.is_read && (
                    <button onClick={() => handleMarkOne(notification.id)} className="shrink-0 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-black text-[var(--muted)] hover:bg-[var(--hover)] cursor-pointer">
                      Mark read
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ title, value, highlight = false }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">{title}</p>
      <p className={`mt-2 text-3xl font-black ${highlight ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>{value}</p>
    </div>
  );
}
