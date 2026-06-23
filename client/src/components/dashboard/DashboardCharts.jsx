"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";


export function ProjectDistributionChart({ data }) {
    if (!data || data.length === 0 || !data.some((d) => d.tasks > 0)) {
        return (
            <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-xs h-80 flex flex-col items-center justify-center text-xs text-[var(--muted)] border-dashed">
                <p className="font-bold uppercase tracking-wider">No distributions indexed</p>
                <p className="text-[11px] mt-1 text-[var(--muted)]/80">No active tasks are distributed across running systems.</p>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md">
            {/* Header */}
            <div className="pb-2 border-b border-[var(--border)] mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-0.5">
                    Task Aggregations
                </h3>
                <p className="text-sm font-bold tracking-tight text-[var(--text)]">
                    Volume per Project
                </p>
            </div>

            {/* Chart Area */}
            <div className="h-56 w-full min-w-0 min-h-0 -ml-2">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                        barCategoryGap="25%"
                    >
                        {/* Define SVG Linear Gradients for Premium Visual Glow */}
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.95} />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.25} />
                            </linearGradient>
                        </defs>

                        {/* 🌐 ADDED: Full structural background grid with cross-hatching lines */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={true}       // Enabled vertical project division columns
                            horizontal={true}     // Enabled horizontal metric track lines
                            stroke="var(--border)"
                            opacity={0.45}         // Subtle, clean cross-grid lines
                        />

                        {/* 🛠️ ADDED: Re-enabled axisLine to draw the sharp baseline frame boundary */}
                        <XAxis
                            dataKey="name"
                            stroke="var(--border)" // Set to border color for sleek integration
                            tick={{ fontSize: 10, fontWeight: 600, fill: "var(--muted)" }}
                            interval={0}
                            tickLine={true}        // Added subtle anchor tick-lines pointing to titles
                            axisLine={true}        // Draws the bottom solid baseline
                            dy={10}
                        />

                        <YAxis
                            stroke="var(--border)"
                            tick={{ fontSize: 10, fontWeight: 600, fill: "var(--muted)" }}
                            tickLine={true}        // Added small baseline tick guides
                            axisLine={true}        // Draws the left solid vertical bounding wall
                            allowDecimals={false}
                            dx={-5}
                        />

                        <Tooltip
                            cursor={{ fill: "var(--primary)", opacity: 0.04, radius: 8 }}
                            contentStyle={{
                                background: "var(--card)",
                                borderColor: "var(--border)",
                                color: "var(--text)",
                                borderRadius: "14px",
                                fontSize: "11px",
                                fontWeight: "600",
                                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
                            }}
                            wrapperStyle={{ outline: 'none' }}
                        />

                        <Bar
                            dataKey="tasks"
                            fill="url(#barGradient)"
                            radius={[6, 6, 0, 0]}
                            barSize={24}
                            maxBarSize={32}
                            className="transition-all duration-300 hover:opacity-85 cursor-pointer outline-none"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function ProjectStatusChart({ projectData, totalProjects }) {
    if (!projectData || projectData.length === 0) return null;
    return (
        <div className="p-4 rounded-xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col justify-between">
            <div className="pb-2 border-b border-[var(--border)] mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-0.5">Project Infrastructure</h3>
                <p className="text-sm font-bold">Lifecycle Share</p>
            </div>
            <div className="h-48 w-full min-w-0 min-h-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                        <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)", borderRadius: "12px" }} />
                        <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                        <Pie
                            data={projectData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={48}
                            outerRadius={72}
                            paddingAngle={6}
                            labelLine={false}
                        >
                            {projectData.map((entry, index) => (
                                <Cell key={`project-cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-bold">{totalProjects}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Total</span>
                </div>
            </div>
            <div className="flex justify-around text-center text-xs pt-2 mt-2 border-t border-[var(--border)]/40">
                {projectData.map((data, idx) => (
                    <div key={idx}>
                        <div className="w-2 h-2 rounded-full mx-auto mb-0.5" style={{ backgroundColor: data.color }} />
                        <div className="text-[var(--muted)] text-[9px] uppercase font-semibold">{data.name}</div>
                        <div className="font-bold text-sm mt-0.5">{data.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TaskBreakdownChart({ chartData, totalTasks, todoCount, inProgressCount, completedCount, fullSpan }) {
    return (
        <div className={`p-4 rounded-xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col justify-between ${fullSpan ? "" : ""}`}>
            <div className="pb-2 border-b border-[var(--border)] mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-0.5">Task Breakdown</h3>
                <p className="text-sm font-bold">Status Allocation</p>
            </div>
            <div className="h-48 w-full min-w-0 min-h-0 relative flex items-center justify-center">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                            <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)", borderRadius: "12px" }} />
                            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={48}
                                outerRadius={72}
                                paddingAngle={6}
                                labelLine={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-xs text-[var(--muted)]">No active tasks registered.</div>
                )}
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-bold">{totalTasks}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Total</span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 mt-2 border-t border-[var(--border)]/40">
                <div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto mb-0.5" />
                    <div className="text-[var(--muted)] text-[9px] font-semibold uppercase">Upcoming</div>
                    <div className="font-bold text-sm mt-0.5">{todoCount}</div>
                </div>
                <div>
                    <div className="w-2 h-2 rounded-full bg-amber-500 mx-auto mb-0.5" />
                    <div className="text-[var(--muted)] text-[9px] font-semibold uppercase">In Progress</div>
                    <div className="font-bold text-sm mt-0.5">{inProgressCount}</div>
                </div>
                <div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto mb-0.5" />
                    <div className="text-[var(--muted)] text-[9px] font-semibold uppercase">Completed</div>
                    <div className="font-bold text-sm mt-0.5">{completedCount}</div>
                </div>
            </div>
        </div>
    );
}
