"use client";

import { useEffect, useState, useCallback } from "react";
import { X, User, FileText, AlertCircle, Loader } from "lucide-react";
import axios from "@/lib/axios";
import { getSocket } from "@/lib/socket";

const filterLogsByRole = (logsData, role) => {
    // Admin can see all logs
    if (role === "admin" || role === "super_admin") {
        return logsData;
    }

    // Manager and Members can only see logs for projects they're part of
    // This filtering could be done server-side for better security
    // For now, returning all project logs as they're already filtered by project
    return logsData;
};

export default function AuditLogModal({
    isOpen,
    onClose,
    projectId,
    userRole,
    userId,
}) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLogs = useCallback(async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                `/audit-logs/project/${projectId}`
            );

            const filteredLogs = filterLogsByRole(
                response.data.data,
                userRole,
                userId
            );

            setLogs(filteredLogs);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to fetch audit logs"
            );
        } finally {
            setLoading(false);
        }
    }, [projectId, userRole, userId]);

    // Real-time socket updates for new audit logs inside AuditLogModal
    useEffect(() => {
        if (!isOpen || !projectId) return;

        const socket = getSocket();

        const handleAuditLogUpdate = (newLog) => {
            // Handle both object structures safely
            const logProjectId = newLog.project?.id || newLog.projectId || newLog.details?.project_id;
            if (Number(logProjectId) === Number(projectId)) {
                const filteredLog = filterLogsByRole([newLog], userRole, userId);
                if (filteredLog.length > 0) {
                    setLogs((prev) => [filteredLog[0], ...prev]);
                }
            }
        };


        const handleGenericRefetch = (data) => {
            const incomingProjectId = data?.project_id || data?.projectId || data?.id;
            if (Number(incomingProjectId) === Number(projectId)) {
                fetchLogs();
            }
        };

    
        socket.on("audit_log_created", handleAuditLogUpdate);
        socket.on("project_updated", handleGenericRefetch);
        socket.on("task_updated", handleGenericRefetch);
        socket.on("task_deleted", handleGenericRefetch); 
        socket.on("member_added", handleGenericRefetch);
        socket.on("member_removed", handleGenericRefetch);

        return () => {
            socket.off("audit_log_created", handleAuditLogUpdate);
            socket.off("project_updated", handleGenericRefetch);
            socket.off("task_updated", handleGenericRefetch);
            socket.off("task_deleted", handleGenericRefetch);
            socket.off("member_added", handleGenericRefetch);
            socket.off("member_removed", handleGenericRefetch);
        };
    }, [isOpen, projectId, userRole, userId, fetchLogs]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="relative w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                style={{ background: "var(--card)" }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{ borderColor: "var(--border)" }}
                >
                    <h2
                        className="text-lg font-bold"
                        style={{ color: "var(--text)" }}
                    >
                        Operation History
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition"
                    >
                        <X size={20} style={{ color: "var(--muted)" }} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader
                                size={32}
                                className="animate-spin mb-3"
                                style={{ color: "var(--primary)" }}
                            />
                            <p style={{ color: "var(--muted)" }}>
                                Loading audit logs...
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <AlertCircle
                                size={18}
                                className="text-red-500 shrink-0 mt-0.5"
                            />
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    {!loading && logs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <FileText
                                size={32}
                                style={{ color: "var(--muted)" }}
                                className="mb-3 opacity-50"
                            />
                            <p style={{ color: "var(--muted)" }}>
                                No operations recorded yet
                            </p>
                        </div>
                    )}

                    {!loading &&
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className="p-4 rounded-lg border transition hover:bg-black/5 dark:hover:bg-white/5"
                                style={{ borderColor: "var(--border)" }}
                            >
                                {/* Action Header */}
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span
                                            className="px-2 py-1 text-xs font-bold rounded-md whitespace-nowrap"
                                            style={{
                                                background:
                                                    getActionColor(
                                                        log.action
                                                    ).bg,
                                                color: getActionColor(
                                                    log.action
                                                ).text,
                                            }}
                                        >
                                            {formatAction(log.action)}
                                        </span>
                                        <span
                                            className="text-xs font-semibold truncate"
                                            style={{
                                                color: "var(--muted)",
                                            }}
                                        >
                                            {log.entity_type.toUpperCase()}
                                            {log.project?.name && ` • ${log.project.name}`}
                                            {log.task?.title && ` • ${log.task.title}`}
                                        </span>
                                    </div>
                                    <span
                                        className="text-xs font-medium whitespace-nowrap"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        {formatTime(log.created_at)}
                                    </span>
                                </div>

                                {/* User Info */}
                                <div
                                    className="flex items-center gap-2 text-xs mb-2"
                                    style={{ color: "var(--muted)" }}
                                >
                                    <User size={14} className="opacity-70" />
                                    <span className="font-medium">
                                        {log.user_name} ({log.role})
                                    </span>
                                </div>

                                {/* Details */}
                                {log.details &&
                                    Object.keys(log.details).length > 0 && (
                                        <div className="mt-2 pl-4 border-l-2 border-opacity-50"
                                            style={{ borderColor: "var(--primary)" }}
                                        >
                                            <pre
                                                className="text-xs font-mono overflow-x-auto"
                                                style={{
                                                    color: "var(--muted)",
                                                }}
                                            >
                                                {JSON.stringify(
                                                    log.details,
                                                    null,
                                                    2
                                                ).substring(0, 500)}
                                            </pre>
                                        </div>
                                    )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

function formatAction(action) {
    return action
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function getActionColor(action) {
    if (action.startsWith("CREATE")) {
        return { bg: "#10b98122", text: "#10b981" };
    }
    if (action.startsWith("UPDATE")) {
        return { bg: "#3b82f622", text: "#3b82f6" };
    }
    if (action.startsWith("DELETE")) {
        return { bg: "#ef444422", text: "#ef4444" };
    }
    return { bg: "#6b728022", text: "#6b7280" };
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
}
