// 📑 Location: src/app/(protected)/projects/ProjectTasksSection.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layers, Plus, ClipboardX, LayoutGrid, List } from "lucide-react";
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
  const [view, setView] = useState("card"); // "card" | "table"

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
  }, [status, page, view]);

  // Compute client-side filtering safely
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b pb-5" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2.5" style={{ color: "var(--text)" }}>
            <Layers size={20} className="text-[var(--primary)]" />
            Task Workspace Directory
          </h2>
          <p className="mt-1 text-xs font-medium" style={{ color: "var(--muted)" }}>
            Monitor phase distribution parameters, dependencies, and delivery timelines.
          </p>
        </div>

        {/* ACTIONS / SEGMENTS BAR */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filters */}
          <div className="flex gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 overflow-x-auto">
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
                  className="px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap select-none"
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

          {/* Prominent View Toggle Switcher (Card vs Table) */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-[var(--border)] shrink-0">
            <button
              type="button"
              onClick={() => setView("card")}
              className="px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-black select-none"
              style={{
                background: view === "card" ? "var(--card)" : "transparent",
                color: view === "card" ? "var(--primary)" : "var(--muted)",
                boxShadow: view === "card" ? "var(--shadow)" : "none",
              }}
            >
              <LayoutGrid size={14} strokeWidth={2.5} />
              Card View
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className="px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-black select-none"
              style={{
                background: view === "table" ? "var(--card)" : "transparent",
                color: view === "table" ? "var(--primary)" : "var(--muted)",
                boxShadow: view === "table" ? "var(--shadow)" : "none",
              }}
            >
              <List size={14} strokeWidth={2.5} />
              Table View
            </button>
          </div>

          {canCreateTask && (
            <button
              type="button"
              onClick={onCreateTask}
              className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black tracking-wide text-white transition active:scale-98 select-none shadow-sm cursor-pointer hover:opacity-95 shrink-0"
              style={{ background: "var(--primary)" }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Compose Task
            </button>
          )}
        </div>
      </div>

      {/* CORE CONTAINER */}
      <div className="min-h-[280px]">
        {showSkeleton ? (
          view === "table" ? (
            <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
              <table className="w-full text-left">
                <tbody>
                  {[...Array(4)].map((_, i) => (
                    <TaskCardSkeleton key={i} view="table" />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <TaskCardSkeleton key={i} view="card" />
              ))}
            </div>
          )
        ) : filteredTasks.length > 0 ? (
          view === "table" ? (
            /* TABLE VIEW */
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm animate-in fade-in duration-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.03]">
                      <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Task Detail</th>
                      <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Status</th>
                      <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Priority</th>
                      <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Due Date</th>
                      <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Assigned Roster</th>
                      <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-[var(--muted)] pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={`task-table-${task.id}`}
                        task={task}
                        view="table"
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* CARD VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
              {filteredTasks.map((task) => (
                <div key={`task-card-${task.id}`}>
                  <TaskCard
                    task={task}
                    view="card"
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
              ))}
            </div>
          )
        ) : (
          /* EMPTY STATE */
          !taskLoading && (
            <div className="rounded-3xl py-16 px-4 text-center border border-[var(--border)] bg-[var(--card)] flex flex-col items-center justify-center animate-in fade-in duration-300 shadow-xs">
              <div className="p-4 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] mb-3.5">
                <ClipboardX size={32} strokeWidth={2} />
              </div>
              <h3 className="text-base font-black tracking-tight" style={{ color: "var(--text)" }}>
                No Tasks Found
              </h3>
              <p className="text-xs max-w-xs mx-auto mt-1 font-medium" style={{ color: "var(--muted)" }}>
                No project work item records matched the selected status filter criterion.
              </p>
            </div>
          )
        )}
      </div>

      {/* PAGINATION COMPONENT */}
      {filteredTasks.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xs mt-4">
          <Pagination
            page={page}
            limit={pagination?.limit || 10}
            total={pagination?.total || tasks.length}
            totalPages={pagination?.totalPages || 1}
            onPageChange={({ page: newPage }) => setPage(newPage)}
          />
        </div>
      )}
    </section>
  );
}