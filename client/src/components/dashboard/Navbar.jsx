"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, User, Mail, Shield, ChevronDown, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { logoutThunk } from "@/features/auth/thunks/authThunk";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/features/notifications/services/notification.service";
import { getSocket } from "@/lib/socket";
import Link from "next/link";
import Image from "next/image";
import GlobalSearchModal from "@/components/dashboard/GlobalSearchModal";

export default function Navbar() {
    console.log("Navbar Render");
    const { user } = useSelector((state) => state.auth);
    const [open, setOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const isControlOrMeta = e.metaKey || e.ctrlKey;
            const isK = e.key === "k" || e.key === "K" || e.code === "KeyK";
            const isF = e.key === "f" || e.key === "F" || e.code === "KeyF";
            
            if (isControlOrMeta && (isK || isF)) {
                e.preventDefault();
                e.stopPropagation();
                setSearchOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", handleKeyDown, true);
        return () => document.removeEventListener("keydown", handleKeyDown, true);
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        getNotifications()
            .then((data) => setNotifications(Array.isArray(data) ? data : []))
            .catch(() => setNotifications([]));

        const socket = getSocket();
        socket.emit("register", user.id);

        const handleNotification = (notification) => {
            setNotifications((prev) => [
                {
                    ...notification,
                    project: notification.project || null,
                    task: notification.task || null,
                },
                ...prev,
            ]);
            getNotifications()
                .then((data) => setNotifications(Array.isArray(data) ? data : []))
                .catch(() => { });
        };

        socket.on("notification", handleNotification);

        return () => {
            socket.off("notification", handleNotification);
        };
    }, [user?.id]);

    const handleLogout = async () => {
        try {
            await dispatch(logoutThunk()).unwrap();
            router.replace("/");
        } catch (error) {
            console.error("Logout transaction error context:", error);
        }
    };

    const unreadCount = notifications.filter((notification) => !notification.is_read).length;

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead();
        setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: 1 })));
    };

    const handleMarkRead = async (id) => {
        await markNotificationAsRead(id);
        setNotifications((prev) => prev.map((notification) => notification.id === id ? { ...notification, is_read: 1 } : notification));
    };

    return (
        <header
            className="h-16 border-b px-6 flex items-center justify-between relative z-40 bg-[var(--card)] border-[var(--border)]"
        >
            {/* SEARCH LAYOUT BAR LINK */}
            <div
                onClick={() => setSearchOpen(true)}
                className="relative w-full max-w-sm hover:scale-[1.01] transition-all cursor-pointer group"
            >
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-hover:text-[var(--primary)] transition-colors" />
                <div
                    className="w-full text-xs font-semibold rounded-2xl border py-2.5 pl-10 pr-12 transition-all flex items-center justify-between group-hover:border-[var(--primary)]/50 group-hover:shadow-xs"
                    style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--text)" }}
                >
                    <span className="text-[var(--muted)]">Search task, project, employee...</span>
                </div>
                {/* ⌘ K / Ctrl K keyboard shortcut helper */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9.5px] font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-lg select-none group-hover:border-[var(--primary)]/40 group-hover:text-[var(--primary)] transition-colors">
                    ⌘ K
                </span>
            </div>

            {/* RIGHT ACTION ITEMS LINK ROW */}
            <div className="flex items-center gap-3.5" ref={dropdownRef}>
                <ThemeToggle />

                {/* Message Mail icon mock */}
                <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)] border border-[var(--border)] text-slate-400 dark:text-slate-500 cursor-pointer"
                    style={{ background: "var(--input)" }}
                >
                    <Mail size={15} />
                </button>

                {/* Notification Stack Indicator Icon */}
                <button
                    onClick={() => setNotificationOpen((prev) => !prev)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)] border border-[var(--border)] text-slate-400 dark:text-slate-500 cursor-pointer"
                    style={{ background: "var(--input)" }}
                >
                    <Bell size={15} />
                    {unreadCount > 0 && (
                        <span
                            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-extrabold text-white animate-pulse"
                            style={{ background: "var(--primary)" }}
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>

                <AnimatePresence>
                    {notificationOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-28 top-[70px] z-50 w-96 overflow-hidden rounded-2xl border shadow-xl"
                            style={{ background: "var(--profile)", borderColor: "var(--border)" }}
                        >
                            <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--border)" }}>
                                <div>
                                    <h3 className="text-sm font-black text-[var(--text)]">Notifications</h3>
                                    <p className="text-[11px] font-bold text-[var(--muted)]">{unreadCount} unread updates</p>
                                </div>
                                <button onClick={handleMarkAllRead} disabled={unreadCount === 0} className="text-[11px] font-black text-[var(--primary)] disabled:opacity-40 cursor-pointer">
                                    Mark all read
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-xs font-bold text-[var(--muted)]">No notifications yet.</div>
                                ) : (
                                    notifications.slice(0, 8).map((notification) => (
                                        <button
                                            key={notification.id || `${notification.type}-${notification.created_at}`}
                                            onClick={() => notification.id && handleMarkRead(notification.id)}
                                            className={`w-full border-b p-4 text-left transition hover:bg-[var(--hover)] cursor-pointer ${notification.is_read ? "" : "bg-[var(--primary)]/5"}`}
                                            style={{ borderColor: "var(--border)" }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className={`mt-1 h-2 w-2 rounded-full ${notification.is_read ? "bg-[var(--border)]" : "bg-[var(--primary)]"}`} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-black text-[var(--text)]">{notification.title}</p>
                                                    <p className="mt-1 line-clamp-2 text-[11px] font-medium text-[var(--muted)]">{notification.message}</p>
                                                    <div className="mt-2 space-y-0.5 text-[10px] font-black text-[var(--muted)]">
                                                        {notification.project?.name && <p className="truncate">Project: {notification.project.name}</p>}
                                                        {notification.task?.title && <p className="truncate">Task: {notification.task.title}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <Link href="/dashboard/notifications" onClick={() => setNotificationOpen(false)} className="block border-t p-3 text-center text-xs font-black text-[var(--primary)]" style={{ borderColor: "var(--border)" }}>
                                View all notifications
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Profile Command Menu Drawer Segment */}
                <button
                    onClick={() => setOpen(!open)}
                    className="
    group
    flex items-center gap-3
    rounded-full
    px-3 py-1.5
    border
    transition-all
    hover:shadow-sm
    cursor-pointer
    "
                    style={{
                        background: "var(--input)",
                        borderColor: "var(--border)"
                    }}
                >
                    <div
                        className="
        relative
        flex
        h-9 w-9
        items-center justify-center
        rounded-full
        overflow-hidden
        shrink-0
        font-bold
        text-xs
        text-white
        "
                        style={{
                            background:
                                "linear-gradient(135deg,var(--primary),rgba(99,102,241,.75))"
                        }}
                    >
                        {user?.avatar ? (
                            <Image
                                src={user.avatar}
                                alt={user?.name || "User avatar"}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            user?.name.slice(0, 2).toUpperCase() || "U"
                        )}
                    </div>

                    <div className="hidden md:flex flex-col text-left max-w-[150px]">
                        <p className="truncate text-xs font-black text-[var(--text)] leading-tight">
                            {user?.name || "Anonymous"}
                        </p>
                        <p className="truncate text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                            {user?.email || "user@taskflow.com"}
                        </p>
                    </div>

                    <motion.div
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                    >
                        <ChevronDown
                            size={14}
                            className="text-slate-400 dark:text-slate-500"
                        />
                    </motion.div>
                </button>

                {/* PROFILE POPUP DIALOG WINDOW BOX */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-4 top-[70px] w-76 rounded-2xl border p-5 shadow-xl z-50 overflow-hidden"
                            style={{ background: "var(--profile)", borderColor: "var(--border)" }}
                        >
                            <div className=" flex items-center  mb-4 rounded-xl p-4  gap-2" >
                                {user?.avatar ? (
                                    <div className=" flex bg-[var(--primary)] h-15 w-15  rounded-xl overflow-hidden ">
                                        <Image
                                            src={user.avatar}
                                            alt={user?.name || "User avatar"}
                                            className="h-15 w-15 object-cover rounded-xl"
                                            height={100}
                                            width={100}
                                        />
                                    </div>
                                ) : (
                                    <div className="mx-auto flex bg-[var(--primary)] h-15 w-15  rounded-xl overflow-hidden justify-center items-center text-white">
                                        {user?.name?.slice(0, 2).toUpperCase() || "??"}
                                    </div>

                                )}

                                <div className="min-w-0">
                                    <h3 className="text-sm font-extrabold truncate text-[var(--text)]">{user?.name || "Active Operative"}</h3>
                                    <p className="text-xs truncate text-[var(--muted)]">{user?.email || "no-email@context.com"}</p>
                                </div>
                            </div>

                            <div className="space-y-2.5 text-xs font-bold text-[var(--text)]">
                                <div className="flex items-center gap-3 px-2 py-1 rounded-lg" style={{ color: "var(--muted)" }}>
                                    <Mail size={14} className="shrink-0" />
                                    <span className="truncate text-[var(--text)] font-medium">{user?.email || "N/A"}</span>
                                </div>

                                <div className="flex items-center gap-3 px-2 py-1 rounded-lg" style={{ color: "var(--muted)" }}>
                                    <Shield size={14} className="shrink-0" />
                                    <span className="capitalize text-[var(--text)] font-medium">{user?.role || "Standard"}</span>
                                </div>

                                <div className="flex items-center gap-3 px-2 py-1 rounded-lg mb-2" style={{ color: "var(--muted)" }}>
                                    <User size={14} className="shrink-0" />
                                    <span className="capitalize text-emerald-500 font-medium">{user?.status || "Active State"}</span>
                                </div>

                                <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold tracking-wide text-red-500 border border-red-500/10 transition-all hover:bg-red-500/5 active:scale-98 cursor-pointer"
                                        style={{ background: "rgba(239, 68, 68, 0.06)" }}
                                    >
                                        <LogOut size={14} strokeWidth={2.5} />
                                        Disconnect Session
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </header>
    );
}
