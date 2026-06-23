"use client";

import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";

// Custom Tooltip with enhanced styling
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-lg shadow-lg min-w-[150px] backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">{label}</p>
                <div className="flex flex-col gap-1.5">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2 h-2 rounded-full shadow-sm"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-[var(--muted)] font-medium">
                                    {entry.name}
                                </span>
                            </div>
                            <span className="font-bold text-[var(--text)]">
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
    // Prepare data for chart
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

    // Calculate statistics
    const totalCompleted = chartData.reduce((sum, item) => sum + item.completed, 0);
    const totalInProgress = chartData.reduce((sum, item) => sum + item.inProgress, 0);
    const totalTodo = chartData.reduce((sum, item) => sum + item.todo, 0);
    const grandTotal = totalCompleted + totalInProgress + totalTodo;
    const completionRate = grandTotal > 0 ? Math.round((totalCompleted / grandTotal) * 100) : 0;

    const stats = [
        {
            label: "Completed",
            value: totalCompleted,
            color: "#22C55E",
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-600 dark:text-emerald-400",
            borderColor: "border-emerald-500/30",
        },
        {
            label: "In Progress",
            value: totalInProgress,
            color: "#F59E0B",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-600 dark:text-amber-400",
            borderColor: "border-amber-500/30",
        },
        {
            label: "To Do",
            value: totalTodo,
            color: "#3B82F6",
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-600 dark:text-blue-400",
            borderColor: "border-blue-500/30",
        },
        {
            label: "Completion Rate",
            value: `${completionRate}%`,
            color: "#6366F1",
            bgColor: "bg-indigo-500/10",
            textColor: "text-indigo-600 dark:text-indigo-400",
            borderColor: "border-indigo-500/30",
        },
    ];

    if (loading) {
        return (
            <div className="border rounded-xl overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-sm">
                <div className="p-4 border-b flex items-center justify-between border-[var(--border)]">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-500" />
                        <h2 className="text-sm font-bold tracking-tight">Task Progress Trend</h2>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--muted)]">
                    <Loader2 className="animate-spin w-6 h-6 text-[var(--primary)]" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-xl overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between border-[var(--border)] bg-gradient-to-r from-[var(--card)] to-[var(--hover)]">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-500" />
                    <h2 className="text-sm font-bold tracking-tight">Task Progress Trend</h2>
                </div>
            </div>

            {/* Stats Row - 4 columns */}
            {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border-b border-[var(--border)] bg-[var(--hover)]/30">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className={`p-3 rounded-lg border transition-colors ${stat.bgColor} ${stat.borderColor} hover:border-opacity-60`}
                    >
                        <p className="text-[8px] font-black uppercase tracking-wider text-[var(--muted)] mb-0.5">
                            {stat.label}
                        </p>
                        <p className={`text-lg font-black ${stat.textColor}`}>{stat.value}</p>
                    </div>
                ))}
            </div> */}

            {/* Chart Area */}
            <div className="p-3 pt-4 pb-2 overflow-x-auto w-full">
                {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12">
                        <div className="w-10 h-10 rounded-full bg-[var(--muted)]/10 flex items-center justify-center mb-3">
                            <TrendingUp size={20} className="text-[var(--muted)] opacity-40" />
                        </div>
                        <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest">
                            No data available
                        </p>
                    </div>
                ) : (
                    <div className="h-[280px] w-full min-w-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTodo" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--border)"
                                    opacity={0.3}
                                />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--muted)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={14}
                                    height={55}

                                    interval="preserveStartEnd"

                                    angle={-35}
                                    textAnchor="end"

                                    tick={{
                                        fill: "var(--muted)",
                                        fontWeight: 600,
                                        fontSize: 11,
                                    }}
                                />
                                <YAxis
                                    stroke="var(--muted)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    fontWeight={500}
                                    width={35}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{
                                        stroke: "var(--primary)",
                                        strokeWidth: 2,
                                        opacity: 0.3,
                                    }}
                                    contentStyle={{
                                        backgroundColor: "transparent",
                                        border: "none",
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        paddingTop: "13px",
                                        paddingBottom: "0",
                                        color: "var(--muted)"
                                    }}
                                    verticalAlign="top"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    name="Completed"
                                    stroke="#22C55E"
                                    strokeWidth={2.5}
                                    fill="url(#colorCompleted)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: "#22C55E", stroke: "#fff", strokeWidth: 2 }}
                                    isAnimationActive={true}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="inProgress"
                                    name="In Progress"
                                    stroke="#F59E0B"
                                    strokeWidth={2.5}
                                    fill="url(#colorInProgress)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: "#F59E0B", stroke: "#fff", strokeWidth: 2 }}
                                    isAnimationActive={true}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="todo"
                                    name="To Do"
                                    stroke="#3B82F6"
                                    strokeWidth={2.5}
                                    fill="url(#colorTodo)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                                    isAnimationActive={true}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}