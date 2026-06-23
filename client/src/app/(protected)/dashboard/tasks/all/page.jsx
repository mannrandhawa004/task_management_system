"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getAllTasksThunk,
    myTaskThunk,
    deleteTaskThunk,
    updateTaskStatusThunk,
    updateTaskThunk
} from "@/features/tasks/thunks/taskThunk";
import { getProjectMembersThunk, getProjectsThunk } from "@/features/projects/thunks/projectThunk";
import { showToast } from "@/lib/toast";
import {
    X,
    Calendar,
    AlertCircle,
    Users,
    Trash2,
    CheckCircle2,
    Clock,
    ListTodo,
    Layers,
    Edit3,
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    UserCheck,
} from "lucide-react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import AppLoader from "@/components/common/AppLoader";
import AssignTaskDrawer from "@/components/tasks/AssignTaskDrawer";

const STATUS_FILTERS = [
    { key: "all", label: "All Tasks", icon: Layers },
    { key: "todo", label: "To Do", icon: ListTodo },
    { key: "in_progress", label: "In Progress", icon: Clock },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
];

// Which thunk to fire depends on the view mode
// "my_tasks"  → tasks assigned TO the current user
// "all_tasks" → all tasks in projects where user is manager (or everything for admin)
const VIEW_MODES = {
    MY_TASKS: "my_tasks",
    ALL_TASKS: "all_tasks",
};

export default function AllTasksPage() {
    const dispatch = useDispatch();

    // ─── Auth ────────────────────────────────────────────────────────────────
    const { user } = useSelector((state) => state.auth);
    const systemRole = user?.role?.toLowerCase() || "member";
    const isAdmin = systemRole === "admin";
    const isSystemManager = systemRole === "manager";

    // ─── Projects (contains per-project role) ────────────────────────────────
    const { projects } = useSelector((state) => state.project);

    // Is the user a manager in at least one project?
    const isProjectManager = projects?.some(
        (p) => p.role?.toLowerCase() === "manager"
    );

    // Resolved: should this user see the view-mode toggle at all?
    const showViewToggle = !isAdmin && (isSystemManager || isProjectManager);

    // ─── View mode (only relevant for managers) ───────────────────────────────
    // Admin always sees all tasks; everyone else defaults to their own tasks
    const [viewMode, setViewMode] = useState(
        isAdmin ? VIEW_MODES.ALL_TASKS : VIEW_MODES.MY_TASKS
    );

    // ─── Filters / pagination ────────────────────────────────────────────────
    const [activeFilter, setActiveFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [selectedProjectId, setSelectedProjectId] = useState("all");

    // ─── UI state ────────────────────────────────────────────────────────────
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, taskId: null });
    const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [editForm, setEditForm] = useState({
        title: "", description: "", priority: "medium", status: "todo",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { tasks, taskLoading, pagination } = useSelector((state) => state.task);

    // ─── Fetch projects once ─────────────────────────────────────────────────
    useEffect(() => {
        dispatch(getProjectsThunk({ page: 1, limit: 100 }));
    }, [dispatch]);

    // ─── Fetch tasks whenever filters / viewMode change ───────────────────────
    useEffect(() => {
        const params = {
            page,
            limit,
            status: activeFilter === "all" ? undefined : activeFilter,
            projectId: selectedProjectId === "all" ? undefined : selectedProjectId,
        };

        if (viewMode === VIEW_MODES.MY_TASKS) {
            // Use a "my tasks" thunk — scoped to the logged-in user
            dispatch(myTaskThunk(params));
        } else {
            dispatch(getAllTasksThunk(params));
        }
    }, [dispatch, page, limit, activeFilter, selectedProjectId, viewMode]);

    // ─── Per-task permission helper ───────────────────────────────────────────
    // Moved INSIDE the component but called per-task inside .map()
    const canManageTask = (task) => {
        if (isAdmin || isSystemManager) return true;
        const taskProject = projects?.find((p) => p.id === task.project?.id);
        return taskProject?.role?.toLowerCase() === "manager";
    };

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const buildRefreshParams = () => ({
        page,
        limit,
        status: activeFilter === "all" ? undefined : activeFilter,
        projectId: selectedProjectId === "all" ? undefined : selectedProjectId,
    });

    const refreshTasks = () => {
        const params = buildRefreshParams();
        viewMode === VIEW_MODES.MY_TASKS
            ? dispatch(myTaskThunk(params))
            : dispatch(getAllTasksThunk(params));
    };

    const handleAdminSaveTask = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await dispatch(updateTaskThunk({
                taskId: editingTask.id,
                payload: {
                    title: editForm.title,
                    description: editForm.description,
                    priority: editForm.priority,
                },
            })).unwrap();

            if (editForm.status !== editingTask.status) {
                await dispatch(updateTaskStatusThunk({
                    taskId: editingTask.id,
                    status: editForm.status,
                })).unwrap();
            }

            showToast.success("Task updated successfully.");
            setEditingTask(null);
            refreshTasks();
        } catch (err) {
            showToast.error(err?.message || "Failed to update task.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExecuteDelete = async () => {
        if (!confirmDelete.taskId) return;
        try {
            await dispatch(deleteTaskThunk(confirmDelete.taskId)).unwrap();
            showToast.success("Task deleted successfully");
            setConfirmDelete({ isOpen: false, taskId: null });
            refreshTasks();
        } catch (err) {
            showToast.error(err?.message || "Failed to delete task");
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setEditForm({
            title: task.title || "",
            description: task.description || "",
            priority: task.priority || "medium",
            status: task.status || "todo",
        });
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setPage(1);
        setActiveFilter("all");
        setEditingTask(null);
    };

    // ─── Config maps ──────────────────────────────────────────────────────────
    const statusConfig = {
        todo: { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "To Do" },
        in_progress: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "In Progress" },
        completed: { bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Completed" },
    };

    const priorityConfig = {
        low: { bg: "bg-emerald-500/10 text-emerald-500", label: "Low" },
        medium: { bg: "bg-amber-500/10 text-amber-500", label: "Medium" },
        high: { bg: "bg-rose-500/10 text-rose-500", label: "High" },
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen w-full p-4 md:p-8 space-y-6 bg-[var(--bg)] text-[var(--text)]">

            {/* HEADER */}
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between border-b pb-6 border-[var(--border)]">
                <div>
                    <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                        {isAdmin ? "Global Task Directory" : viewMode === VIEW_MODES.MY_TASKS ? "My Tasks" : "Assignable Tasks"}
                    </h2>
                    <p className="mt-1.5 text-xs md:text-sm text-[var(--muted)] font-medium">
                        {isAdmin
                            ? "Monitor and manage all tasks across every project."
                            : viewMode === VIEW_MODES.MY_TASKS
                                ? "Tasks assigned to you across all projects."
                                : "Tasks in projects where you have manager access."}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">
                    {/* Project filter dropdown — shown in ALL modes including My Tasks */}
                    {projects && projects.length > 0 && (
                        <label className="flex items-center gap-2 px-3 py-2 rounded-2xl border bg-[var(--card)] border-[var(--border)] text-xs font-bold text-[var(--muted)]">
                            <FolderKanban size={14} />
                            <select
                                value={selectedProjectId}
                                onChange={(e) => { setSelectedProjectId(e.target.value); setPage(1); }}
                                className="bg-transparent outline-none text-[var(--text)] font-bold cursor-pointer max-w-[220px]"
                            >
                                <option value="all">All Projects</option>
                                {/* In My Tasks mode, only show projects the user is a member/manager of */}
                                {(viewMode === VIEW_MODES.MY_TASKS
                                    ? projects  // already scoped to user's projects from your API
                                    : projects
                                ).map((project) => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                        </label>
                    )}
                </div>
            </div>

            {/* MANAGER VIEW TOGGLE — shown only to project/system managers, not admin */}
            {showViewToggle && (
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] self-start w-fit">
                    <button
                        type="button"
                        onClick={() => handleViewModeChange(VIEW_MODES.MY_TASKS)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === VIEW_MODES.MY_TASKS
                            ? "bg-[var(--primary)] text-white shadow-sm"
                            : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
                            }`}
                    >
                        <UserCheck size={14} />
                        My Tasks
                    </button>
                    <button
                        type="button"
                        onClick={() => handleViewModeChange(VIEW_MODES.ALL_TASKS)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === VIEW_MODES.ALL_TASKS
                            ? "bg-[var(--primary)] text-white shadow-sm"
                            : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
                            }`}
                    >
                        <Layers size={14} />
                        Assignable Tasks
                    </button>
                </div>
            )}

            {/* STATUS FILTER TABS */}
            <div className="flex flex-col gap-4">
                <div className="flex overflow-x-auto gap-1.5 p-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] self-start max-w-full custom-scrollbar">
                    {STATUS_FILTERS.map((filter) => {
                        const Icon = filter.icon;
                        const isSelected = activeFilter === filter.key;
                        return (
                            <button
                                key={filter.key}
                                onClick={() => { setActiveFilter(filter.key); setPage(1); setEditingTask(null); }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isSelected
                                    ? "bg-[var(--primary)] text-white shadow-sm"
                                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
                                    }`}
                            >
                                <Icon size={14} />
                                <span>{filter.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TASK GRID */}
                {taskLoading && tasks.length === 0 ? (
                    <AppLoader message="Loading tasks..." className="min-h-[300px]" />
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed bg-[var(--card)] border-[var(--border)] min-h-[300px]">
                        <AlertCircle className="w-8 h-8 text-rose-500 mb-3" />
                        <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">No Tasks Found</h4>
                        <p className="text-xs font-medium text-[var(--muted)] mt-1.5 max-w-xs">
                            {viewMode === VIEW_MODES.MY_TASKS
                                ? "No tasks are currently assigned to you."
                                : "No tasks found matching this criteria."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tasks.map((task) => {
                                if (!task) return null;

                                const currentStatus = statusConfig[task.status] || { bg: "bg-gray-500/10 text-gray-500 border-gray-500/20", label: "Task" };
                                const currentPriority = priorityConfig[task.priority] || { bg: "bg-gray-500/10 text-gray-500", label: "Medium" };
                                const targetCrew = (task.assigned_users || task.assignedUsers || task.assigned_members || []).filter(Boolean);

                                // Computed per-task — safe here inside .map()
                                const taskCanManage = canManageTask(task);

                                return (
                                    <article
                                        key={task.id}
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

                                            {/* ASSIGNED CREW */}
                                            <div className="pt-3 border-t border-[var(--border)]/60">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users size={12} className="text-[var(--muted)]" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Assigned Crew</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {targetCrew.length > 0 ? (
                                                        targetCrew.map((assignedUser, idx) => {
                                                            const initials = assignedUser.name
                                                                ? assignedUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                                                                : "??";
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

                                        {/* FOOTER ACTIONS */}
                                        <div className="mt-5 pt-3 border-t flex items-center justify-between border-[var(--border)]/60">
                                            <div className="flex items-center gap-2">
                                                {/* Edit — only for managers/admin */}
                                                {taskCanManage && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditTask(task)}
                                                        className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                )}

                                                {/* Assign — only for managers/admin */}
                                                {taskCanManage && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            if (task.project?.id) {
                                                                dispatch(getProjectMembersThunk(task.project.id));
                                                            }
                                                            setAssignDrawerOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white transition-all text-xs font-bold cursor-pointer"
                                                    >
                                                        <Users size={14} />
                                                        Assign
                                                    </button>
                                                )}
                                            </div>

                                            {/* Delete — only for managers/admin */}
                                            {taskCanManage && (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmDelete({ isOpen: true, taskId: task.id })}
                                                    className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PAGINATION */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 text-xs font-bold pt-2">
                        <button
                            type="button"
                            disabled={!pagination.hasPrevPage || taskLoading}
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            className="p-2 rounded-xl border transition bg-[var(--card)] border-[var(--border)] disabled:opacity-40 hover:bg-[var(--hover)] cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-[var(--muted)] px-3">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={!pagination.hasNextPage || taskLoading}
                            onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                            className="p-2 rounded-xl border transition bg-[var(--card)] border-[var(--border)] disabled:opacity-40 hover:bg-[var(--hover)] cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* EDIT MODAL */}
            {editingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight">Edit Task Details</h3>
                            <button onClick={() => setEditingTask(null)} className="p-1 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)]">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAdminSaveTask} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-[var(--muted)]">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-xl border bg-[var(--input)] border-[var(--border)] text-[var(--text)] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-[var(--muted)]">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-xl border bg-[var(--input)] border-[var(--border)] text-[var(--text)] focus:outline-none min-h-[80px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-[var(--muted)]">Priority</label>
                                    <select
                                        value={editForm.priority}
                                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                        className="w-full px-3 py-2 text-sm rounded-xl border bg-[var(--input)] border-[var(--border)] text-[var(--text)] focus:outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-[var(--muted)]">Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full px-3 py-2 text-sm rounded-xl border bg-[var(--input)] border-[var(--border)] text-[var(--text)] focus:outline-none"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingTask(null)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--border)] hover:bg-[var(--hover)] text-[var(--text)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-[var(--primary)] shadow-xs disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={confirmDelete.isOpen}
                title="Delete Task"
                message="Are you sure you want to permanently delete this task? This action cannot be undone."
                loading={taskLoading}
                onClose={() => setConfirmDelete({ isOpen: false, taskId: null })}
                onConfirm={handleExecuteDelete}
            />

            <AssignTaskDrawer
                open={assignDrawerOpen}
                task={selectedTask}
                onClose={() => {
                    setAssignDrawerOpen(false);
                    setSelectedTask(null);
                }}
            />
        </main>
    );
}