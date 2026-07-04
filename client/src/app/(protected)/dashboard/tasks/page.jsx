"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
    myTaskThunk,
    deleteTaskThunk,
    updateTaskStatusThunk,
    updateTaskThunk
} from "@/features/tasks/thunks/taskThunk";
import { getProjectsThunk } from "@/features/projects/thunks/projectThunk";
import { showToast } from "@/lib/toast";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    ListTodo,
    Layers,
    FolderKanban,
    LayoutGrid,
    Table as TableIcon,
} from "lucide-react";

import AppLoader from "@/components/common/AppLoader";
import Pagination from "@/components/common/Pagination";
import TaskCard from "@/components/tasks/TaskCard";

const STATUS_FILTERS = [
    { key: "all", label: "All Tasks", icon: Layers },
    { key: "todo", label: "To Do", icon: ListTodo },
    { key: "in_progress", label: "In Progress", icon: Clock },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
];

export default function MyTasksPage() {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const urlTaskId = searchParams?.get("taskId");

    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedProjectId, setSelectedProjectId] = useState("all");
    const [view, setView] = useState("card");
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(9);

    useEffect(() => {
        if (urlTaskId) {
            const numId = Number(urlTaskId);
            setSelectedTaskId(numId || urlTaskId);
        }
    }, [urlTaskId]);

    const { tasks, taskLoading } = useSelector((state) => state.task);
    const { projects } = useSelector((state) => state.project);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        dispatch(getProjectsThunk({ page: 1, limit: 100 }));
        refreshTasks();
    }, [dispatch]);

    const refreshTasks = () => {
        dispatch(myTaskThunk());
    };

    // Filter loaded tasks locally
    const filteredTasks = useMemo(() => {
        return (tasks || []).filter((task) => {
            if (!task) return false;

            // Ensure we only see tasks assigned to the current user (My Tasks)
            const targetCrew = task.assigned_users || task.assignedUsers || task.assigned_members || [];
            const isAssignedToMe = targetCrew.some((u) => Number(u?.id) === Number(user?.id));
            if (!isAssignedToMe) return false;

            // Filter by active status
            if (activeFilter !== "all") {
                const matchesStatus = activeFilter === "todo" ? (task.status === "todo" || !task.status) : task.status === activeFilter;
                if (!matchesStatus) return false;
            }

            // Filter by selected project dropdown
            if (selectedProjectId !== "all") {
                const projId = task.project?.id || task.project_id;
                if (String(projId) !== String(selectedProjectId)) return false;
            }

            return true;
        });
    }, [tasks, user, activeFilter, selectedProjectId]);

    // Client-side pagination over filtered tasks
    const paginatedTasks = useMemo(() => {
        const startIndex = (page - 1) * limit;
        return filteredTasks.slice(startIndex, startIndex + limit);
    }, [filteredTasks, page, limit]);

    const totalPages = Math.ceil(filteredTasks.length / limit) || 1;

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [activeFilter, selectedProjectId]);

    return (
        <main className="min-h-screen w-full p-4 md:p-8 space-y-6 bg-[var(--bg)] text-[var(--text)]">

            {/* HEADER COMPONENT */}
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between border-b pb-6 border-[var(--border)]">
                <div>
                    <h2 className="text-2xl font-black tracking-tight md:text-3xl">My Work Assignments</h2>
                    <p className="mt-1.5 text-xs md:text-sm text-[var(--muted)] font-medium">
                        Monitor execution phases and update your assigned tasks parameters inline.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {projects && projects.length > 0 && (
                        <label className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border bg-[var(--card)] border-[var(--border)] text-xs font-bold text-[var(--muted)] shadow-2xs">
                            <FolderKanban size={14} className="text-[var(--primary)]" />
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="bg-transparent outline-none text-[var(--text)] font-bold cursor-pointer max-w-[220px]"
                            >
                                <option value="all">All Projects</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                </div>
            </div>

            {/* STATUS TABS & VIEW SWITCHER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex overflow-x-auto gap-1.5 p-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] max-w-full custom-scrollbar">
                    {STATUS_FILTERS.map((filter) => {
                        const Icon = filter.icon;
                        const isSelected = activeFilter === filter.key;
                        return (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    isSelected
                                        ? "bg-[var(--primary)] text-white shadow-xs"
                                        : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
                                }`}
                            >
                                <Icon size={14} />
                                <span>{filter.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* View Mode Toggle (Cards vs Table) */}
                <div className="flex items-center gap-1 bg-[var(--card)] p-1 rounded-2xl border border-[var(--border)] self-end sm:self-auto shrink-0">
                    <button
                        type="button"
                        onClick={() => setView("card")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            view === "card"
                                ? "bg-[var(--primary)] text-white shadow-2xs"
                                : "text-[var(--muted)] hover:text-[var(--text)]"
                        }`}
                    >
                        <LayoutGrid size={14} />
                        <span>Cards</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setView("table")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            view === "table"
                                ? "bg-[var(--primary)] text-white shadow-2xs"
                                : "text-[var(--muted)] hover:text-[var(--text)]"
                        }`}
                    >
                        <TableIcon size={14} />
                        <span>Table</span>
                    </button>
                </div>
            </div>

            {/* TASK GRID / TABLE */}
            {taskLoading && tasks.length === 0 ? (
                <AppLoader message="Retrieving assignments..." className="min-h-[300px]" />
            ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed bg-[var(--card)] border-[var(--border)] min-h-[300px]">
                    <AlertCircle className="w-8 h-8 text-rose-500 mb-3" />
                    <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">No Assignments Found</h4>
                    <p className="text-xs font-medium text-[var(--muted)] mt-1.5 max-w-xs">No active assignments match your current filter criteria.</p>
                </div>
            ) : view === "table" ? (
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm bg-[var(--card)]">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.03]">
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Task</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Status</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Priority</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Due Date</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Assigned Crew</th>
                                    <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTasks.map((task) => {
                                    if (!task) return null;
                                    return (
                                        <TaskCard
                                            key={`task-table-${task.id}`}
                                            task={task}
                                            view="table"
                                            isSelected={selectedTaskId === task.id}
                                            onSelect={() => setSelectedTaskId(prev => prev === task.id ? null : task.id)}
                                            canEdit={true}
                                            canDelete={false}
                                            onUpdate={async (taskId, updates) => {
                                                try {
                                                    await dispatch(updateTaskStatusThunk({ taskId, ...updates })).unwrap();
                                                    showToast.success("Status updated");
                                                    refreshTasks();
                                                } catch (err) {
                                                    showToast.error(err?.message || "Failed to update status");
                                                }
                                            }}
                                            onUpdateDetails={async (taskId, updates) => {
                                                try {
                                                    await dispatch(updateTaskThunk({ taskId, payload: updates })).unwrap();
                                                    showToast.success("Task updated");
                                                    refreshTasks();
                                                } catch (err) {
                                                    showToast.error(err?.message || "Failed to update task");
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {paginatedTasks.map((task) => {
                        if (!task) return null;
                        return (
                            <div key={`task-card-${task.id}`}>
                                <TaskCard
                                    task={task}
                                    view="card"
                                    isSelected={selectedTaskId === task.id}
                                    onSelect={() => setSelectedTaskId(prev => prev === task.id ? null : task.id)}
                                    canEdit={true}
                                    canDelete={false}
                                    onUpdate={async (taskId, updates) => {
                                        try {
                                            await dispatch(updateTaskStatusThunk({ taskId, ...updates })).unwrap();
                                            showToast.success("Status updated");
                                            refreshTasks();
                                        } catch (err) {
                                            showToast.error(err?.message || "Failed to update status");
                                        }
                                    }}
                                    onUpdateDetails={async (taskId, updates) => {
                                        try {
                                            await dispatch(updateTaskThunk({ taskId, payload: updates })).unwrap();
                                            showToast.success("Task updated");
                                            refreshTasks();
                                        } catch (err) {
                                            showToast.error(err?.message || "Failed to update task");
                                        }
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* PAGINATION */}
            {filteredTasks.length > limit && (
                <div className="pt-2">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            )}
        </main>
    );
}

