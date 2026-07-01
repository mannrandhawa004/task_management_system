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
    FolderKanban,
} from "lucide-react";


const ACTION_MESSAGES = {
    CREATE_TASK: "Created a task",
    UPDATE_TASK: "Updated a task",
    DELETE_TASK: "Deleted a task",
    UPDATE_TASK_STATUS: "Updated task status",
    CREATE_PROJECT: "Created project",
    UPDATE_PROJECT: "Updated details",
    DELETE_PROJECT: "Deleted project",
    PROJECT_MEMBER_ADDED: "Added member",
    PROJECT_MEMBER_REMOVED: "Removed member",
    ADD_PROJECT_MEMBER: "Added member",
    DELETE_PROJECT_MEMBER: "Removed member",
};

/**
 * Returns a friendly message string for the UI.
 */
function getActionMessage(action) {
    return ACTION_MESSAGES[action] || action?.replace(/_/g, " ").toLowerCase() || "Updated project";
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

export default function RecentlyActiveProjects({ projects, loading }) {
    if (loading) {
        return (
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm h-80 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin w-6 h-6 text-emerald-500 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Loading projects…</p>
            </div>
        );
    }

    return (
        <div className="p-5 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col justify-between">
            {/* Clean Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]/60 mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <FolderKanban size={14} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[var(--text)]">Project Activity</h3>
                        <p className="text-[11px] text-[var(--muted)]">Latest updates & modifications</p>
                    </div>
                </div>
                {projects && projects.length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[var(--hover)] text-[var(--muted)] border border-[var(--border)]">
                        Top {projects.length}
                    </span>
                )}
            </div>

            {/* Compact List */}
            <div className="space-y-1">
                {projects && projects.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]/40">
                        {projects.map((project) => {
                            return (
                                <Link
                                    key={project.id}
                                    href={`/dashboard/projects/${project.id}`}
                                    className="flex items-center justify-between py-2.5 px-2 rounded-xl transition-all hover:bg-[var(--hover)] group"
                                >
                                    <div className="flex-1 min-w-0 pr-3">
                                        {/* Row 1: Project Name + Status */}
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className="font-bold text-xs text-[var(--text)] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {project.name}
                                            </h4>
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                                                project.status === "completed"
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : project.status === "active"
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-[var(--hover)] text-[var(--muted)]"
                                            }`}>
                                                {project.status || "active"}
                                            </span>
                                        </div>

                                        {/* Row 2: Action details + Time */}
                                        <div className="flex items-center justify-between text-[11px] text-[var(--muted)] gap-2">
                                            <span className="truncate">
                                                {getActionMessage(project.last_action)}
                                                {project.last_actor_name && (
                                                    <span> by <strong className="font-semibold text-[var(--text)]">{project.last_actor_name}</strong></span>
                                                )}
                                            </span>
                                            <span className="shrink-0 font-medium text-[10px]">
                                                {timeAgo(project.last_activity_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--muted)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all shrink-0 ml-1">
                                        <ArrowUpRight size={13} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--muted)]">
                        <FolderKanban size={24} className="opacity-30 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-wider">No active projects</p>
                    </div>
                )}
            </div>
        </div>
    );
}