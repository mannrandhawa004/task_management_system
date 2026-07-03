"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Clock, FolderKanban, Sparkles, CheckCircle2 } from "lucide-react";

import AppLoader from "@/components/common/AppLoader";
import { getAllTasksThunk, myTaskThunk } from "@/features/tasks/thunks/taskThunk";

const statusTone = {
  todo: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20",
};

const priorityTone = {
  low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  high: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  urgent: "text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse",
};

export default function TaskCalendarPage() {
  const dispatch = useDispatch();
  const { tasks, taskLoading } = useSelector((state) => state.task);
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "super_admin";
  const [cursorDate, setCursorDate] = useState(() => new Date());

  useEffect(() => {
    if (isAdmin) {
      dispatch(getAllTasksThunk({ page: 1, limit: 300 }));
      return;
    }

    dispatch(myTaskThunk());
  }, [dispatch, isAdmin]);

  const calendarDays = useMemo(() => buildMonthGrid(cursorDate), [cursorDate]);
  const tasksByDate = useMemo(() => {
    return (tasks || []).reduce((map, task) => {
      if (!task.due_date) return map;
      const key = toDateKey(new Date(task.due_date));
      map[key] = [...(map[key] || []), task];
      return map;
    }, {});
  }, [tasks]);

  const todayKey = toDateKey(new Date());
  const currentMonthLabel = cursorDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  
  const overdueTasks = useMemo(() => {
    return (tasks || [])
      .filter((task) => task.due_date && task.status !== "completed" && toDateKey(new Date(task.due_date)) < todayKey)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [tasks, todayKey]);

  const upcomingTasks = useMemo(() => {
    return (tasks || [])
      .filter((task) => task.due_date && task.status !== "completed" && toDateKey(new Date(task.due_date)) >= todayKey)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [tasks, todayKey]);

  if (taskLoading && !tasks.length) {
    return <AppLoader fullScreen message="Loading task calendar..." />;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col gap-6 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-1">
            <Sparkles size={14} />
            <span>Timeline Schedule</span>
          </div>
          <h1 className="flex items-center gap-2.5 text-2xl md:text-3xl font-black tracking-tight">
            <CalendarDays className="text-[var(--primary)]" size={28} />
            Task Calendar
          </h1>
          <p className="mt-1 text-xs md:text-sm font-medium text-[var(--muted)]">
            Monthly deadline roadmap with real-time risk evaluation and upcoming workload preview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCursorDate(new Date())}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-black hover:bg-[var(--hover)] hover:border-[var(--primary)]/40 transition cursor-pointer shadow-2xs"
          >
            Today
          </button>
          <div className="flex items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-2xs">
            <button
              onClick={() => setCursorDate((date) => addMonths(date, -1))}
              className="rounded-xl p-2 hover:bg-[var(--hover)] transition cursor-pointer text-[var(--muted)] hover:text-[var(--text)]"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <div className="min-w-[170px] px-3 py-1 text-center text-sm font-black">
              {currentMonthLabel}
            </div>
            <button
              onClick={() => setCursorDate((date) => addMonths(date, 1))}
              className="rounded-xl p-2 hover:bg-[var(--hover)] transition cursor-pointer text-[var(--muted)] hover:text-[var(--text)]"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CALENDAR GRID */}
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs w-full">
        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--hover)]/60 text-center text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-3.5 px-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dateKey = toDateKey(day);
            const dayTasks = tasksByDate[dateKey] || [];
            const isCurrentMonth = day.getMonth() === cursorDate.getMonth();
            const isToday = dateKey === todayKey;

            return (
              <div
                key={dateKey}
                className={`min-h-[140px] border-r border-b border-[var(--border)]/70 p-2.5 transition-colors ${
                  isCurrentMonth ? "bg-[var(--card)]" : "bg-[var(--bg)]/50 opacity-40"
                } ${isToday ? "ring-2 ring-[var(--primary)] ring-inset bg-[var(--primary)]/[0.02]" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black transition-all ${
                      isToday
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "text-[var(--text)]"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="rounded-lg bg-black/[0.05] dark:bg-white/[0.08] px-2 py-0.5 text-[10px] font-black text-[var(--text)]">
                      {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`group relative rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition shadow-2xs hover:shadow-md cursor-pointer ${statusTone[task.status] || statusTone.todo}`}
                    >
                      <p className="truncate">{task.title}</p>
                      
                      {/* Hover Popup */}
                      <div className="pointer-events-none absolute left-0 top-full mt-1 z-40 hidden w-72 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-2xl group-hover:block">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--hover)] text-[var(--muted)]">
                            {(task.status || "todo").replace("_", " ")}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${priorityTone[task.priority] || priorityTone.medium}`}>
                            {task.priority || "medium"}
                          </span>
                        </div>
                        <p className="text-xs font-black text-[var(--text)]">{task.title}</p>
                        <p className="mt-1 line-clamp-2 text-[11px] font-medium text-[var(--muted)]">
                          {task.description || "No description provided."}
                        </p>
                        <div className="mt-3 pt-2 border-t border-[var(--border)]/60 space-y-1 text-[11px] font-bold text-[var(--muted)]">
                          <p>Project: <span className="text-[var(--text)]">{task.project?.name || "General Workspace"}</span></p>
                          <p>Assigned: <span className="text-[var(--text)]">{(task.assigned_users || []).filter(Boolean).map((u) => u.name).join(", ") || "Unassigned"}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="rounded-lg bg-[var(--hover)] py-1 px-2 text-center text-[10px] font-black text-[var(--muted)] hover:text-[var(--text)] transition cursor-pointer">
                      +{dayTasks.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* OVERDUE & UPCOMING PANELS BELOW CALENDAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <CalendarPanel
          title="Overdue Tasks"
          icon={AlertTriangle}
          tasks={overdueTasks}
          tone="text-rose-500"
          borderTone="border-rose-500/30"
          bgTone="bg-rose-500/5"
          empty="No overdue items! Great job staying on track."
        />
        <CalendarPanel
          title="Upcoming Deadlines"
          icon={Clock}
          tasks={upcomingTasks}
          tone="text-amber-500"
          borderTone="border-amber-500/30"
          bgTone="bg-amber-500/5"
          empty="No upcoming scheduled deadlines."
        />
      </div>
    </main>
  );
}

function CalendarPanel({ title, icon: Icon, tasks, tone, borderTone, bgTone, empty }) {
  const [limit, setLimit] = useState(5);
  const displayedTasks = tasks.slice(0, limit);

  return (
    <section className={`rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs flex flex-col`}>
      <div className="mb-4 flex items-center justify-between border-b border-[var(--border)]/60 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-black text-[var(--text)]">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center border ${borderTone} ${bgTone}`}>
            <Icon className={tone} size={15} strokeWidth={2.5} />
          </div>
          <span>{title}</span>
        </h2>
        <span className="rounded-xl bg-[var(--hover)] border border-[var(--border)] px-3 py-1 text-xs font-black text-[var(--text)]">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3 flex-1">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--border)]/70 bg-[var(--card)]/50 p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--text)]">{empty}</p>
          </div>
        ) : (
          <>
            {displayedTasks.map((task) => {
              const priorityCfg = priorityTone[task.priority] || priorityTone.medium;
              const isOverdue = new Date(task.due_date) < new Date() && task.status !== "completed";

              return (
                <article
                  key={task.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3.5 shadow-2xs hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-xs font-black text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                      {task.title}
                    </h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${priorityCfg}`}>
                      {task.priority || "medium"}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between text-[11px] font-bold text-[var(--muted)]">
                    <span className={`flex items-center gap-1 ${isOverdue ? "text-rose-500 font-black" : ""}`}>
                      <Clock size={12} />
                      {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>

                    {task.project?.name && (
                      <span className="flex items-center gap-1 truncate max-w-[140px] text-[10px] bg-[var(--hover)] px-2 py-0.5 rounded-md">
                        <FolderKanban size={11} />
                        {task.project.name}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}

            {/* Collapse / Show More Buttons */}
            {tasks.length > limit && (
              <button
                type="button"
                onClick={() => setLimit((prev) => prev + 5)}
                className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] text-xs font-black text-[var(--primary)] hover:bg-[var(--hover)] hover:border-[var(--primary)]/40 transition-all cursor-pointer text-center shadow-2xs mt-1"
              >
                + Show {tasks.length - limit} More ({limit} of {tasks.length})
              </button>
            )}

            {limit > 5 && tasks.length > 5 && (
              <button
                type="button"
                onClick={() => setLimit(5)}
                className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer text-center"
              >
                ↑ Collapse list to 5 items
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function buildMonthGrid(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function toDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
