"use client";

import { FolderKanban, User, CalendarDays } from "lucide-react";

export default function ProjectDetailsHeader({ project }) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 shadow-sm">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* LEFT: icon + label + title + status + description */}
                <div className="space-y-3 max-w-3xl">
                    {/* Icon label row */}
                    <div className="flex items-center gap-2">
                        <div className="bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg p-1.5">
                            <FolderKanban size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                            Project Details
                        </span>
                    </div>

                    {/* Title + badge */}
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-black text-[var(--text)]">
                            {project.name}
                        </h1>
                        <StatusBadge status={project.status} />
                    </div>

                    {/* Description */}
                    <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed">
                        {project.description || "No description provided for this project."}
                    </p>
                </div>

                {/* RIGHT: info cells */}
                <div className="flex flex-row gap-3 shrink-0">
                    <InfoCell
                        label="Creator"
                        value={project.creator_name || "Unknown"}
                    />
                    <InfoCell
                        label="Date Launched"
                        value={new Date(project.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    />
                </div>
            </div>
        </div>
    );
}

function InfoCell({ label, value }) {
    return (
        <div className="flex flex-col gap-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl px-4 py-3 border border-[var(--border)]/60">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">
                {label}
            </span>
            <span className="text-sm font-black text-[var(--text)]">
                {value}
            </span>
        </div>
    );
}

function StatusBadge({ status }) {
    const slug = status?.toLowerCase();

    let classes = "";
    let dotClass = "";

    if (slug === "completed") {
        classes =
            "bg-emerald-500/10 dark:bg-emerald-400/[0.12] text-emerald-600 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-400/20";
        dotClass = "bg-emerald-400";
    } else if (slug === "archived") {
        classes =
            "bg-rose-500/10 dark:bg-rose-400/[0.12] text-rose-600 dark:text-rose-300 border-rose-500/20 dark:border-rose-400/20";
        dotClass = "bg-rose-400";
    } else {
        // active (default)
        classes =
            "bg-blue-500/10 dark:bg-blue-400/[0.12] text-blue-600 dark:text-blue-300 border-blue-500/20 dark:border-blue-400/20";
        dotClass = "bg-blue-400";
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${classes}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            {status || "Active"}
        </span>
    );
}