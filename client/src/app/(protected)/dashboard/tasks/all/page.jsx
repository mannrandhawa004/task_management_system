"use client";

import React, { useEffect, useState, useMemo } from "react";
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
    FolderKanban,
    UserCheck,
    LayoutGrid,
    Table as TableIcon,
} from "lucide-react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import AppLoader from "@/components/common/AppLoader";
import AssignTaskDrawer from "@/components/tasks/AssignTaskDrawer";
import Pagination from "@/components/common/Pagination";
import TaskCard from "@/components/tasks/TaskCard";

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
    const isAdmin = systemRole === "admin" || systemRole === "super_admin";
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
    const [limit, setLimit] = useState(10);
    const [selectedProjectId, setSelectedProjectId] = useState("all");
    const [view, setView] = useState("card");
    const [selectedTaskId, setSelectedTaskId] = useState(null);

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

    // ─── Computed tasks list (handles unpaginated My Tasks array from backend) ───
    const displayedTasksList = useMemo(() => {
        if (viewMode !== VIEW_MODES.MY_TASKS) return tasks || [];
        let filtered = [...(tasks || [])];
        if (activeFilter !== "all") {
            filtered = filtered.filter((t) => t?.status === activeFilter);
        }
        if (selectedProjectId !== "all") {
            filtered = filtered.filter((t) => (t?.project?.id == selectedProjectId || t?.project_id == selectedProjectId));
        }
        return filtered;
    }, [tasks, viewMode, activeFilter, selectedProjectId]);

    const paginatedDisplayedTasks = useMemo(() => {
        if (viewMode !== VIEW_MODES.MY_TASKS) return displayedTasksList;
        const startIndex = (page - 1) * limit;
        return displayedTasksList.slice(startIndex, startIndex + limit);
    }, [displayedTasksList, viewMode, page, limit]);

    const activeTotal = viewMode === VIEW_MODES.MY_TASKS ? displayedTasksList.length : (pagination?.total || tasks.length);
    const activeTotalPages = viewMode === VIEW_MODES.MY_TASKS ? Math.max(1, Math.ceil(displayedTasksList.length / limit)) : (pagination?.totalPages || 1);
    const activeCurrentPage = viewMode === VIEW_MODES.MY_TASKS ? page : (pagination?.currentPage || page);

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
                        <label className="flex items-center gap-2 px-3 py-2 rounded-2xl border bg-[var(--card)] dark:bg-zinc-900 border-[var(--border)] text-xs font-bold text-[var(--muted)]">
                            <FolderKanban size={14} />
                            <select
                                value={selectedProjectId}
                                onChange={(e) => { setSelectedProjectId(e.target.value); setPage(1); }}
                                className="bg-[var(--card)] dark:bg-zinc-900 outline-none text-[var(--text)] font-bold cursor-pointer max-w-[220px]"
                            >
                                <option value="all" className="bg-[var(--card)] dark:bg-zinc-900 text-[var(--text)] py-1">All Projects</option>
                                {/* In My Tasks mode, only show projects the user is a member/manager of */}
                                {(viewMode === VIEW_MODES.MY_TASKS
                                    ? projects  // already scoped to user's projects from your API
                                    : projects
                                ).map((project) => (
                                    <option key={project.id} value={project.id} className="bg-[var(--card)] dark:bg-zinc-900 text-[var(--text)] py-1">{project.name}</option>
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
                <div className="flex flex-wrap items-center justify-between gap-4">
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

                    <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                        <button
                            type="button"
                            onClick={() => setView("card")}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                view === "card"
                                    ? "bg-[var(--primary)] text-white shadow-sm"
                                    : "text-[var(--muted)] hover:text-[var(--text)]"
                            }`}
                        >
                            <LayoutGrid size={14} />
                            <span>Cards</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setView("table")}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                view === "table"
                                    ? "bg-[var(--primary)] text-white shadow-sm"
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
                    <AppLoader message="Loading tasks..." className="min-h-[300px]" />
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed bg-[var(--card)] border-[var(--border)] min-h-[300px]">
                        <AlertCircle className="w-8 h-8 text-rose-500 mb-3" />
                        <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">No Tasks Found</h4>
                        <p className="text-xs font-medium text-[var(--muted)] mt-1.5 max-w-xs">
                            {viewMode === VIEW_MODES.MY_TASKS
                                ? "No tasks are currently assigned to you."
                                : "No tasks found matching this criteria."}
                        </p>
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
                                    {paginatedDisplayedTasks.map((task) => {
                                        if (!task) return null;
                                        const taskCanManage = canManageTask(task);
                                        return (
                                            <TaskCard
                                                key={`task-table-${task.id}`}
                                                task={task}
                                                view="table"
                                                isSelected={selectedTaskId === task.id}
                                                onSelect={() => setSelectedTaskId(prev => prev === task.id ? null : task.id)}
                                                canEdit={taskCanManage}
                                                canDelete={taskCanManage}
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
                                                onDelete={async (taskId) => {
                                                    try {
                                                        await dispatch(deleteTaskThunk(taskId)).unwrap();
                                                        showToast.success("Task deleted");
                                                        refreshTasks();
                                                    } catch (err) {
                                                        showToast.error(err?.message || "Failed to delete task");
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
                        {paginatedDisplayedTasks.map((task) => {
                            if (!task) return null;
                            const taskCanManage = canManageTask(task);
                            return (
                                <div key={`task-card-${task.id}`}>
                                    <TaskCard
                                        task={task}
                                        view="card"
                                        isSelected={selectedTaskId === task.id}
                                        onSelect={() => setSelectedTaskId(prev => prev === task.id ? null : task.id)}
                                        canEdit={taskCanManage}
                                        canDelete={taskCanManage}
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
                                        onDelete={async (taskId, updates) => {
                                            try {
                                                await dispatch(deleteTaskThunk(taskId)).unwrap();
                                                showToast.success("Task deleted");
                                                refreshTasks();
                                            } catch (err) {
                                                showToast.error(err?.message || "Failed to delete task");
                                            }
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* PAGINATION */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm mt-4">
                    <Pagination
                        page={activeCurrentPage}
                        limit={limit}
                        total={activeTotal}
                        totalPages={activeTotalPages}
                        onPageChange={({ page: newPage, limit: newLimit }) => {
                            setPage(newPage);
                            if (newLimit !== limit) {
                                setLimit(newLimit);
                                setPage(1);
                            }
                        }}
                    />
                </div>
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
                confirmLabel="Delete Task"
                variant="danger"
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