"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getAllLogsThunk,
    getLogByIdThunk,
    getProjectLogsThunk,
    getTaskLogsThunk
} from "@/features/logs/thunks/auditThunk";
import { clearCurrentLog } from "@/features/logs/slices/auditSlice";
import {
    ShieldAlert,
    History,
    User,
    Calendar,
    X,
    Laptop,
    Filter,
    FolderKanban,
    CheckSquare,
    Terminal,
    ChevronLeft,
    ChevronRight,
    Eye
} from "lucide-react";
import AppLoader from "@/components/common/AppLoader";

export default function AuditLogPage() {
    const dispatch = useDispatch();

    const { logs, auditLoading, currentLog, pagination } = useSelector((state) => state.audit);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [entityFilter, setEntityFilter] = useState("all");
    const [actionFilter, setActionFilter] = useState("all");
    const [targetEntityId, setTargetEntityId] = useState("");

    // Sync / Hydrate data pipelines based on selected control configuration states
    useEffect(() => {
        if (targetEntityId.trim() !== "") {
            if (entityFilter === "project") {
                dispatch(getProjectLogsThunk(targetEntityId));
                return;
            } else if (entityFilter === "task") {
                dispatch(getTaskLogsThunk(targetEntityId));
                return;
            }
        }

        dispatch(getAllLogsThunk({
            page,
            limit: 10,
            entity_type: entityFilter,
            action_group: actionFilter
        }));
    }, [dispatch, page, entityFilter, actionFilter, targetEntityId]);

    const handleInspectLog = (logId) => {
        dispatch(getLogByIdThunk(logId));
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        dispatch(clearCurrentLog());
    };

    const getActionBadgeClass = (action = "") => {
        const act = action.toUpperCase();
        if (act.includes("CREATE") || act.includes("ADD")) {
            return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        }
        if (act.includes("UPDATE") || act.includes("EDIT")) {
            return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        }
        if (act.includes("DELETE") || act.includes("REMOVE")) {
            return "bg-rose-500/10 text-rose-500 border-rose-500/20";
        }
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    };

    return (
        <main className="min-h-screen w-full p-4 md:p-8 space-y-6 bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">

            {/* HEADER HEADER MAIN BAR */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6 border-[var(--border)] gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2.5">
                        <ShieldAlert className="text-[var(--primary)] w-7 h-7 shrink-0" />
                        Security Audit Logs
                    </h2>
                    <p className="text-xs md:text-sm mt-1.5 font-medium text-[var(--muted)]">
                        Monitor system activities, entity state configurations, and real-time user manipulation deltas.
                    </p>
                </div>
            </div>

            {/* CONTROL MATRIX BAR */}
            <div className="p-5 border rounded-2xl space-y-5 bg-[var(--card)] border-[var(--border)] shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--muted)]">
                    <Filter size={14} className="text-[var(--primary)]" />
                    <span>Filter Infrastructure Matrix</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Scope selection */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">Scope Context Type</label>
                        <div className="flex bg-[var(--hover)] p-1 rounded-xl border border-[var(--border)]">
                            {[
                                { id: "all", label: "All Scope" },
                                { id: "project", label: "Projects" },
                                { id: "task", label: "Tasks" }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => { setEntityFilter(opt.id); setTargetEntityId(""); setPage(1); }}
                                    className={`flex-1 text-center text-xs py-2 rounded-lg font-bold transition-all cursor-pointer ${entityFilter === opt.id
                                            ? "bg-[var(--primary)] text-white shadow-xs scale-[1.01]"
                                            : "text-[var(--muted)] hover:text-[var(--text)]"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action selection */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">Operation Event Type (CRUD)</label>
                        <select
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                            className="w-full text-xs p-2.5 rounded-xl border font-bold outline-none transition-all cursor-pointer bg-[var(--input)] border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)]/50"
                        >
                            <option value="all">All Operations (CRUD)</option>
                            <option value="CREATE">Create / Add Operations</option>
                            <option value="UPDATE">Update / Edit Operations</option>
                            <option value="DELETE">Delete / Remove Operations</option>
                        </select>
                    </div>

                    {/* ID Target Parameter Search */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">
                            Isolate Targeted ID {entityFilter !== "all" && `(${entityFilter})`}
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type="number"
                                placeholder={entityFilter === "all" ? "Select scope context first..." : `Enter specific ${entityFilter} ID...`}
                                disabled={entityFilter === "all"}
                                value={targetEntityId}
                                onChange={(e) => setTargetEntityId(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-xl border font-bold outline-none transition-all disabled:opacity-40 bg-[var(--input)] border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)]/50"
                            />
                            {targetEntityId && (
                                <button onClick={() => setTargetEntityId("")} className="absolute right-3 opacity-60 hover:opacity-100 cursor-pointer">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* DYNAMIC DATA LEDGER VIEW FEED */}
            {auditLoading && logs.length === 0 ? (
                <AppLoader message="Loading audit logs..." />
            ) : logs.length === 0 ? (
                <div className="rounded-2xl py-20 px-6 text-center border border-dashed flex flex-col items-center justify-center space-y-3 bg-[var(--card)] border-[var(--border)] max-w-xl mx-auto">
                    <div className="p-3.5 rounded-2xl bg-[var(--hover)] text-[var(--muted)]"><History size={24} /></div>
                    <h3 className="text-base font-bold">No Trace Matches Found</h3>
                    <p className="text-xs font-medium max-w-xs text-[var(--muted)]">No active network tracking maps correspond to your filter variables.</p>
                </div>
            ) : (
                <>
                    <div className="border rounded-2xl overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-[11px] font-black uppercase tracking-wider bg-[var(--hover)] border-[var(--border)] text-[var(--muted)]">
                                        <th className="p-4 pl-6">Operative User</th>
                                        <th className="p-4">Action Pipeline</th>
                                        <th className="p-4">Target Context Model ID</th>
                                        <th className="p-4">Timestamp</th>
                                        <th className="p-4 pr-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-xs font-medium border-[var(--border)]">
                                    {logs.filter(Boolean).map((log) => {
                                        const isProject = log.entity_type?.toLowerCase() === "project";
                                        const projectName = log.project?.name;
                                        const taskTitle = log.task?.title;
                                        const summary = log.details?.summary;

                                        return (
                                            <tr
                                                key={log.id}
                                                className="hover:bg-[var(--hover)]/60 transition-colors group cursor-pointer"
                                                onClick={() => handleInspectLog(log.id)}
                                            >
                                                {/* USER FIELD MAPPER */}
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-[var(--input)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shrink-0">
                                                            <User size={14} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="font-bold block truncate">{log.user_name || "System automated"}</span>
                                                            <span className="text-[10px] block opacity-70 uppercase font-black tracking-wider text-[var(--muted)]">{log.role_name || "Member"}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ACTION CHIP BADGE */}
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-wider ${getActionBadgeClass(log.action)}`}>
                                                        {log.action?.replace("_", " ")}
                                                    </span>
                                                </td>

                                                {/* ACCURATE RELATION IDENTIFICATION STRINGS BLOCK */}
                                                <td className="p-4">
                                                    <div className="flex flex-col text-left">
                                                        <span className="capitalize font-bold flex items-center gap-1.5">
                                                            {isProject ? <FolderKanban size={13} className="text-blue-500" /> : <CheckSquare size={13} className="text-purple-500" />}
                                                            {log.entity_type}
                                                        </span>
                                                        <span className={`text-[10px] pl-5 font-black mt-0.5 uppercase tracking-wide ${isProject ? "text-blue-500/80" : "text-purple-500/80"}`}>
                                                            {`ID: #${log.entity_id}`}
                                                        </span>
                                                        {taskTitle && (
                                                            <span className="text-[10px] pl-5 mt-1 text-[var(--muted)] line-clamp-1">
                                                                Task: {taskTitle}
                                                            </span>
                                                        )}
                                                        {projectName && (
                                                            <span className="text-[10px] pl-5 mt-0.5 text-[var(--muted)] line-clamp-1">
                                                                Project: {projectName}
                                                            </span>
                                                        )}
                                                        {summary && (
                                                            <span className="text-[10px] pl-5 mt-1 text-[var(--muted)] line-clamp-2 max-w-[360px]">
                                                                {summary}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* DATE TIMESTAMP FIELD */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-[var(--muted)] font-semibold">
                                                        <Calendar size={13} />
                                                        <span>{log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}</span>
                                                    </div>
                                                </td>

                                                {/* TRACE ACTIONS BUTTON */}
                                                <td className="p-4 pr-6 text-right">
                                                    <button className="flex items-center gap-1.5 ml-auto px-3 py-1.5 text-xs font-bold border rounded-xl transition bg-[var(--input)] border-[var(--border)] text-[var(--text)] group-hover:border-[var(--primary)]/40 group-hover:text-[var(--primary)] cursor-pointer">
                                                        <Eye size={12} />
                                                        <span>Inspect</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {pagination && pagination.totalPages > 1 && targetEntityId === "" && (
                        <div className="flex justify-center items-center gap-2 text-xs font-bold mt-4">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((prev) => prev - 1)}
                                className="p-2 rounded-xl border transition bg-[var(--card)] border-[var(--border)] disabled:opacity-40 hover:bg-[var(--hover)] cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[var(--muted)] px-3">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage((prev) => prev + 1)}
                                className="p-2 rounded-xl border transition bg-[var(--card)] border-[var(--border)] disabled:opacity-40 hover:bg-[var(--hover)] cursor-pointer"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* METADATA INSPECTOR MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="relative w-full max-w-lg overflow-hidden border shadow-2xl rounded-3xl bg-[var(--card)] border-[var(--border)] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                            <span className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2 text-[var(--muted)]">
                                <ShieldAlert size={14} className="text-[var(--primary)]" />
                                Trace Inspector Matrix (Log #{currentLog?.id || ""})
                            </span>
                            <button onClick={handleCloseModal} className="p-1.5 rounded-xl transition text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="p-6 space-y-5">
                            {auditLoading && !currentLog ? (
                                <AppLoader message="Loading log details..." className="min-h-[180px]" />
                            ) : currentLog ? (
                                <>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-extrabold tracking-tight">System Action Payload</h3>
                                        <p className="text-xs font-medium text-[var(--muted)] leading-relaxed">
                                            {currentLog.details?.summary || "Deep system properties recorded during configuration variations inside the database cluster."}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl border flex flex-col gap-3 bg-[var(--hover)] border-[var(--border)] text-xs font-bold">
                                        <div className="flex justify-between items-center border-b pb-2.5 border-[var(--border)]">
                                            <span className="text-[var(--muted)]">Client IP Gateway</span>
                                            <span className="font-mono font-black text-[11px] flex items-center gap-1.5"><Laptop size={12} className="opacity-50" />{currentLog.ip_address || "::1"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[var(--muted)]">Target Model Map Scope</span>
                                            <span className="font-black uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-lg bg-[var(--input)] border border-[var(--border)]">
                                                {currentLog.entity_type} ID: #{currentLog.entity_id}
                                            </span>
                                        </div>
                                        {currentLog.task?.title && (
                                            <div className="flex justify-between items-center border-t pt-2.5 border-[var(--border)] gap-3">
                                                <span className="text-[var(--muted)]">Task</span>
                                                <span className="font-black text-right text-[11px]">{currentLog.task.title}</span>
                                            </div>
                                        )}
                                        {currentLog.project?.name && (
                                            <div className="flex justify-between items-center border-t pt-2.5 border-[var(--border)] gap-3">
                                                <span className="text-[var(--muted)]">Project</span>
                                                <span className="font-black text-right text-[11px]">{currentLog.project.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 text-[var(--muted)]">
                                            <Terminal size={13} className="text-[var(--primary)]" />
                                            Change Overview
                                        </span>
                                        {currentLog.details?.changed_fields?.length > 0 && (
                                            <div className="space-y-2">
                                                {currentLog.details.changed_fields.map((field) => {
                                                    const change = currentLog.details?.changes?.[field];

                                                    return (
                                                        <div key={field} className="p-3 rounded-xl border bg-[var(--hover)] border-[var(--border)] text-xs">
                                                            <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2">{field.replace("_", " ")}</span>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                <div>
                                                                    <span className="block text-[10px] font-black uppercase text-rose-500/80 mb-1">Before</span>
                                                                    <span className="font-mono text-[11px] break-words">{String(change?.from ?? "Empty")}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="block text-[10px] font-black uppercase text-emerald-500/80 mb-1">After</span>
                                                                    <span className="font-mono text-[11px] break-words">{String(change?.to ?? "Empty")}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <div className="p-4 rounded-2xl border overflow-x-auto font-mono text-[11px] max-h-56 bg-[var(--input)] border-[var(--border)] text-[var(--text)] shadow-inner">
                                            {currentLog.details ? (
                                                <pre className="text-xs leading-relaxed whitespace-pre-wrap breakdown-words select-all">
                                                    {JSON.stringify(currentLog.details, null, 2)}
                                                </pre>
                                            ) : (
                                                <p className="text-xs italic font-medium opacity-60 text-center py-4">No parameters payload map compiled.</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-xs font-bold text-rose-500 py-4">Error loading structural workspace trace indicators configuration profiles.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
