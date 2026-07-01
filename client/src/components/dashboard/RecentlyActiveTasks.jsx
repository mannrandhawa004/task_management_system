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
    CheckCircle2,
} from "lucide-react";

const ACTION_MESSAGES = {
    CREATE_TASK: "Created task",
    UPDATE_TASK: "Updated task",
    DELETE_TASK: "Deleted task",
    UPDATE_TASK_STATUS: "Updated status",
};

function getActionMessage(action) {
    return ACTION_MESSAGES[action] || action?.replace(/_/g, " ").toLowerCase() || "Updated task";
}

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

export default function RecentlyActiveTasks({ tasks, loading }) {
    if (loading) {
        return (
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm h-80 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin w-6 h-6 text-emerald-500 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Loading tasks…</p>
            </div>
        );
    }

    return (
        <div className="p-5 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col justify-between">
            {/* Clean Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]/60 mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckSquare size={14} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[var(--text)]">Task Activity</h3>
                        <p className="text-[11px] text-[var(--muted)]">Recent modifications & progression</p>
                    </div>
                </div>
                {tasks && tasks.length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[var(--hover)] text-[var(--muted)] border border-[var(--border)]">
                        Top {tasks.length}
                    </span>
                )}
            </div>

            {/* Compact List */}
            <div className="space-y-1">
                {tasks && tasks.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]/40">
                        {tasks.map((task) => {
                            const project = typeof task.project === 'string' ? JSON.parse(task.project) : task.project;
                            const isDone = task.status === "completed";

                            return (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between py-2.5 px-2 rounded-xl transition-all hover:bg-[var(--hover)] group"
                                >
                                    <div className="flex-1 min-w-0 pr-3">
                                        {/* Row 1: Task Title + Status */}
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                {isDone ? (
                                                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                                ) : (
                                                    <CheckSquare size={13} className="text-[var(--muted)] shrink-0" />
                                                )}
                                                <h4 className={`font-bold text-xs truncate transition-colors ${
                                                    isDone ? "line-through text-[var(--muted)]" : "text-[var(--text)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                                                }`}>
                                                    {task.title}
                                                </h4>
                                            </div>
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                                                isDone
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : task.status === "in_progress"
                                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                    : "bg-[var(--hover)] text-[var(--muted)]"
                                            }`}>
                                                {task.status?.replace("_", " ") || "todo"}
                                            </span>
                                        </div>

                                        {/* Row 2: Action details + Project Name + Time */}
                                        <div className="flex items-center justify-between text-[11px] text-[var(--muted)] gap-2">
                                            <span className="truncate">
                                                {getActionMessage(task.last_action)}
                                                {project?.name && (
                                                    <span> in <strong className="font-semibold text-[var(--text)]">{project.name}</strong></span>
                                                )}
                                            </span>
                                            <span className="shrink-0 font-medium text-[10px]">
                                                {timeAgo(task.last_activity_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--muted)]">
                        <CheckSquare size={24} className="opacity-30 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-wider">No active tasks</p>
                    </div>
                )}
            </div>
        </div>
    );
}
