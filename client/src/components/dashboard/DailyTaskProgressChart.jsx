"use client";

import React, { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, Loader2, ArrowUpRight } from "lucide-react";

// Reads the `.dark` class directly from the document — instant, no flash.
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

// Custom Tooltip with enhanced styling
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--card)] border border-[var(--border)] p-3.5 rounded-2xl shadow-xl min-w-[160px] backdrop-blur-md">
                <p className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)] mb-2 border-b border-[var(--border)]/60 pb-1.5">{label}</p>
                <div className="flex flex-col gap-2">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2.5 h-2.5 rounded-full shadow-xs"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-[var(--muted)] font-bold">
                                    {entry.name}
                                </span>
                            </div>
                            <span className="font-black text-[var(--text)]">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function DailyTaskProgressChart({ data = [], loading = false }) {
    const isDark = useIsDark();


    const s1 = isDark ? "#fed7aa" : "#0b573a";
    const s2 = isDark ? "#fb923c" : "#16a34a";
    const s3 = isDark ? "#ea580c" : "#4ade80";
    const accentColor = isDark ? "#fb923c" : "#0b573a";

    const chartData = data.map((item) => ({
        date: new Date(item.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        }),
        completed: item.completed_count || 0,
        inProgress: item.in_progress_count || 0,
        todo: item.todo_count || 0,
        total: item.total_tasks_updated || 0,
    }));

    const totalCompleted = chartData.reduce((sum, item) => sum + item.completed, 0);
    const totalInProgress = chartData.reduce((sum, item) => sum + item.inProgress, 0);
    const totalTodo = chartData.reduce((sum, item) => sum + item.todo, 0);
    const grandTotal = totalCompleted + totalInProgress + totalTodo;
    const completionRate = grandTotal > 0 ? Math.round((totalCompleted / grandTotal) * 100) : 0;

    if (loading) {
        return (
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm h-80 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin w-7 h-7 text-[var(--primary)] mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Loading activity trend…</p>
            </div>
        );
    }

    return (
        <div className="p-5 md:p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between h-full">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]/60 mb-4 gap-2 flex-wrap">
                <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: accentColor }}>
                        <TrendingUp size={13} />
                        <span>Performance & Velocity</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-[var(--text)]">
                        Task Progress Trend
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black border" style={{ backgroundColor: `${accentColor}18`, borderColor: `${accentColor}35`, color: accentColor }}>
                        {completionRate}% Completion Rate
                    </span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="w-full pt-1">
                {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16">
                        <div className="w-12 h-12 rounded-full bg-[var(--muted)]/10 flex items-center justify-center mb-3">
                            <TrendingUp size={22} className="text-[var(--muted)] opacity-40" />
                        </div>
                        <p className="text-xs text-[var(--muted)] font-black uppercase tracking-widest">
                            No data available
                        </p>
                    </div>
                ) : (
                    <div className="h-[240px] w-full -ml-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="themedCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={s1} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={s1} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="themedInProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={s2} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={s2} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="themedTodo" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={s3} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={s3} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--border)"
                                    opacity={0.35}
                                />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--border)"
                                    fontSize={11}
                                    fontWeight={700}
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--border)" }}
                                    tick={{ fill: "var(--muted)" }}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="var(--border)"
                                    fontSize={11}
                                    fontWeight={700}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "var(--muted)" }}
                                    dx={-5}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{
                                        stroke: "var(--border)",
                                        strokeWidth: 2,
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        paddingTop: "15px",
                                        color: "var(--muted)"
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    name="Completed"
                                    stroke={s1}
                                    strokeWidth={2.5}
                                    fill="url(#themedCompleted)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: s1, stroke: "#fff", strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="inProgress"
                                    name="In Progress"
                                    stroke={s2}
                                    strokeWidth={2.5}
                                    fill="url(#themedInProgress)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: s2, stroke: "#fff", strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="todo"
                                    name="To Do"
                                    stroke={s3}
                                    strokeWidth={2.5}
                                    fill="url(#themedTodo)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: s3, stroke: "#fff", strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}