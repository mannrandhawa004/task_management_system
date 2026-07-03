"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  FolderKanban,
  Loader2,
  MailOpen,
  RefreshCw,
  Trash2,
  Filter,
  Search,
  CheckSquare,
  Sparkles,
  Calendar,
  X
} from "lucide-react";

import AppLoader from "@/components/common/AppLoader";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications
} from "@/features/notifications/services/notification.service";
import { showToast } from "@/lib/toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: null,
  });
  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, open: false, onConfirm: null }));

  // Filter & Search states
  const [activeTab, setActiveTab] = useState("all"); // "all" | "unread" | "read"
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications]);
  const readCount = useMemo(() => notifications.length - unreadCount, [notifications, unreadCount]);

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
    loadNotifications({ showLoading: true });
  }, []);

  // Filter list based on activeTab and searchQuery
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "unread" && !item.is_read) ||
        (activeTab === "read" && !!item.is_read);

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.project?.name?.toLowerCase().includes(query) ||
        item.task?.title?.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [notifications, activeTab, searchQuery]);

  // Paginated slice
  const totalPages = Math.ceil(filteredNotifications.length / limit) || 1;
  const displayedNotifications = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredNotifications.slice(start, start + limit);
  }, [filteredNotifications, page, limit]);

  const handleMarkOne = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: 1 } : item)));
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

  const handleDeleteOne = async (id) => {
    try {
      setDeleteLoadingId(id);
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      showToast.success("Notification removed");
      closeConfirm();
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to delete notification");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      setActionLoading(true);
      await clearAllNotifications();
      setNotifications([]);
      showToast.success("All stored notifications cleared");
      closeConfirm();
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to clear notifications");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <AppLoader fullScreen message="Loading notifications..." />;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6 transition-colors duration-200">
      {/* HEADER BAR */}
      <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-1">
            <Sparkles size={14} />
            <span>Real-Time Activity Feed</span>
          </div>
          <h1 className="flex items-center gap-2.5 text-2xl md:text-3xl font-black tracking-tight">
            <Bell className="text-[var(--primary)] w-7 h-7 shrink-0" />
            Notifications
          </h1>
          <p className="mt-1 text-xs md:text-sm font-medium text-[var(--muted)]">
            Review task assignments, project state updates, and system alerts stored in your account database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadNotifications({ showLoading: true })}
            className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-xs font-black hover:bg-[var(--hover)] cursor-pointer shadow-2xs transition"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            type="button"
            disabled={actionLoading || unreadCount === 0}
            onClick={handleMarkAll}
            className="flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50 cursor-pointer shadow-2xs hover:opacity-90 transition"
          >
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
            Mark all read
          </button>

          <button
            type="button"
            disabled={actionLoading || notifications.length === 0}
            onClick={() => {
              setConfirmDialog({
                open: true,
                title: "Clear All Stored Notifications",
                message: "Are you sure you want to permanently remove all notifications from the database? All alert tracking data will be deleted.",
                confirmLabel: "Clear All Notifications",
                onConfirm: handleClearAll,
              });
            }}
            className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 px-4 py-2.5 text-xs font-black disabled:opacity-40 cursor-pointer shadow-2xs transition"
          >
            <Trash2 size={14} />
            Clear all stored
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Metric title="Total Stored" value={notifications.length} />
        <Metric title="Unread Alert Triggers" value={unreadCount} highlight />
        <Metric title="Acknowledged Feed" value={readCount} />
      </div>

      {/* FILTER & SEARCH MATRIX */}
      <div className="p-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Segmented Tabs */}
        <div className="flex bg-[var(--hover)] p-1 rounded-2xl border border-[var(--border)] w-full md:w-auto">
          {[
            { id: "all", label: `All (${notifications.length})` },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "read", label: `Read (${readCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`flex-1 md:px-6 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search alerts, tasks, projects..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full text-xs py-2.5 pl-10 pr-9 rounded-2xl border border-[var(--border)] bg-[var(--input)] font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]/50 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* NOTIFICATIONS LIST CONTAINER */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
            <div className="p-4 rounded-2xl bg-[var(--hover)] text-[var(--muted)]">
              <MailOpen size={30} />
            </div>
            <h3 className="text-base font-extrabold">No matching notifications</h3>
            <p className="text-xs font-medium text-[var(--muted)] max-w-xs">
              {searchQuery || activeTab !== "all"
                ? "No notification items match your selected tab filter or search query."
                : "You're all caught up! New assignment and system events will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[var(--border)]">
              {displayedNotifications.map((notification) => {
                const isUnread = !notification.is_read;
                const isProject = notification.entity_type?.toLowerCase() === "project" || notification.project?.name;
                const isDeleting = deleteLoadingId === notification.id;

                return (
                  <article
                    key={notification.id}
                    className={`p-5 transition-colors duration-150 ${
                      isUnread ? "bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10 border-l-4 border-l-[var(--primary)]" : "hover:bg-[var(--hover)]/50"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                              isUnread ? "bg-[var(--primary)] shadow-xs animate-pulse" : "bg-[var(--border)]"
                            }`}
                          />
                          <h2 className="text-sm font-extrabold text-[var(--text)]">{notification.title}</h2>
                        </div>

                        <p className="text-xs font-medium leading-relaxed text-[var(--muted)] pl-4.5">
                          {notification.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1 pl-4.5 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                          <span className="rounded-lg bg-[var(--input)] border border-[var(--border)] px-2.5 py-1">
                            {notification.type?.replace(/_/g, " ")}
                          </span>

                          {notification.project?.name && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--input)] border border-[var(--border)] px-2.5 py-1 text-blue-500 dark:text-blue-400">
                              <FolderKanban size={12} />
                              Project: {notification.project.name}
                            </span>
                          )}

                          {notification.task?.title && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--input)] border border-[var(--border)] px-2.5 py-1 text-purple-500 dark:text-purple-400">
                              <CheckSquare size={12} />
                              Task: {notification.task.title}
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 opacity-75">
                            <Calendar size={11} />
                            {notification.created_at ? new Date(notification.created_at).toLocaleString() : "Just now"}
                          </span>
                        </div>
                      </div>

                      {/* ITEM ACTIONS */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isUnread && (
                          <button
                            type="button"
                            onClick={() => handleMarkOne(notification.id)}
                            className="rounded-xl border border-[var(--border)] bg-[var(--input)] hover:bg-[var(--hover)] px-3 py-2 text-xs font-extrabold text-[var(--text)] transition cursor-pointer shadow-2xs"
                          >
                            Mark read
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => {
                            setConfirmDialog({
                              open: true,
                              title: "Delete Notification",
                              message: `Are you sure you want to permanently remove "${notification.title}" from your stored notifications?`,
                              confirmLabel: "Delete Notification",
                              onConfirm: () => handleDeleteOne(notification.id),
                            });
                          }}
                          title="Delete notification"
                          className="p-2 rounded-xl border border-[var(--border)] bg-[var(--input)] text-[var(--muted)] hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="border-t border-[var(--border)] bg-[var(--hover)]/30">
              <Pagination
                page={page}
                limit={limit}
                total={filteredNotifications.length}
                totalPages={totalPages}
                onPageChange={({ page: newPage, limit: newLimit }) => {
                  setPage(newPage);
                  if (newLimit !== limit) {
                    setLimit(newLimit);
                    setPage(1);
                  }
                }}
              />
            </div>
          </>
        )}
      </section>

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={closeConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        loading={actionLoading || deleteLoadingId !== null}
        variant="danger"
      />
    </main>
  );
}

function Metric({ title, value, highlight = false }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
      <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">{title}</p>
      <p className={`mt-2 text-3xl font-black ${highlight ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>{value}</p>
    </div>
  );
}
