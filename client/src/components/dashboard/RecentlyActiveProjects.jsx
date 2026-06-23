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

export default function RecentlyActiveProjects({ projects, loading }) {
    if (loading) {
        return (
            <div className="border rounded-2xl overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-sm">
                <div className="p-4 border-b flex items-center justify-between border-[var(--border)]">
                    <div className="flex items-center gap-2">
                        <Activity size={15} className="text-violet-400" />
                        <h2 className="text-base font-semibold tracking-tight">Recently Active Projects</h2>
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
                    <Activity size={15} className="text-violet-400" />
                    <h2 className="text-base font-semibold tracking-tight">Recently Active Projects</h2>
                </div>
                {projects && projects.length > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[var(--hover)] text-[var(--muted)]">
                        Top {projects.length}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-2 space-y-1">
                {projects && projects.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                        {projects.map((project) => {
                            const actionColorStyles = getActionColorStyles(project.last_action);
                            const actionColorText = actionColorStyles.split(" ")[0];

                            return (
                                <div
                                    key={project.id}
                                    className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-[var(--hover)] group"
                                >
                                    <div className="flex-1 min-w-0 pr-3 space-y-1.5">
                                        {/* Project name */}
                                        <h3 className="font-semibold text-sm truncate text-[var(--text)]">
                                            {project.name}
                                        </h3>

                                        {/* Dynamic Friendly Activity Description */}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <Zap size={10} className={actionColorText} />
                                            <span className={`text-[12px] font-medium text-[var(--text)]`}>
                                                {getActionMessage(project.last_action)}
                                            </span>
                                            {project.last_actor_name && (
                                                <span className="text-[11px] text-[var(--muted)] font-normal">
                                                    by <span className="font-medium text-[var(--text)]">{project.last_actor_name}</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Meta badges */}
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1 bg-[var(--hover)] px-2 py-0.5 border border-[var(--border)] rounded-md">
                                                <Clock size={10} className="text-blue-400" />
                                                {timeAgo(project.last_activity_at)}
                                            </span>
                                            <span className="flex items-center gap-1 bg-[var(--hover)] px-2 py-0.5 border border-[var(--border)] rounded-md">
                                                <CheckSquare size={10} />
                                                {project.tasks_count || 0} tasks
                                            </span>
                        
                                          
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[9px] border font-black ${project.status === "completed"
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        : project.status === "active"
                                                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                            : "bg-neutral-500/10 text-[var(--muted)]"
                                                    }`}
                                            >
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Navigate arrow */}
                                    <Link
                                        href={`/dashboard/projects/${project.id}`}
                                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-[var(--hover)] border border-transparent hover:border-[var(--border)] transition-all flex-shrink-0 ml-2"
                                    >
                                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 py-12">
                        <Activity size={24} className="text-[var(--muted)] mb-2 opacity-40" />
                        <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-wide">
                            No recent project activity found.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}