"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { ArrowUpRight, BarChart3, PieChart as PieIcon } from "lucide-react";

// Reads the `.dark` class directly from the document for reliable theme detection.
// Falls back to false during SSR. Re-syncs whenever the class list changes.
function useIsDark() {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const el = document.documentElement;
        const update = () => setIsDark(el.classList.contains("dark"));
        update();
        const observer = new MutationObserver(update);
        observer.observe(el, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);
    return isDark;
}

export function ProjectDistributionChart({ data }) {
    const isDark = useIsDark();

    const gradTop = isDark ? "#fed7aa" : "#15803d";
    const gradBot = isDark ? "rgba(249, 115, 22, 0.15)" : "rgba(11, 87, 58, 0.15)";
    const accentColor = isDark ? "#fb923c" : "#0b573a";

    if (!data || data.length === 0 || !data.some((d) => d.tasks > 0)) {
        return (
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm h-80 flex flex-col items-center justify-center text-xs text-[var(--muted)] border-dashed">
                <p className="font-bold uppercase tracking-wider">No project volume indexed</p>
                <p className="text-[11px] mt-1 text-[var(--muted)]/80">Active projects will show task distributions here.</p>
            </div>
        );
    }

    return (
        <div className="p-5 md:p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 h-full">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]/60 mb-4">
                <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: accentColor }}>
                        <BarChart3 size={13} />
                        <span>Volume Analytics</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-[var(--text)]">
                        Project Task Distribution
                    </h3>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-[var(--hover)] border-[var(--border)] text-[var(--muted)]">
                    <ArrowUpRight size={16} strokeWidth={2.6} />
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 w-full min-w-0 min-h-0 -ml-2 pt-1">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
                        barCategoryGap="28%"
                    >
                        <defs>
                            <linearGradient id="themedBarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={gradTop} stopOpacity={0.95} />
                                <stop offset="100%" stopColor={gradBot} stopOpacity={0.25} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="var(--border)"
                            opacity={0.35}
                        />

                        <XAxis
                            dataKey="name"
                            stroke="var(--border)"
                            tick={{ fontSize: 10, fontWeight: 700, fill: "var(--muted)" }}
                            interval={0}
                            tickLine={false}
                            axisLine={{ stroke: "var(--border)" }}
                            dy={10}
                            tickFormatter={(val) => val && val.length > 12 ? val.slice(0, 11) + "…" : val}
                        />

                        <YAxis
                            stroke="var(--border)"
                            tick={{ fontSize: 11, fontWeight: 700, fill: "var(--muted)" }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            dx={-5}
                        />

                        <Tooltip
                            cursor={{ fill: "var(--hover)", radius: 8 }}
                            contentStyle={{
                                background: "var(--card)",
                                borderColor: "var(--border)",
                                color: "var(--text)",
                                borderRadius: "14px",
                                fontSize: "12px",
                                fontWeight: "700",
                                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                                padding: "10px 14px"
                            }}
                            wrapperStyle={{ outline: 'none' }}
                        />

                        <Bar
                            dataKey="tasks"
                            fill="url(#themedBarGradient)"
                            radius={[8, 8, 0, 0]}
                            barSize={32}
                            maxBarSize={40}
                            className="transition-all duration-300 hover:opacity-85 cursor-pointer outline-none"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function ProjectStatusChart({ projectData, totalProjects }) {
    const isDark = useIsDark();

    const shades = isDark
        ? ["#fed7aa", "#fb923c", "#ea580c"]
        : ["#0b573a", "#16a34a", "#4ade80"];
    const accentColor = isDark ? "#fb923c" : "#0b573a";

    if (!projectData || projectData.length === 0) return null;
    return (
        <div className="p-5 md:p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 h-full">
            <div className="pb-3 border-b border-[var(--border)]/60 mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: accentColor }}>Project Infrastructure</h3>
                <p className="text-lg font-black tracking-tight text-[var(--text)]">Lifecycle Share</p>
            </div>
            <div className="h-52 w-full min-w-0 min-h-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                        <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)", borderRadius: "12px", fontWeight: 700 }} />
                        <Pie
                            data={projectData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={54}
                            outerRadius={78}
                            paddingAngle={6}
                            labelLine={false}
                        >
                            {projectData.map((entry, index) => (
                                <Cell key={`project-cell-${index}`} fill={shades[index % shades.length]} stroke="transparent" />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-[var(--text)]">{totalProjects}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Projects</span>
                </div>
            </div>
            <div className="flex justify-around text-center text-xs pt-4 mt-2 border-t border-[var(--border)]/60">
                {projectData.map((data, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: shades[idx % shades.length] }} />
                        <div className="text-[var(--muted)] text-[10px] uppercase font-bold">{data.name}</div>
                        <div className="font-black text-sm mt-0.5 text-[var(--text)]">{data.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TaskBreakdownChart({ chartData, totalTasks, todoCount, inProgressCount, completedCount }) {
    const isDark = useIsDark();

    const shades = isDark
        ? { completed: "#fed7aa", progress: "#fb923c", todo: "#ea580c" }
        : { completed: "#0b573a", progress: "#16a34a", todo: "#4ade80" };
    const accentColor = isDark ? "#fb923c" : "#0b573a";

    // Distribute data using monochromatic theme hex codes
    const themedData = chartData.map(item => {
        let color = shades.completed;
        if (item.name?.toLowerCase().includes("completed")) color = shades.completed;
        else if (item.name?.toLowerCase().includes("progress")) color = shades.progress;
        else if (item.name?.toLowerCase().includes("todo") || item.name?.toLowerCase().includes("upcoming")) color = shades.todo;
        return { ...item, color };
    });

    return (
        <div className="p-5 md:p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 h-full">
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]/60 mb-4">
                <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: accentColor }}>
                        <PieIcon size={13} />
                        <span>Status Allocation</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-[var(--text)]">
                        Task Breakdown
                    </h3>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-[var(--hover)] border-[var(--border)] text-[var(--muted)]">
                    <ArrowUpRight size={16} strokeWidth={2.6} />
                </div>
            </div>

            <div className="h-64 w-full min-w-0 min-h-0 relative flex items-center justify-center">
                {themedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                            <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)", borderRadius: "14px", fontWeight: 700, fontSize: "12px" }} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                content={({ payload }) => (
                                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-3 text-xs">
                                        {payload?.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-1.5 font-bold">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                                <span className="text-[var(--muted)]">{entry.value}:</span>
                                                <span className="font-black text-[var(--text)]">{entry.payload?.value || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            />
                            <Pie
                                data={themedData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={48}
                                outerRadius={70}
                                paddingAngle={6}
                                labelLine={false}
                            >
                                {themedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-xs font-bold text-[var(--muted)]">No active tasks registered.</div>
                )}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none -mt-4">
                    <span className="text-2xl font-black tracking-tight text-[var(--text)]">{totalTasks}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)] mt-0.5">Total Tasks</span>
                </div>
            </div>
        </div>
    );
}

export function ProjectProgressGaugeChart({ completedCount = 0, inProgressCount = 0, todoCount = 0, totalTasks = 0 }) {
    const isDark = useIsDark();

    const completedColor = isDark ? "#fed7aa" : "#0b573a";
    const inProgressColor = isDark ? "#fb923c" : "#16a34a";
    const pendingColor = isDark ? "#ea580c" : "#94a3b8";

    const total = totalTasks || (completedCount + inProgressCount + todoCount) || 1;
    const rate = Math.round((completedCount / total) * 100) || 0;

    const data = [
        { name: "Completed", value: completedCount || 1, color: completedColor },
        { name: "In Progress", value: inProgressCount || 0, color: inProgressColor },
        { name: "Pending", value: todoCount || 0, color: pendingColor }
    ];

    return (
        <div className="p-5 md:p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 h-full">
            <div className="pb-3 border-b border-[var(--border)]/60 mb-2">
                <h3 className="text-lg font-black tracking-tight text-[var(--text)]">Project Progress</h3>
            </div>

            <div className="h-52 w-full min-w-0 min-h-0 relative flex items-center justify-center -mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <defs>
                            <pattern id="gaugeStripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <rect width="4" height="8" fill={pendingColor} opacity="0.4" />
                            </pattern>
                        </defs>
                        <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)", borderRadius: "12px", fontWeight: 700, fontSize: "12px" }} />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            startAngle={180}
                            endAngle={0}
                            cy="75%"
                            innerRadius={65}
                            outerRadius={92}
                            paddingAngle={4}
                            stroke="transparent"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`gauge-cell-${index}`} fill={index === 2 ? "url(#gaugeStripes)" : entry.color} stroke="transparent" />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-6 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-[var(--text)] tracking-tight">{rate}%</span>
                    <span className="text-xs font-bold text-[var(--muted)] mt-0.5">Project Ended</span>
                </div>
            </div>

            <div className="flex items-center justify-around text-xs font-bold pt-3 border-t border-[var(--border)]/60 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: completedColor }} />
                    <span className="text-[var(--muted)]">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: inProgressColor }} />
                    <span className="text-[var(--muted)]">In Progress</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-400" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${pendingColor}, ${pendingColor} 2px, transparent 2px, transparent 4px)` }} />
                    <span className="text-[var(--muted)]">Pending</span>
                </div>
            </div>
        </div>
    );
}

