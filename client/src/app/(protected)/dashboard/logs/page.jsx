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
    Eye,
    Sparkles,
    Search
} from "lucide-react";
import AppLoader from "@/components/common/AppLoader";
import Pagination from "@/components/common/Pagination";

export default function AuditLogPage() {
    const dispatch = useDispatch();

    const { logs, auditLoading, currentLog, pagination } = useSelector((state) => state.audit);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [entityFilter, setEntityFilter] = useState("all");
    const [actionFilter, setActionFilter] = useState("all");
    const [targetEntityId, setTargetEntityId] = useState("");

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
            limit,
            entity_type: entityFilter,
            action_group: actionFilter
        }));
    }, [dispatch, page, limit, entityFilter, actionFilter, targetEntityId]);

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
            return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20";
        }
        if (act.includes("UPDATE") || act.includes("EDIT")) {
            return "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20";
        }
        if (act.includes("DELETE") || act.includes("REMOVE")) {
            return "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20";
        }
        return "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20";
    };

    return (
        <main className="min-h-screen w-full p-4 md:p-8 space-y-6 bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
            {/* HEADER BAR */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6 border-[var(--border)] gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-1">
                        <Sparkles size={14} />
                        <span>System Compliance & Tracking</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2.5">
                        <ShieldAlert className="text-[var(--primary)] w-7 h-7 shrink-0" />
                        Security Audit Logs
                    </h1>
                    <p className="text-xs md:text-sm mt-1 font-medium text-[var(--muted)]">
                        Real-time audit trail of system modifications, task transitions, and project state updates.
                    </p>
                </div>
            </div>

            {/* FILTER CONTROLS */}
            <div className="p-5 border rounded-3xl space-y-5 bg-[var(--card)] border-[var(--border)] shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--muted)] border-b border-[var(--border)]/60 pb-3">
                    <Filter size={14} className="text-[var(--primary)]" />
                    <span>Filter Infrastructure & Scope</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Scope selection */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">Entity Scope</label>
                        <div className="flex bg-[var(--hover)] p-1 rounded-2xl border border-[var(--border)]">
                            {[
                                { id: "all", label: "All Scopes" },
                                { id: "project", label: "Projects" },
                                { id: "task", label: "Tasks" }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => { setEntityFilter(opt.id); setTargetEntityId(""); setPage(1); }}
                                    className={`flex-1 text-center text-xs py-2 rounded-xl font-bold transition-all cursor-pointer ${
                                        entityFilter === opt.id
                                            ? "bg-[var(--primary)] text-white shadow-xs"
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
                        <label className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">Operation Type</label>
                        <select
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                            className="w-full text-xs p-3 rounded-2xl border font-bold outline-none transition-all cursor-pointer bg-[var(--input)] border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)]/50 shadow-2xs"
                        >
                            <option value="all">All Operations (CRUD)</option>
                            <option value="CREATE">Create / Add Operations</option>
                            <option value="UPDATE">Update / Edit Operations</option>
                            <option value="DELETE">Delete / Remove Operations</option>
                        </select>
                    </div>

                    {/* ID Target Search */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">
                            Isolate Entity ID {entityFilter !== "all" && `(${entityFilter.toUpperCase()})`}
                        </label>
                        <div className="relative flex items-center">
                            <Search className="absolute left-3.5 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                            <input
                                type="number"
                                placeholder={entityFilter === "all" ? "Select scope context first..." : `Enter specific ${entityFilter} ID...`}
                                disabled={entityFilter === "all"}
                                value={targetEntityId}
                                onChange={(e) => setTargetEntityId(e.target.value)}
                                className="w-full text-xs py-3 pl-10 pr-9 rounded-2xl border font-bold outline-none transition-all disabled:opacity-40 bg-[var(--input)] border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)]/50 shadow-2xs"
                            />
                            {targetEntityId && (
                                <button
                                    type="button"
                                    onClick={() => setTargetEntityId("")}
                                    className="absolute right-3.5 p-1 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AUDIT LOG TABLE FEED */}
            {auditLoading && logs.length === 0 ? (
                <AppLoader message="Loading security audit logs..." />
            ) : logs.length === 0 ? (
                <div className="rounded-3xl py-20 px-6 text-center border-2 border-dashed flex flex-col items-center justify-center space-y-3 bg-[var(--card)] border-[var(--border)] max-w-xl mx-auto">
                    <div className="p-4 rounded-2xl bg-[var(--hover)] text-[var(--muted)]"><History size={28} /></div>
                    <h3 className="text-base font-extrabold">No Trace Records Found</h3>
                    <p className="text-xs font-medium max-w-xs text-[var(--muted)]">No system events match your selected filters or entity scope.</p>
                </div>
            ) : (
                <>
                    <div className="border rounded-3xl overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-[11px] font-black uppercase tracking-wider bg-[var(--hover)] border-[var(--border)] text-[var(--muted)]">
                                        <th className="p-4 pl-6">Initiated By</th>
                                        <th className="p-4">Action</th>
                                        <th className="p-4">Target Context</th>
                                        <th className="p-4">Timestamp</th>
                                        <th className="p-4 pr-6 text-right">Inspect</th>
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
                                                {/* USER COLUMN */}
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-2xl bg-[var(--input)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shrink-0 font-black text-xs">
                                                            <User size={15} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="font-bold block text-sm text-[var(--text)] truncate">{log.user_name || "Automated System"}</span>
                                                            <span className="text-[10px] block opacity-70 uppercase font-black tracking-wider text-[var(--muted)] mt-0.5">{log.role_name || "Member"}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ACTION BADGE */}
                                                <td className="p-4">
                                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-wider inline-block ${getActionBadgeClass(log.action)}`}>
                                                        {log.action?.replace(/_/g, " ")}
                                                    </span>
                                                </td>

                                                {/* TARGET CONTEXT */}
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 max-w-md">
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--hover)] border border-[var(--border)] text-[10px] font-black uppercase tracking-wider">
                                                                {isProject ? <FolderKanban size={12} className="text-blue-500" /> : <CheckSquare size={12} className="text-purple-500" />}
                                                                {log.entity_type} #{log.entity_id}
                                                            </span>
                                                        </div>
                                                        {(taskTitle || projectName) && (
                                                            <span className="text-xs font-bold text-[var(--text)] line-clamp-1">
                                                                {taskTitle || projectName}
                                                            </span>
                                                        )}
                                                        {summary && (
                                                            <span className="text-[11px] text-[var(--muted)] line-clamp-2">
                                                                {summary}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* TIMESTAMP */}
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-[var(--muted)] font-semibold text-xs">
                                                        <Calendar size={13} className="text-[var(--primary)]" />
                                                        <span>{log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}</span>
                                                    </div>
                                                </td>

                                                {/* INSPECT BUTTON */}
                                                <td className="p-4 pr-6 text-right">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border rounded-2xl transition bg-[var(--input)] border-[var(--border)] text-[var(--text)] group-hover:border-[var(--primary)] group-hover:text-[var(--primary)] group-hover:bg-[var(--primary)]/5 cursor-pointer shadow-2xs"
                                                    >
                                                        <Eye size={13} />
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

                    {/* PAGINATION */}
                    {targetEntityId === "" && (
                        <div className="mt-4 bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xs">
                            <Pagination
                                page={pagination?.currentPage || page}
                                limit={pagination?.perPage || limit}
                                total={pagination?.total || logs.length}
                                totalPages={pagination?.totalPages || 1}
                                onPageChange={({ page: newPage, limit: newLimit }) => {
                                    setPage(newPage);
                                    if (newLimit !== limit) {
                                        setLimit(newLimit);
                                        setPage(1);
                                    }
                                }}
                            />
                        </div>
                    )}
                </>
            )}

            {/* METADATA INSPECTOR MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="relative w-full max-w-xl overflow-hidden border shadow-2xl rounded-3xl bg-[var(--card)] border-[var(--border)] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--hover)]/40">
                            <span className="text-xs font-black tracking-wider uppercase flex items-center gap-2 text-[var(--text)]">
                                <ShieldAlert size={16} className="text-[var(--primary)]" />
                                Audit Trace Inspector (Log #{currentLog?.id || ""})
                            </span>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="p-2 rounded-xl transition text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            {auditLoading && !currentLog ? (
                                <AppLoader message="Loading log details..." className="min-h-[180px]" />
                            ) : currentLog ? (
                                <>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-extrabold tracking-tight text-[var(--text)]">Event Action Summary</h3>
                                        <p className="text-xs font-medium text-[var(--muted)] leading-relaxed">
                                            {currentLog.details?.summary || "System properties recorded during configuration execution."}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl border flex flex-col gap-3 bg-[var(--hover)]/50 border-[var(--border)] text-xs font-bold">
                                        <div className="flex justify-between items-center border-b pb-2.5 border-[var(--border)]/60">
                                            <span className="text-[var(--muted)]">Client IP Address</span>
                                            <span className="font-mono font-black text-xs flex items-center gap-1.5">
                                                <Laptop size={13} className="text-[var(--primary)]" />
                                                {currentLog.ip_address || "::1"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[var(--muted)]">Target Scope</span>
                                            <span className="font-black uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-lg bg-[var(--input)] border border-[var(--border)]">
                                                {currentLog.entity_type} ID: #{currentLog.entity_id}
                                            </span>
                                        </div>
                                        {currentLog.task?.title && (
                                            <div className="flex justify-between items-center border-t pt-2.5 border-[var(--border)]/60 gap-3">
                                                <span className="text-[var(--muted)]">Affected Task</span>
                                                <span className="font-black text-right text-xs text-[var(--text)]">{currentLog.task.title}</span>
                                            </div>
                                        )}
                                        {currentLog.project?.name && (
                                            <div className="flex justify-between items-center border-t pt-2.5 border-[var(--border)]/60 gap-3">
                                                <span className="text-[var(--muted)]">Affected Project</span>
                                                <span className="font-black text-right text-xs text-[var(--text)]">{currentLog.project.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-[var(--text)]">
                                            <Terminal size={14} className="text-[var(--primary)]" />
                                            Field Modifications
                                        </span>
                                        {currentLog.details?.changed_fields?.length > 0 ? (
                                            <div className="space-y-2.5">
                                                {currentLog.details.changed_fields.map((field) => {
                                                    const change = currentLog.details?.changes?.[field];

                                                    return (
                                                        <div key={field} className="p-3.5 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-2xs">
                                                            <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2">
                                                                {field.replace(/_/g, " ")}
                                                            </span>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15">
                                                                    <span className="block text-[9px] font-black uppercase text-rose-500 mb-1">Before</span>
                                                                    <span className="font-mono text-xs font-semibold break-words text-[var(--text)]">{String(change?.from ?? "Empty")}</span>
                                                                </div>
                                                                <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                                                                    <span className="block text-[9px] font-black uppercase text-emerald-500 mb-1">After</span>
                                                                    <span className="font-mono text-xs font-semibold break-words text-[var(--text)]">{String(change?.to ?? "Empty")}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : null}

                                        <div className="p-4 rounded-2xl border overflow-x-auto font-mono text-xs max-h-60 bg-[var(--input)] border-[var(--border)] text-[var(--text)] shadow-inner custom-scrollbar">
                                            {currentLog.details ? (
                                                <pre className="text-xs leading-relaxed whitespace-pre-wrap select-all">
                                                    {JSON.stringify(currentLog.details, null, 2)}
                                                </pre>
                                            ) : (
                                                <p className="text-xs italic font-medium opacity-60 text-center py-4">No detailed JSON parameters recorded for this trace.</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-xs font-bold text-rose-500 py-4">Error loading structural audit log metadata.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
