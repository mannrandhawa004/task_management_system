"use client";

import React from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    Activity,
    Clock,
    CheckSquare,
    Zap,
    Loader2,
    Flag,
    CheckCircle2,
} from "lucide-react";


const ACTION_MESSAGES = {
    // Task Actions
    CREATE_TASK: "Created a task",
    UPDATE_TASK: "Updated a task",
    DELETE_TASK: "Deleted a task",
    UPDATE_TASK_STATUS: "Updated task status",

    // Project Actions
    CREATE_PROJECT: "Created the project",
    UPDATE_PROJECT: "Updated project details",
    DELETE_PROJECT: "Deleted the project",
    PROJECT_MEMBER_ADDED: "Added a team member",
    PROJECT_MEMBER_REMOVED: "Removed a team member",

    // Fallbacks for variations found in raw JSON data
    ADD_PROJECT_MEMBER: "Added a team member",
    DELETE_PROJECT_MEMBER: "Removed a team member",

    // User Actions
    USER_LOGIN: "Logged in",
    USER_LOGOUT: "Logged out",
    USER_REGISTER: "Registered an account",
    CHANGE_USER_STATUS: "Changed user status",
    CHANGE_PASSWORD: "Changed password",

    // Notification Actions
    MARK_NOTIFICATION_READ: "Marked notification as read",
    MARK_ALL_NOTIFICATIONS_READ: "Marked all notifications as read",
};

/**
 * Returns a friendly message string for the UI.
 */
function getActionMessage(action) {
    return ACTION_MESSAGES[action] || action?.replace(/_/g, " ").toLowerCase() || "Performed an action";
}

/**
 * Format a timestamp into a relative time string.
 */
function timeAgo(dateStr) {
    if (!dateStr) return "";
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Group colors by semantic intent prefix
const actionColors = {
    create: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    add: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    update: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    change: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    delete: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    remove: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    default: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

function getActionColorStyles(action) {
    if (!action) return actionColors.default;
    const verb = action.split("_")[0]?.toLowerCase();
    return actionColors[verb] || actionColors.default;
}

// Priority indicator colors
const priorityColors = {
    high: "text-red-400 bg-red-500/10 border-red-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    default: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

function getPriorityColorStyles(priority) {
    return priorityColors[priority?.toLowerCase()] || priorityColors.default;
}

// Status indicator colors
const statusColors = {
    completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    in_progress: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    todo: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    default: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

function getStatusColorStyles(status) {
    return statusColors[status?.toLowerCase()] || statusColors.default;
}

export default function RecentlyActiveTasks({ tasks, loading }) {
    if (loading) {
        return (
            <div className="border rounded-2xl overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-sm">
                <div className="p-4 border-b flex items-center justify-between border-[var(--border)]">
                    <div className="flex items-center gap-2">
                        <Activity size={15} className="text-cyan-400" />
                        <h2 className="text-base font-semibold tracking-tight">Recently Active Tasks</h2>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--muted)]">
                    <Loader2 className="animate-spin w-6 h-6 text-[var(--primary)]" />
                    <p className="text-xs font-bold uppercase tracking-wider">Loading activity…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-2xl overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-sm">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between border-[var(--border)]">
                <div className="flex items-center gap-2">
                    <Activity size={15} className="text-cyan-400" />
                    <h2 className="text-base font-semibold tracking-tight">Recently Active Tasks</h2>
                </div>
                {tasks && tasks.length > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[var(--hover)] text-[var(--muted)]">
                        Top {tasks.length}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-2 space-y-1">
                {tasks && tasks.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                        {tasks.map((task) => {
                            const actionColorStyles = getActionColorStyles(task.last_action);
                            const actionColorText = actionColorStyles.split(" ")[0];
                            const priorityColorStyles = getPriorityColorStyles(task.priority);
                            const statusColorStyles = getStatusColorStyles(task.status);
                            const project = typeof task.project === 'string' ? JSON.parse(task.project) : task.project;

                            return (
                                <div
                                    key={task.id}
                                    className="flex items-start justify-between p-3 rounded-xl transition-all hover:bg-[var(--hover)] group"
                                >
                                    <div className="flex-1 min-w-0 pr-3 space-y-1.5">
                                        {/* Task title */}
                                        <div className="flex items-start gap-2">
                                            {task.status === "completed" ? (
                                                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <CheckSquare size={14} className="text-[var(--muted)] flex-shrink-0 mt-0.5" />
                                            )}
                                            <h3 className={`font-semibold text-sm truncate ${task.status === "completed" ? "line-through text-[var(--muted)]" : "text-[var(--text)]"}`}>
                                                {task.title}
                                            </h3>
                                        </div>

                                        {/* Dynamic Friendly Activity Description */}
                                        <div className="flex items-center gap-1.5 flex-wrap ml-5">
                                            <Zap size={10} className={actionColorText} />
                                            <span className={`text-[12px] font-medium text-[var(--text)]`}>
                                                {getActionMessage(task.last_action)}
                                            </span>
                                            {task.last_actor_name && (
                                                <span className="text-[11px] text-[var(--muted)] font-normal">
                                                    by <span className="font-medium text-[var(--text)]">{task.last_actor_name}</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Meta badges */}
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider ml-5">
                                            <span className="flex items-center gap-1 bg-[var(--hover)] px-2 py-0.5 border border-[var(--border)] rounded-md">
                                                <Clock size={10} className="text-blue-400" />
                                                {timeAgo(task.last_activity_at)}
                                            </span>
                                            {project && (
                                                <span className="flex items-center gap-1 bg-[var(--hover)] px-2 py-0.5 border border-[var(--border)] rounded-md">
                                                    <span className="text-[var(--text)]">{project.name}</span>
                                                </span>
                                            )}
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[9px] border font-black flex items-center gap-0.5 ${priorityColorStyles}`}
                                            >
                                                <Flag size={8} />
                                                {task.priority || "Normal"}
                                            </span>
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[9px] border font-black ${statusColorStyles}`}
                                            >
                                                {task.status?.replace("_", " ") || "Unknown"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Navigate arrow */}
                                    {/* <Link
                                        href={`/dashboard/tasks/${task.id}`}
                                        className="p-1.5 rounded-lg text-cyan-600 hover:bg-[var(--hover)] border border-transparent hover:border-[var(--border)] transition-all flex-shrink-0 ml-2"
                                    >
                                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link> */}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 py-12">
                        <Activity size={24} className="text-[var(--muted)] mb-2 opacity-40" />
                        <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-wide">
                            No recent task activity found.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
