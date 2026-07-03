"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, Calendar, CheckCircle2, Clock, FolderKanban, ListTodo, UserRound, ArrowRight, Check, RotateCcw, Plus, Sparkles, GripVertical } from "lucide-react";

import AppLoader from "@/components/common/AppLoader";
import { getAllTasksThunk, myTaskThunk, updateTaskStatusThunk } from "@/features/tasks/thunks/taskThunk";
import { showToast } from "@/lib/toast";

const COLUMNS = [
  { key: "todo", title: "To Do", icon: ListTodo, accent: "#3b82f6", tone: "text-blue-500", bgTone: "bg-blue-500/10 border-blue-500/20" },
  { key: "in_progress", title: "In Progress", icon: Clock, accent: "#f59e0b", tone: "text-amber-500", bgTone: "bg-amber-500/10 border-amber-500/20" },
  { key: "completed", title: "Completed", icon: CheckCircle2, accent: "#10b981", tone: "text-emerald-500", bgTone: "bg-emerald-500/10 border-emerald-500/20" },
];

const priorityConfig = {
  urgent: {
    bg: "bg-purple-500/15 dark:bg-purple-400/20",
    text: "text-purple-600 dark:text-purple-300 font-extrabold",
    border: "border-purple-500/30 dark:border-purple-400/30",
    label: "Urgent",
  },
  high: {
    bg: "bg-rose-500/10 dark:bg-rose-400/[0.12]",
    text: "text-rose-600 dark:text-rose-300 font-bold",
    border: "border-rose-500/20 dark:border-rose-400/20",
    label: "High",
  },
  medium: {
    bg: "bg-amber-500/10 dark:bg-amber-400/[0.12]",
    text: "text-amber-600 dark:text-amber-300 font-bold",
    border: "border-amber-500/20 dark:border-amber-400/20",
    label: "Medium",
  },
  low: {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/[0.12]",
    text: "text-emerald-600 dark:text-emerald-300 font-bold",
    border: "border-emerald-500/20 dark:border-emerald-400/20",
    label: "Low",
  },
};

function getTwoInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function UserAvatar({ user, sizeClass = "w-7 h-7", textClass = "text-[10px]" }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatar || user?.profile_picture || user?.user_avatar || user?.image || user?.photo;
  const displayName = user?.name || user?.username || user?.email || "User";
  const initials = getTwoInitials(displayName);

  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-black border-2 border-[var(--card)] shadow-2xs ${sizeClass} ${textClass}`} title={displayName}>
      {avatarUrl && !imgError ? (
        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" onError={() => setImgError(true)} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default function TaskBoardPage() {
  const dispatch = useDispatch();
  const { tasks, taskLoading } = useSelector((state) => state.task);
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "super_admin";
  const canManage = isAdmin || user?.role?.toLowerCase() === "manager";
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [visibleLimits, setVisibleLimits] = useState({ todo: 8, in_progress: 8, completed: 8 });

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
    if (task.status === status) return;

    const assignedUsers = (task.assigned_users || []).filter(Boolean);
    const isPrivileged = canManage || Number(task?.created_by?.id) === Number(user?.id);

    // Enforce standard linear workflow (To Do -> In Progress -> Completed) for regular assignees
    if (!isPrivileged) {
      if (task.status === "completed") {
        showToast.error("Completed tasks are finalized. Contact a manager or admin to reopen this item.");
        return;
      }
      if (task.status === "in_progress" && status === "todo") {
        showToast.error("Active tasks cannot be returned to To Do. Contact a manager to reassign or reset this item.");
        return;
      }
    }

    if (status !== "todo" && !assignedUsers.length) {
      showToast.error("Assign a crew member before moving this task into active workflow.");
      return;
    }

    try {
      await dispatch(updateTaskStatusThunk({ taskId: task.id, status })).unwrap();
      showToast.success(`Task moved to ${status.replace("_", " ")}`);
    } catch (error) {
      showToast.error(error?.message || "Failed to transition task workflow");
    }
  };

  const handleDrop = (status) => {
    setDragOverColumn(null);
    const task = tasks.find((item) => item.id === draggedTaskId);
    setDraggedTaskId(null);

    if (!task) return;
    handleStatusMove(task, status);
  };

  if (taskLoading && !tasks.length) {
    return <AppLoader fullScreen message="Loading interactive task board..." />;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col gap-6 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-1">
            <Sparkles size={14} />
            <span>Kanban Workspace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Interactive Task Board</h1>
          <p className="mt-1 text-xs md:text-sm font-medium text-[var(--muted)]">
            Drag and drop tasks across workflow stages or use quick actions to update status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BoardMetric label="Total Workload" value={tasks.length} />
          <BoardMetric label="Active Tasks" value={groupedTasks.in_progress?.length || 0} color="text-amber-500" />
          <BoardMetric label="Overdue Items" value={overdueCount} alert />
        </div>
      </div>

      {/* KANBAN BOARD COLUMNS */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 items-start">
        {COLUMNS.map((column) => {
          const Icon = column.icon;
          const columnTasks = groupedTasks[column.key] || [];
          const isDragTarget = dragOverColumn === column.key;
          const currentLimit = visibleLimits[column.key] || 8;
          const displayedTasks = columnTasks.slice(0, currentLimit);

          return (
            <section
              key={column.key}
              onDragOver={(event) => {
                event.preventDefault();
                if (dragOverColumn !== column.key) setDragOverColumn(column.key);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={() => handleDrop(column.key)}
              className={`h-[calc(100vh-210px)] min-h-[1200px]  rounded-3xl border transition-all duration-200 flex flex-col overflow-hidden ${
                isDragTarget
                  ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20 bg-[var(--primary)]/5"
                  : "border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.02]"
              }`}
            >
              {/* Column Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] p-4 shadow-2xs shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${column.bgTone}`}>
                    <Icon className={column.tone} size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-tight text-[var(--text)]">{column.title}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      Stage Lane
                    </span>
                  </div>
                </div>
                <span className="rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border)] px-3 py-1 text-xs font-black text-[var(--text)]">
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Cards Container (Independently Scrollable) */}
              <div className="space-y-3.5 p-3.5 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                {columnTasks.length === 0 ? (
                  <div className="flex flex-1 min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)]/70 bg-[var(--card)]/50 p-6 text-center">
                    <Icon className="w-8 h-8 text-[var(--muted)] opacity-40 mb-2" />
                    <p className="text-xs font-bold text-[var(--text)]">No tasks in {column.title}</p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">Drag tasks here to change status</p>
                  </div>
                ) : (
                  <>
                    {displayedTasks.map((task) => (
                      <TaskBoardCard
                        key={task.id}
                        task={task}
                        columnAccent={column.accent}
                        onMove={handleStatusMove}
                        canReopen={canManage}
                        onDragStart={() => setDraggedTaskId(task.id)}
                        onDragEnd={() => setDraggedTaskId(null)}
                      />
                    ))}

                    {/* Pagination / Show More Pill */}
                    {columnTasks.length > currentLimit && (
                      <button
                        type="button"
                        onClick={() => setVisibleLimits(prev => ({ ...prev, [column.key]: prev[column.key] + 10 }))}
                        className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] text-xs font-black text-[var(--primary)] hover:bg-[var(--hover)] hover:border-[var(--primary)]/40 transition-all cursor-pointer text-center shadow-2xs mt-2 shrink-0"
                      >
                        + Show {columnTasks.length - currentLimit} More ({currentLimit} of {columnTasks.length})
                      </button>
                    )}

                    {currentLimit > 8 && columnTasks.length > 8 && (
                      <button
                        type="button"
                        onClick={() => setVisibleLimits(prev => ({ ...prev, [column.key]: 8 }))}
                        className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer text-center shrink-0"
                      >
                        ↑ Collapse list to 8 items
                      </button>
                    )}
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

function BoardMetric({ label, value, color, alert = false }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3 shadow-2xs min-w-[120px]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className={`text-xl font-black mt-0.5 ${alert && value > 0 ? "text-rose-500" : color || "text-[var(--text)]"}`}>
        {value}
      </p>
    </div>
  );
}

function TaskBoardCard({ task, columnAccent, onMove, canReopen, onDragStart, onDragEnd }) {
  const assignedUsers = (task.assigned_users || []).filter(Boolean);
  const overdue = task.due_date && task.status !== "completed" && new Date(task.due_date) < new Date();
  const canStart = assignedUsers.length > 0;
  const priorityCfg = priorityConfig[task.priority] || priorityConfig.medium;
  const projectName = task.project?.name || task.projectName || "General Operations";

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ borderLeftColor: columnAccent, borderLeftWidth: "4px" }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group cursor-grab active:cursor-grabbing flex flex-col justify-between space-y-3"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="line-clamp-2 text-[14px] font-black leading-snug tracking-tight text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
            {task.title}
          </h3>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[10px] font-bold text-[var(--muted)] border border-[var(--border)]/40">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: columnAccent }} />
            <span className="truncate max-w-[170px]">{projectName}</span>
          </div>
        </div>

        <span className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${priorityCfg.bg} ${priorityCfg.text} ${priorityCfg.border}`}>
          {priorityCfg.label}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="line-clamp-2 text-xs font-medium leading-relaxed text-[var(--muted)] pt-0.5">
          {task.description}
        </p>
      )}

      {/* Footer Metadata & Actions Row */}
      <div className="pt-3 border-t border-[var(--border)]/60 flex items-center justify-between gap-2 text-xs">
        {/* Left Side: Avatars */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {assignedUsers.length > 0 ? (
            <div className="flex items-center -space-x-1.5">
              {assignedUsers.slice(0, 3).map((u) => (
                <UserAvatar key={u.id} user={u} sizeClass="w-6 h-6" textClass="text-[9px]" />
              ))}
              {assignedUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-[var(--hover)] border border-[var(--card)] text-[9px] font-black flex items-center justify-center shrink-0 z-10 text-[var(--muted)]">
                  +{assignedUsers.length - 3}
                </div>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--hover)] text-[10px] font-semibold text-[var(--muted)]">
              Unassigned
            </span>
          )}
        </div>

        {/* Right Side: Due Date & Quick Action Buttons */}
        <div className="flex items-center gap-1.5">
          {task.due_date && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
              overdue
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                : "bg-[var(--hover)] text-[var(--muted)]"
            }`}>
              <Clock size={11} />
              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}

          {task.status === "todo" && canStart && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(task, "in_progress"); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition shadow-2xs active:scale-95 cursor-pointer"
            >
              <span>Start</span>
              <ArrowRight size={11} />
            </button>
          )}
          {task.status === "in_progress" && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(task, "completed"); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-2xs active:scale-95 cursor-pointer"
            >
              <Check size={11} />
              <span>Done</span>
            </button>
          )}
          {task.status === "completed" && canReopen && (
            <button
              onClick={(e) => { e.stopPropagation(); onMove(task, "in_progress"); }}
              className="flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold text-[var(--muted)] hover:text-amber-500 hover:bg-amber-500/10 border border-[var(--border)] transition active:scale-95 cursor-pointer"
            >
              <RotateCcw size={10} />
              <span>Reopen</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

