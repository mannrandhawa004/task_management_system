"use client";

import { BadgeCheck, CalendarDays, User, Folder } from "lucide-react";

export default function ProjectDetailsHeader({ project }) {
    return (
        <div
            className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden shadow-sm"
            style={{
                background: "var(--card)",
                borderColor: "var(--border)",
            }}
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center gap-3.5 flex-wrap">
                        <div className="p-2.5 rounded-xl text-[var(--primary)] bg-black/5 dark:bg-white/5 border border-[var(--border)]">
                            <Folder size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
                            {project.name}
                        </h1>
                        <StatusBadge status={project.status} />
                    </div>

                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                        {project.description || "No description provided for this operational framework."}
                    </p>
                </div>

                {/* METADATA RIGID PANEL */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-8 lg:gap-4 border-t lg:border-t-0 lg:border-l pt-5 lg:pt-0 lg:pl-8 shrink-0" style={{ borderColor: "var(--border)" }}>
                    <InfoRow
                        icon={User}
                        label="Created By"
                        value={project.creator_name}
                    />
                    <InfoRow
                        icon={CalendarDays}
                        label="Date Launched"
                        value={new Date(project.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    />
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl text-[var(--muted)]" style={{ background: "var(--input)" }}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>
                    {label}
                </p>
                <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text)" }}>
                    {value || "Unknown"}
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const getStatusConfig = (slug) => {
        switch (slug?.toLowerCase()) {
            case "completed":
                return { bg: "rgba(34, 197, 94, 0.12)", text: "#22c55e" };
            case "archived":
                return { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" };
            default: // active
                return { bg: "rgba(59, 130, 246, 0.12)", text: "#3b82f6" };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span
            className="px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            style={{
                background: config.bg,
                color: config.text,
            }}
        >
            <BadgeCheck size={13} strokeWidth={2.5} />
            {status || "Active"}
        </span>
    );
}