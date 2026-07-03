"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getTaskByIdThunk,
    myTaskThunk,
    updateTaskStatusThunk
} from "@/features/tasks/thunks/taskThunk";
import { clearCurrentTask } from "@/features/tasks/slice/taskSlice";
import { getProjectsThunk } from "@/features/projects/thunks/projectThunk";
import { showToast } from "@/lib/toast";
import {
    X,
    Calendar,
    AlertCircle,
    Users,
    CheckCircle2,
    Clock,
    ListTodo,
    Layers,
    FolderKanban
} from "lucide-react";

import AppLoader from "@/components/common/AppLoader";

const STATUS_FILTERS = [
    { key: "all", label: "All Tasks", icon: Layers },
    { key: "todo", label: "To Do", icon: ListTodo },
    { key: "in_progress", label: "In Progress", icon: Clock },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
];

export default function MyTasksPage() {
    const dispatch = useDispatch();

    const [activeFilter, setActiveFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState("all");

    const { tasks, taskLoading, currentTask } = useSelector((state) => state.task);
    const { projects } = useSelector((state) => state.project);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        dispatch(getProjectsThunk({ page: 1, limit: 10 }));
        dispatch(myTaskThunk());
    }, [dispatch]);

    const handleAdvanceStatus = async (e, taskId, nextStatus) => {
        e.stopPropagation();
        try {
            await dispatch(updateTaskStatusThunk({ taskId, status: nextStatus })).unwrap();
            showToast.success(`Workflow transitioned to ${nextStatus.replace("_", " ")}`);
            // Refresh local tasks
            dispatch(myTaskThunk());
        } catch (err) {
            showToast.error(err?.message || "Failed to transition task status.");
        }
    };

    const handleViewTaskDetails = (taskId) => {
        dispatch(getTaskByIdThunk(taskId));
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        dispatch(clearCurrentTask());
    };

    // Filter loaded tasks locally
    const filteredTasks = tasks.filter((task) => {
        if (!task) return false;

        // Ensure we only see tasks assigned to the current user (My Tasks)
        const targetCrew = task.assigned_users || task.assignedUsers || task.assigned_members || [];
        const isAssignedToMe = targetCrew.some((u) => Number(u.id) === Number(user?.id));
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

    const statusConfig = {
        todo: { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "To Do" },
        in_progress: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "In Progress" },
        completed: { bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Completed" },
    };

    const priorityConfig = {
        low: { bg: "bg-emerald-500/10 text-emerald-500", label: "Low" },
        medium: { bg: "bg-amber-500/10 text-amber-500", label: "Medium" },
        high: { bg: "bg-rose-500/10 text-rose-500", label: "High" },
        urgent: { bg: "bg-purple-500/15 text-purple-500 font-extrabold", label: "Urgent" }
    };

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

                <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">
                    {projects && projects.length > 0 && (
                        <label className="flex items-center gap-2 px-3 py-2 rounded-2xl border bg-[var(--card)] border-[var(--border)] text-xs font-bold text-[var(--muted)]">
                            <FolderKanban size={14} />
                            <select
                                value={selectedProjectId}
                                onChange={(e) => {
                                    setSelectedProjectId(e.target.value);
                                }}
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

            {/* TASK FILTER STATUS TABS */}
            <div className="flex flex-col gap-4">
                <div className="flex overflow-x-auto gap-1.5 p-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] self-start max-w-full custom-scrollbar">
                    {STATUS_FILTERS.map((filter) => {
                        const Icon = filter.icon;
                        const isSelected = activeFilter === filter.key;
                        return (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isSelected ? "bg-[var(--primary)] text-white shadow-xs" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"}`}
                            >
                                <Icon size={14} />
                                <span>{filter.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TASKS DISPLAY GRID */}
                {taskLoading && tasks.length === 0 ? (
                    <AppLoader message="Retrieving active tracking logs..." className="min-h-[300px]" />
                ) : filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed bg-[var(--card)] border-[var(--border)] min-h-[300px]">
                        <AlertCircle className="w-8 h-8 text-rose-500 mb-3" />
                        <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">No Records Uncovered</h4>
                        <p className="text-xs font-medium text-[var(--muted)] mt-1.5 max-w-xs">No tasks found matching this criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTasks.map((task) => {
                                if (!task) return null;
                                const currentStatus = statusConfig[task.status] || { bg: "bg-gray-500/10 text-gray-500 border-gray-500/20", label: "Task" };
                                const currentPriority = priorityConfig[task.priority] || { bg: "bg-gray-500/10 text-gray-500", label: "Medium" };
                                const targetCrew = task.assigned_users || task.assignedUsers || task.assigned_members || [];

                                return (
                                    <article
                                        key={task.id}
                                        onClick={() => handleViewTaskDetails(task.id)}
                                        className="group p-5 rounded-3xl border transition-all duration-300 hover:translate-y-[-2px] bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/30 hover:shadow-lg cursor-pointer flex flex-col justify-between h-full min-h-[220px]"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-black leading-snug tracking-tight text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                                                        {task.title}
                                                    </h3>
                                                    <p className="text-[11px] font-medium text-[var(--muted)] line-clamp-2 leading-relaxed">
                                                        {task.description || "No description provided."}
                                                    </p>
                                                </div>

                                                <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-wider ${currentStatus.bg}`}>
                                                    {currentStatus.label}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                                                {task.project?.name && (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--input)] text-[var(--muted)]">
                                                        <FolderKanban size={13} />
                                                        <span className="max-w-[220px] truncate">{task.project.name}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--input)] text-[var(--muted)]">
                                                    <Calendar size={13} />
                                                    <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Deadline"}</span>
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border)] ${currentPriority.bg}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    <span>{currentPriority.label} Priority</span>
                                                </div>
                                            </div>

                                            {/* CREW BOUNDARIES AVATARS */}
                                            <div className="pt-3 border-t border-[var(--border)]/60">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users size={12} className="text-[var(--muted)]" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Assigned Crew</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {targetCrew.length > 0 ? (
                                                        targetCrew.filter(Boolean).map((assignedUser, idx) => {
                                                            const initials = assignedUser.name ? assignedUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??";
                                                            return (
                                                                <div key={assignedUser.id || idx} className="flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--hover)] max-w-[160px]">
                                                                    <div className="w-4 h-4 rounded-md bg-[var(--primary)] text-white text-[9px] font-black flex items-center justify-center shrink-0">{initials}</div>
                                                                    <span className="truncate text-[var(--text)] text-[11px] font-medium">{assignedUser.name || "Unknown"}</span>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-xs font-medium italic text-[var(--muted)] pl-0.5">No crew members assigned.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* FOOTER ACTION DRIVEN BUTTON LAYOUT */}
                                        <div className="mt-5 pt-3 border-t flex items-center justify-between text-[11px] border-[var(--border)]/60">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                {task.status === "in_progress" && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleAdvanceStatus(e, task.id, "completed")}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                                    >
                                                        <CheckCircle2 size={12} />
                                                        <span>Mark Completed</span>
                                                    </button>
                                                )}
                                                {task.status === "todo" && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleAdvanceStatus(e, task.id, "in_progress")}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                                                    >
                                                        <Clock size={12} />
                                                        <span>Start Task</span>
                                                    </button>
                                                )}
                                                {task.status === "completed" && (
                                                    <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                                                        Task Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* EXTENDED POP-UP INSPECTOR DRAWER PANEL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-lg overflow-hidden border shadow-2xl rounded-3xl bg-[var(--card)] border-[var(--border)]">
                        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                            <span className="text-[10px] font-black tracking-widest uppercase text-[var(--muted)]">Core Workspace Parameters</span>
                            <button onClick={handleCloseModal} className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {taskLoading && !currentTask ? (
                                <AppLoader message="Loading task details..." className="min-h-[180px]" />
                            ) : currentTask ? (
                                <>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black tracking-tight">{currentTask.title}</h3>
                                        <p className="text-xs md:text-sm leading-relaxed text-[var(--muted)] font-medium bg-[var(--input)] p-4 rounded-2xl border border-[var(--border)]">
                                            {currentTask.description || "No description logs found for this assignment."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        {currentTask.project?.name && (
                                            <div className="col-span-2 p-3.5 rounded-2xl border bg-[var(--hover)] border-[var(--border)]">
                                                <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">Project</span>
                                                <span className="font-extrabold text-sm">{currentTask.project.name}</span>
                                            </div>
                                        )}
                                        <div className="p-3.5 rounded-2xl border bg-[var(--hover)] border-[var(--border)]">
                                            <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">State Target</span>
                                            <span className="font-extrabold capitalize text-sm">
                                                {(currentTask.status || "todo").replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="p-3.5 rounded-2xl border bg-[var(--hover)] border-[var(--border)]">
                                            <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">Priority Rank</span>
                                            <span className="font-extrabold capitalize text-sm">{currentTask.priority || "Medium"}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                                        <div className="flex justify-between items-center text-xs md:text-sm">
                                            <span className="font-bold text-[var(--muted)]">Target Timeline Deadline</span>
                                            <span className="font-extrabold">{currentTask.due_date ? new Date(currentTask.due_date).toLocaleDateString() : "No Bound Target"}</span>
                                        </div>

                                        {/* CONDITIONAL ADVANCEMENT GATES */}
                                        {currentTask.status === "todo" && (
                                            <button
                                                type="button"
                                                onClick={(e) => { handleAdvanceStatus(e, currentTask.id, "in_progress"); handleCloseModal(); }}
                                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                                            >
                                                <Clock size={14} />
                                                <span>Start Task</span>
                                            </button>
                                        )}
                                        {currentTask.status === "in_progress" && (
                                            <button
                                                type="button"
                                                onClick={(e) => { handleAdvanceStatus(e, currentTask.id, "completed"); handleCloseModal(); }}
                                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                            >
                                                <CheckCircle2 size={14} />
                                                <span>Advance Pipeline Phase to Completed</span>
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-xs font-bold text-rose-500 py-4">Failed to assemble network records.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
