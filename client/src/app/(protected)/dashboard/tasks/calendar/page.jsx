"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Clock, FolderKanban } from "lucide-react";

import AppLoader from "@/components/common/AppLoader";
import { getAllTasksThunk, myTaskThunk } from "@/features/tasks/thunks/taskThunk";

const statusTone = {
  todo: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export default function TaskCalendarPage() {
  const dispatch = useDispatch();
  const { tasks, taskLoading } = useSelector((state) => state.task);
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role?.toLowerCase() === "admin";
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
  const overdueTasks = (tasks || []).filter((task) => task.due_date && task.status !== "completed" && toDateKey(new Date(task.due_date)) < todayKey);
  const upcomingTasks = (tasks || [])
    .filter((task) => task.due_date && task.status !== "completed" && toDateKey(new Date(task.due_date)) >= todayKey)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 8);

  if (taskLoading && !tasks.length) {
    return <AppLoader fullScreen message="Loading task calendar..." />;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-black tracking-tight">
            <CalendarDays className="text-[var(--primary)]" />
            Task Calendar
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            Monthly due-date view with overdue risk and upcoming work pulled from live task data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setCursorDate((date) => addMonths(date, -1))} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 hover:bg-[var(--hover)] cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-[180px] rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-center text-sm font-black">
            {currentMonthLabel}
          </div>
          <button onClick={() => setCursorDate((date) => addMonths(date, 1))} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 hover:bg-[var(--hover)] cursor-pointer">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--hover)] text-center text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-3">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dateKey = toDateKey(day);
              const dayTasks = tasksByDate[dateKey] || [];
              const isCurrentMonth = day.getMonth() === cursorDate.getMonth();
              const isToday = dateKey === todayKey;

              return (
                <div key={dateKey} className={`min-h-[140px] border-r border-b border-[var(--border)] p-2 ${isCurrentMonth ? "bg-[var(--card)]" : "bg-[var(--bg)]/50 opacity-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${isToday ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"}`}>
                      {day.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="rounded-md bg-[var(--input)] px-1.5 py-0.5 text-[10px] font-black text-[var(--muted)]">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className={`group relative rounded-lg border px-2 py-1 text-[10px] font-bold ${statusTone[task.status] || statusTone.todo}`}>
                        <p className="truncate">{task.title}</p>
                        <div className="pointer-events-none absolute left-0 top-7 z-30 hidden w-72 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-left shadow-xl group-hover:block">
                          <p className="text-xs font-black text-[var(--text)]">{task.title}</p>
                          <p className="mt-1 line-clamp-3 text-[11px] font-medium text-[var(--muted)]">
                            {task.description || "No description provided."}
                          </p>
                          <div className="mt-3 space-y-1 text-[11px] font-bold text-[var(--muted)]">
                            <p>Project: <span className="text-[var(--text)]">{task.project?.name || "Unknown project"}</span></p>
                            <p>Status: <span className="text-[var(--text)]">{(task.status || "todo").replace("_", " ")}</span></p>
                            <p>Priority: <span className="text-[var(--text)]">{task.priority || "medium"}</span></p>
                            <p>Assigned: <span className="text-[var(--text)]">{(task.assigned_users || []).filter(Boolean).map((user) => user.name).join(", ") || "Unassigned"}</span></p>
                            <p>Due: <span className="text-[var(--text)]">{task.due_date ? new Date(task.due_date).toLocaleString() : "No deadline"}</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="text-[10px] font-bold text-[var(--muted)]">+{dayTasks.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <CalendarPanel
            title="Overdue"
            icon={AlertTriangle}
            tasks={overdueTasks}
            tone="text-rose-500"
            empty="No overdue work"
          />
          <CalendarPanel
            title="Upcoming"
            icon={Clock}
            tasks={upcomingTasks}
            tone="text-amber-500"
            empty="No upcoming deadlines"
          />
        </aside>
      </div>
    </main>
  );
}

function CalendarPanel({ title, icon: Icon, tasks, tone, empty }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-black">
          <Icon className={tone} size={17} />
          {title}
        </h2>
        <span className="rounded-lg bg-[var(--input)] px-2 py-1 text-[10px] font-black text-[var(--muted)]">{tasks.length}</span>
      </div>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-xs font-bold text-[var(--muted)]">
            {empty}
          </div>
        ) : (
          tasks.map((task) => (
            <article key={task.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
              <h3 className="line-clamp-2 text-xs font-black">{task.title}</h3>
              <div className="mt-2 space-y-1 text-[11px] font-bold text-[var(--muted)]">
                <p>{new Date(task.due_date).toLocaleDateString()}</p>
                {task.project?.name && (
                  <p className="flex items-center gap-1.5 truncate">
                    <FolderKanban size={12} />
                    {task.project.name}
                  </p>
                )}
              </div>
            </article>
          ))
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
  return date.toISOString().slice(0, 10);
}
