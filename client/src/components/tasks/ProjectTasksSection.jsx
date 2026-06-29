// 📑 Location: src/app/(protected)/projects/ProjectTasksSection.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layers, Plus, ClipboardX, ChevronLeft, ChevronRight } from "lucide-react";
import TaskCard from "./TaskCard";
import { TaskCardSkeleton } from "./TaskCardSkeleton";
import { deleteTaskThunk, updateTaskStatusThunk, updateTaskThunk } from "@/features/tasks/thunks/taskThunk";
import { showToast } from "@/lib/toast";
import Pagination from "@/components/common/Pagination";

const STATUS_FILTERS = [
  { key: "all", label: "All Items" },
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

export default function ProjectTasksSection({
  project,
  onCreateTask,
  canCreateTask,
  status,
  setStatus,
  page,
  setPage,
}) {
  const dispatch = useDispatch();
  const { tasks, pagination, taskLoading } = useSelector((state) => state.task);
  const { members } = useSelector((state) => state.project);
  const { user } = useSelector((state) => state.auth);

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // ANTI-GLITCH STATE: Prevents flashing skeletons on ultra-fast API returns
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    let timer;
    if (taskLoading) {
      timer = setTimeout(() => {
        setShowSkeleton(true);
      }, 400);
    } else {
      setShowSkeleton(false);
    }
    return () => clearTimeout(timer);
  }, [taskLoading]);

  // Reset task selection when status or page changes to avoid UI glitches
  useEffect(() => {
    setSelectedTaskId(null);
  }, [status, page]);

  // 🧠 THE FIX: Compute client-side filtering safely to prevent tasks disappearing on filter change
  const filteredTasks = useMemo(() => {
    const rawTasks = tasks || [];
    if (status === "all") return rawTasks.filter(Boolean);
    return rawTasks.filter((task) => task && task.status === status);
  }, [tasks, status]);

  const isWorkspaceAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "super_admin";
  const isProjectManager = project?.role === "manager";
  const hasEditPrivileges = isWorkspaceAdmin || isProjectManager;

  const handleUpdateStatus = async (taskId, updatedFields) => {
    try {
      if (updatedFields.status) {
        await dispatch(updateTaskStatusThunk({ taskId, status: updatedFields.status })).unwrap();
        showToast.success(`Task shifted to ${updatedFields.status.replace("_", " ").toUpperCase()}`);
      }
    } catch (error) {
      showToast.error(error?.message || "Failed updating target pipeline status node.");
    }
  };

  const handleUpdateTaskDetails = async (taskId, payload) => {
    try {
      await dispatch(updateTaskThunk({ taskId, payload })).unwrap();
      showToast.success("Task modifications saved securely");
    } catch (error) {
      showToast.error(error?.message || "Error rewriting data matrix configuration details.");
    }
  };

  return (
    <section className="space-y-6">
      {/* SECTION HEADER CONTROL ROW */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2.5" style={{ color: "var(--text)" }}>
            <Layers size={20} className="text-[var(--primary)]" />
            Task Workspace Directory
          </h2>
          <p className="mt-0.5 text-xs font-medium" style={{ color: "var(--muted)" }}>
            Monitor phase distribution parameters, dependencies, and delivery timelines.
          </p>
        </div>

        {/* ACTIONS / SEGMENTS BAR */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
          <div className="flex gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 w-full sm:w-auto">
            {STATUS_FILTERS.map((item) => {
              const active = status === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setStatus(item.key);
                    setPage(1);
                  }}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer"
                  style={{
                    background: active ? "var(--card)" : "transparent",
                    color: active ? "var(--primary)" : "var(--muted)",
                    boxShadow: active ? "var(--shadow)" : "none",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {canCreateTask && (
            <button
              type="button"
              onClick={onCreateTask}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold tracking-wide text-white transition active:scale-98 select-none shadow-sm cursor-pointer hover:opacity-95"
              style={{ background: "var(--primary)" }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Compose Task
            </button>
          )}
        </div>
      </div>

      {/* CORE CONTAINER */}
      <div className="space-y-3 min-h-[250px]">
        {showSkeleton ? (
          [...Array(3)].map((_, i) => <TaskCardSkeleton key={i} />)
        ) : filteredTasks.length > 0 ? (
          /* Render from computed 'filteredTasks' array */
          filteredTasks.map((task) => (
            <div
              key={`task-wrapper-${task.id}`}
              className="animate-in fade-in duration-200 state-layer transition-all"
            >
              <TaskCard
                task={task}
                isSelected={selectedTaskId === task?.id}
                onSelect={() => setSelectedTaskId((prev) => (prev === task.id ? null : task.id))}
                projectMembers={members}
                onUpdate={handleUpdateStatus}
                onUpdateDetails={handleUpdateTaskDetails}
                canEdit={hasEditPrivileges}
                onDelete={async (taskId) => {
                  try {
                    await dispatch(deleteTaskThunk(taskId)).unwrap();
                    showToast.success("Task record permanently removed");
                  } catch (err) {
                    showToast.error(err?.message || "Failed to destroy the target card entry.");
                  }
                }}
              />
            </div>
          ))
        ) : (
          /* Empty state view block: Only shows when loading completes and no records match */
          !taskLoading && (
            <div className="rounded-2xl py-16 px-4 text-center border border-dashed flex flex-col items-center justify-center animate-in fade-in duration-300" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <ClipboardX size={40} className="mx-auto mb-3 opacity-40" style={{ color: "var(--muted)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No operational arrays indexed</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>No tasks matched the selected pipeline phase filter.</p>
            </div>
          )
        )}
      </div>

      {/* PAGINATION COMPONENT */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xs mt-4">
        <Pagination
          page={page}
          limit={pagination?.limit || 10}
          total={pagination?.total || tasks.length}
          totalPages={pagination?.totalPages || 1}
          onPageChange={({ page: newPage }) => setPage(newPage)}
        />
      </div>
    </section>
  );
}