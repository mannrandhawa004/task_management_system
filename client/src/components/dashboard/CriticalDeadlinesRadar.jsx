import React, { useState } from "react";
import { Calendar, ArrowUpRight, ShieldCheck, AlertCircle, Clock } from "lucide-react";

export default function CriticalDeadlinesRadar({ overdueTasks = [], deadlineTasks = [], onInspectTask }) {
    const [activeTab, setActiveTab] = useState("overdue");

    const totalOverdue = overdueTasks.length;
    const totalUpcoming = deadlineTasks.length;
    const activeList = activeTab === "overdue" ? overdueTasks : deadlineTasks;

    return (
        <div className="p-5 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col justify-between">
            
            {/* Clean Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]/60 mb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                        <AlertCircle size={14} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[var(--text)]">Risk & Deadlines</h3>
                        <p className="text-[11px] text-[var(--muted)]">Milestone breaches & timeline</p>
                    </div>
                </div>

                {/* Minimalist Segmented Control */}
                <div className="p-0.5 bg-[var(--hover)] border border-[var(--border)] rounded-lg flex items-center text-xs">
                    <button
                        onClick={() => setActiveTab("overdue")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                            activeTab === "overdue"
                                ? "bg-[var(--card)] text-[var(--text)] shadow-xs border border-[var(--border)]"
                                : "text-[var(--muted)] hover:text-[var(--text)]"
                        }`}
                    >
                        <span>Overdue</span>
                        <span className={`text-[10px] px-1 rounded ${activeTab === "overdue" ? "bg-red-500/15 text-red-500 font-black" : "opacity-60"}`}>
                            {totalOverdue}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                            activeTab === "upcoming"
                                ? "bg-[var(--card)] text-[var(--text)] shadow-xs border border-[var(--border)]"
                                : "text-[var(--muted)] hover:text-[var(--text)]"
                        }`}
                    >
                        <span>Upcoming</span>
                        <span className={`text-[10px] px-1 rounded ${activeTab === "upcoming" ? "bg-amber-500/15 text-amber-500 font-black" : "opacity-60"}`}>
                            {totalUpcoming}
                        </span>
                    </button>
                </div>
            </div>

            {/* Compact List */}
            <div className="space-y-1">
                {activeList.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]/40 max-h-[360px] overflow-y-auto pr-1">
                        {activeList.slice(0, 5).map((task) => {
                            const isOverdue = activeTab === "overdue";
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => onInspectTask?.(task.id)}
                                    className="group py-2.5 px-2 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-all hover:bg-[var(--hover)]"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <span 
                                            className={`w-2 h-2 rounded-full shrink-0 ${
                                                isOverdue ? "bg-red-500 animate-pulse" : "bg-amber-500"
                                            }`} 
                                        />
                                        
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h4 className="text-xs font-bold text-[var(--text)] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                    {task.title}
                                                </h4>
                                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${
                                                    isOverdue ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                                                }`}>
                                                    <Calendar size={9} />
                                                    {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                                                <span className="truncate">
                                                    {task.project?.name ? `in ${task.project.name}` : "General Task"}
                                                </span>
                                                <span className="shrink-0 text-[10px] font-medium opacity-75">
                                                    {task.priority ? `${task.priority} priority` : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--muted)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all shrink-0 ml-1">
                                        <ArrowUpRight size={13} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 flex flex-col items-center justify-center text-xs text-[var(--muted)]">
                        <ShieldCheck className="w-6 h-6 mb-2 opacity-30 text-emerald-500" />
                        <p className="font-bold uppercase tracking-wider text-[var(--text)]">
                            {activeTab === "overdue" ? "No Overdue Tasks" : "Clear Schedule"}
                        </p>
                        <p className="text-[11px] mt-0.5 text-[var(--muted)]">
                            {activeTab === "overdue"
                                ? "All tracked tasks are on schedule."
                                : "No upcoming critical deadlines."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}