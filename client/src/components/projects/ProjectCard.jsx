"use client";

import { Eye, Pencil, Trash2, History } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AuditLogModal from "@/components/common/AuditLogModal";

export default function ProjectCard({
    project,
    user,
    onEdit,
    onDelete,
    canUpdateProject,
    canDeleteProject,
}) {
    const [showAuditLogs, setShowAuditLogs] = useState(false);
    const statusStyles = {
        completed: { bg: "#22c55e22", color: "#22c55e" },
        active: { bg: "#3b82f622", color: "#3b82f6" },
        inactive: { bg: "#f59e0b22", color: "#f59e0b" },
    };

    const style =
        statusStyles[project.status] || statusStyles.inactive;

    return (
        <div
            className="
        rounded-2xl border p-5
        bg-white dark:bg-zinc-900
        shadow-sm hover:shadow-md
        transition
      "
            style={{ borderColor: "var(--border)" }}
        >
            {/* HEADER */}
            <div className="flex justify-between items-start gap-3">
                <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        {project.description}
                    </p>
                </div>

                <span
                    className="px-3 py-1 text-xs rounded-full font-semibold"
                    style={{
                        background: style.bg,
                        color: style.color,
                    }}
                >
                    {project.status}
                </span>
            </div>

            {/* INFO */}
            <div className="mt-4 text-sm">
                <p>
                    <b>Creator:</b> {project.creator_name}
                </p>
                <p style={{ color: "var(--muted)" }}>
                    {project.creator_email}
                </p>

                <p className="mt-2">
                    <b>Role:</b>{" "}
                    {project.role ? project.role : "—"}
                </p>

                <p className="mt-2">
                    <b>Created:</b>{" "}
                    {new Date(project.created_at).toLocaleDateString()}
                </p>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-4">
                <button
                    onClick={() => setShowAuditLogs(true)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                    title="View operation history"
                >
                    <History size={18} style={{ color: "var(--primary)" }} />
                </button>

                <Link href={`/dashboard/projects/${project.id}`}>
                    <Eye size={18} />
                </Link>

                {canUpdateProject(user) && (
                    <button onClick={() => onEdit(project)}>
                        <Pencil size={18} />
                    </button>
                )}

                {canDeleteProject(user) && (
                    <button onClick={() => onDelete(project)}>
                        <Trash2 size={18} color="#ef4444" />
                    </button>
                )}
            </div>

            <AuditLogModal
                isOpen={showAuditLogs}
                onClose={() => setShowAuditLogs(false)}
                projectId={project.id}
                userRole={user?.role}
                userId={user?.id}
            />
        </div>
    );
}