"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, Calendar, CheckCircle2, Clock, FolderKanban, ListTodo, UserRound } from "lucide-react";

import AppLoader from "@/components/common/AppLoader";
import { getAllTasksThunk, myTaskThunk, updateTaskStatusThunk } from "@/features/tasks/thunks/taskThunk";
import { showToast } from "@/lib/toast";

const COLUMNS = [
  { key: "todo", title: "To Do", icon: ListTodo, tone: "text-blue-500", border: "border-blue-500/20" },
  { key: "in_progress", title: "In Progress", icon: Clock, tone: "text-amber-500", border: "border-amber-500/20" },
  { key: "completed", title: "Completed", icon: CheckCircle2, tone: "text-emerald-500", border: "border-emerald-500/20" },
];

const priorityClass = {
  urgent: "text-purple-500 bg-purple-500/15 font-extrabold",
  high: "text-rose-500 bg-rose-500/10",
  medium: "text-amber-500 bg-amber-500/10",
  low: "text-emerald-500 bg-emerald-500/10",
};

export default function TaskBoardPage() {
  const dispatch = useDispatch();
  const { tasks, taskLoading } = useSelector((state) => state.task);
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "super_admin";
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      dispatch(getAllTasksThunk({ page: 1, limit: 200 }));
      return;
    }

    dispatch(myTaskThunk());
  }, [dispatch, isAdmin]);

  const groupedTasks = useMemo(() => {
    return COLUMNS.reduce((groups, column) => {
      groups[column.key] = (tasks || []).filter((task) => (task.status || "todo") === column.key);
      return groups;
    }, {});
  }, [tasks]);

  const overdueCount = (tasks || []).filter((task) => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < new Date();
  }).length;

  const handleStatusMove = async (task, status) => {
    const assignedUsers = (task.assigned_users || []).filter(Boolean);

    if (status === "todo" && !isAdmin) {
      showToast.error("Only admins can move a task back to To Do.");
      return;
    }

    if (status !== "todo" && !assignedUsers.length) {
      showToast.error("Assign a member before moving this task into active work.");
      return;
    }

    if (task.status === status) return;

    try {
      await dispatch(updateTaskStatusThunk({ taskId: task.id, status })).unwrap();
      showToast.success("Task moved successfully");
    } catch (error) {
      showToast.error(error?.message || "Failed to move task");
    }
  };

  const handleDrop = (status) => {
    const task = tasks.find((item) => item.id === draggedTaskId);
    setDraggedTaskId(null);

    if (!task) return;
    handleStatusMove(task, status);
  };

  if (taskLoading && !tasks.length) {
    return <AppLoader fullScreen message="Loading task board..." />;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Task Board</h1>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            Kanban view of work by status, with project, assignee, priority, and deadline context.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs font-bold">
          <BoardMetric label="Total" value={tasks.length} />
          <BoardMetric label="Active" value={groupedTasks.in_progress?.length || 0} />
          <BoardMetric label="Overdue" value={overdueCount} alert />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {COLUMNS.map((column) => {
          const Icon = column.icon;
          const columnTasks = groupedTasks[column.key] || [];

          return (
            <section
              key={column.key}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(column.key)}
              className={`min-h-[520px] rounded-2xl border bg-[var(--card)] ${column.border}`}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] p-4 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <Icon className={column.tone} size={18} />
                  <h2 className="text-sm font-black">{column.title}</h2>
                </div>
                <span className="rounded-lg bg-[var(--input)] px-2 py-1 text-[11px] font-black text-[var(--muted)]">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3 p-3">
                {columnTasks.length === 0 ? (
                  <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-xs font-bold text-[var(--muted)]">
                    No tasks in this lane
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskBoardCard
                      key={task.id}
                      task={task}
                      onMove={handleStatusMove}
                      canReopen={isAdmin}
                      onDragStart={() => setDraggedTaskId(task.id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

function BoardMetric({ label, value, alert = false }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className={`text-xl font-black ${alert && value > 0 ? "text-rose-500" : "text-[var(--text)]"}`}>{value}</p>
    </div>
  );
}

function TaskBoardCard({ task, onMove, canReopen, onDragStart, onDragEnd }) {
  const assignedUsers = (task.assigned_users || []).filter(Boolean);
  const overdue = task.due_date && task.status !== "completed" && new Date(task.due_date) < new Date();
  const canStart = assignedUsers.length > 0;

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 shadow-sm cursor-grab active:cursor-grabbing"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-black">{task.title}</h3>
          <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-black uppercase ${priorityClass[task.priority] || priorityClass.medium}`}>
            {task.priority || "medium"}
          </span>
        </div>

        <p className="line-clamp-2 text-xs font-medium leading-relaxed text-[var(--muted)]">
          {task.description || "No description provided."}
        </p>

        <div className="space-y-2 text-[11px] font-bold text-[var(--muted)]">
          {task.project?.name && (
            <div className="flex items-center gap-2">
              <FolderKanban size={13} />
              <span className="truncate">{task.project.name}</span>
            </div>
          )}
          <div className={`flex items-center gap-2 ${overdue ? "text-rose-500" : ""}`}>
            {overdue ? <AlertTriangle size={13} /> : <Calendar size={13} />}
            <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserRound size={13} />
            <span className="truncate">
              {assignedUsers.length ? assignedUsers.map((user) => user.name).join(", ") : "Unassigned"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
          {task.status === "todo" && !canStart && (
            <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black text-blue-500">
              Assign members to start
            </span>
          )}
          {task.status === "todo" && canStart && (
            <button onClick={() => onMove(task, "in_progress")} className="rounded-lg border border-amber-500/20 px-2.5 py-1 text-[10px] font-black text-amber-500 hover:bg-amber-500/10 cursor-pointer">
              Start Task
            </button>
          )}
          {task.status === "in_progress" && (
            <button onClick={() => onMove(task, "completed")} className="rounded-lg border border-emerald-500/20 px-2.5 py-1 text-[10px] font-black text-emerald-500 hover:bg-emerald-500/10 cursor-pointer">
              Mark Complete
            </button>
          )}
          {task.status === "completed" && canReopen && (
            <button onClick={() => onMove(task, "in_progress")} className="rounded-lg border border-amber-500/20 px-2.5 py-1 text-[10px] font-black text-amber-500 hover:bg-amber-500/10 cursor-pointer">
              Reopen Task
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
