import React, { useState } from "react";
import { Calendar, ArrowUpRight, ShieldCheck, Layers } from "lucide-react";

export default function CriticalDeadlinesRadar({ overdueTasks = [], deadlineTasks = [], onInspectTask }) {
    const [activeTab, setActiveTab] = useState("overdue");

    const totalOverdue = overdueTasks.length;
    const totalUpcoming = deadlineTasks.length;
    const activeList = activeTab === "overdue" ? overdueTasks : deadlineTasks;

    return (
        <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] space-y-5">
            
            {/* ─── HEADER & CONTROLLER NAVIGATION ─── */}
            <div className="flex items-center justify-between gap-4 pb-1">
                <div className="space-y-0.5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-[var(--primary)]" /> Risk Matrix
                    </h3>
                    <p className="text-sm font-bold tracking-tight text-[var(--text)]">
                        Critical Deadlines
                    </p>
                </div>

                {/* 🎛️ Minimalist Segmented Control Switch */}
                <div className="p-0.5 bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--border)]/40 rounded-lg flex items-center">
                    <button
                        onClick={() => setActiveTab("overdue")}
                        className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all duration-150 outline-none cursor-pointer ${
                            activeTab === "overdue"
                                ? "bg-[var(--card)] text-[var(--text)] shadow-xs border border-[var(--border)]/50"
                                : "text-[var(--muted)] hover:text-[var(--text)]"
                        }`}
                    >
                        <span>Overdue</span>
                        <span className={`text-[10px] font-bold ${activeTab === "overdue" ? "text-red-500" : "opacity-60"}`}>
                            {totalOverdue}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all duration-150 outline-none cursor-pointer ${
                            activeTab === "upcoming"
                                ? "bg-[var(--card)] text-[var(--text)] shadow-xs border border-[var(--border)]/50"
                                : "text-[var(--muted)] hover:text-[var(--text)]"
                        }`}
                    >
                        <span>Upcoming</span>
                        <span className={`text-[10px] font-bold ${activeTab === "upcoming" ? "text-amber-500" : "opacity-60"}`}>
                            {totalUpcoming}
                        </span>
                    </button>
                </div>
            </div>

            {/* ─── FLAT, BORDERLESS LIST CONTAINER ─── */}
            <div className="divide-y divide-[var(--border)]/40 max-h-[360px] overflow-y-auto pr-1 select-none">
                {activeList.length > 0 ? (
                    activeList.slice(0, 5).map((task) => {
                        const isOverdueTab = activeTab === "overdue";
                        return (
                            <div
                                key={`radar-task-node-${task.id}`}
                                onClick={() => onInspectTask?.(task.id)}
                                className="group py-3 first:pt-0 last:pb-0 cursor-pointer flex items-center justify-between gap-6 transition-all"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* High-Precision Strategic Urgency Dot Indicator */}
                                    <span 
                                        className={`w-2 h-2 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                                            isOverdueTab ? "bg-red-500 animate-pulse" : "bg-amber-500"
                                        }`} 
                                    />
                                    
                                    <div className="min-w-0 space-y-0.5">
                                        <h4 className="text-xs font-medium text-[var(--text)] truncate transition-colors group-hover:text-[var(--primary)]">
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                                            <span className="flex items-center gap-1 font-normal">
                                                <Calendar className="w-3 h-3 opacity-60" />
                                                {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                            </span>
                                            {task.project?.name && (
                                                <>
                                                    <span className="opacity-30 text-[10px] select-none">•</span>
                                                    <span className="truncate max-w-[130px] font-normal opacity-75">
                                                        {task.project.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Clean Micro-Interactions Element */}
                                <div className="flex items-center shrink-0">
                                    <ArrowUpRight className="w-3.5 h-3.5 text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* ─── PREMIUM MINIMALIST EMPTY STATE ─── */
                    <div className="text-center py-16 flex flex-col items-center justify-center text-xs text-[var(--muted)]">
                        <ShieldCheck className="w-6 h-6 mb-2 text-[var(--muted)] opacity-35" />
                        <p className="font-medium text-[var(--text)]">
                            {activeTab === "overdue" ? "No Overdue Breaches" : "Clear Schedule Horizon"}
                        </p>
                        <p className="text-[11px] mt-0.5 opacity-65">
                            {activeTab === "overdue"
                                ? "All tracked milestones are executing safely on schedule."
                                : "No production windows are breaching constraints."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}