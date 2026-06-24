"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Clock,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Activity,
  FileText
} from "lucide-react";
import {
  getTodayStatusThunk,
  getMyHistoryThunk,
  getDailyLogsThunk,
} from "@/features/attendance/thunks/attendanceThunks";
import { getColleaguesOnLeaveThunk } from "@/features/leaves/thunks/leaveThunks";
import { getDepartmentsThunk } from "@/features/departments/thunks/departmentThunks";
import AppLoader from "@/components/common/AppLoader";
import AttendanceWidget from "@/components/attendance/AttendanceWidget";

const statusTone = {
  working: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  on_break: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  present: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  late: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  half_day: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  remote: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  on_leave: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  absent: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

export default function AttendancePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { history, summary, dailyLogs, loading: attLoading } = useSelector((state) => state.attendance);
  const { colleaguesOnLeave, loading: leaveLoading } = useSelector((state) => state.leaves);
  const loading = attLoading || leaveLoading;

  const [time, setTime] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [cursorDate, setCursorDate] = useState(() => new Date());

  const isManagement = ["admin", "super_admin", "dept_head", "hr"].includes(
    user?.role?.toLowerCase()
  );

  // Dynamic Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDateLabel(now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data
  useEffect(() => {
    dispatch(getTodayStatusThunk());
    dispatch(getColleaguesOnLeaveThunk());
    if (isManagement) {
      dispatch(getDepartmentsThunk({ page: 1, limit: 100 }));
    }
  }, [dispatch, isManagement]);

  // Fetch history when cursorDate changes
  useEffect(() => {
    dispatch(getMyHistoryThunk({ month: cursorDate.getMonth() + 1, year: cursorDate.getFullYear() }));
  }, [dispatch, cursorDate]);

  // Calendar Logic
  const calendarDays = useMemo(() => buildMonthGrid(cursorDate), [cursorDate]);
  const historyByDate = useMemo(() => {
    return (history || []).reduce((map, record) => {
      if (!record.date) return map;
      const key = toDateKey(new Date(record.date));
      map[key] = record;
      return map;
    }, {});
  }, [history]);

  const todayKey = toDateKey(new Date());
  const currentMonthLabel = cursorDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <Clock className="text-[var(--primary)]" />
            Attendance Tracking
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            Manage your daily check-in, check-out, working hours, and view team status.
          </p>
        </div>

        {/* Dynamic Clock Widget */}
        <div className="flex items-center gap-3.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm backdrop-blur-md">
          <div className="p-2.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight">{time || "--:--:--"}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
              {dateLabel || "Loading..."}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHECK-IN/OUT WIDGET */}
        <AttendanceWidget />

        {/* METRICS & SUMMARIES */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="text-md font-bold tracking-tight mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--primary)]" />
              Monthly Performance ({currentMonthLabel})
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Aggregated operational metrics for the selected month window.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-center">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Present</div>
              <div className="text-2xl font-black text-blue-500">{summary?.present_days || 0}</div>
            </div>
            <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-center">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Late</div>
              <div className="text-2xl font-black text-amber-500">{summary?.late_days || 0}</div>
            </div>
            <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-center">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Absent</div>
              <div className="text-2xl font-black text-rose-500">{summary?.absent_days || 0}</div>
            </div>
            <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-center">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Hours Logged</div>
              <div className="text-2xl font-black text-[var(--primary)]">
                {summary?.total_working_hours ? Math.round(Number(summary.total_working_hours)) : 0}h
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* MONTHLY CALENDAR GRID */}
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
             <div>
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Calendar className="text-[var(--primary)] w-5 h-5" />
                  Attendance Calendar
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1">Daily working hours and status logs.</p>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setCursorDate((date) => addMonths(date, -1))} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2 hover:bg-[var(--hover)] cursor-pointer">
                  <ChevronLeft size={18} />
                </button>
                <div className="min-w-[180px] rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-center text-sm font-black">
                  {currentMonthLabel}
                </div>
                <button onClick={() => setCursorDate((date) => addMonths(date, 1))} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2 hover:bg-[var(--hover)] cursor-pointer">
                  <ChevronRight size={18} />
                </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
            <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--hover)] text-center text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-3">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const dateKey = toDateKey(day);
                const record = historyByDate[dateKey];
                const isCurrentMonth = day.getMonth() === cursorDate.getMonth();
                const isToday = dateKey === todayKey;

                return (
                  <div key={dateKey} className={`min-h-[100px] border-r border-b border-[var(--border)] p-2 ${isCurrentMonth ? "bg-[var(--bg)]" : "bg-[var(--card)] opacity-50"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${isToday ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"}`}>
                        {day.getDate()}
                      </span>
                      {record && (
                         <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${statusTone[record.status] || statusTone.absent}`}>
                           {record.status.replace("_", " ")}
                         </span>
                      )}
                    </div>
                    
                    {record && (
                      <div className="mt-auto space-y-1 text-center bg-[var(--card)] rounded-lg p-1.5 border border-[var(--border)]">
                         <div className="text-xs font-black text-[var(--text)]">
                            {Number(record.working_hours).toFixed(1)} <span className="text-[10px] font-medium text-[var(--muted)]">hrs</span>
                         </div>
                         {(record.check_in || record.check_out) && (
                           <div className="text-[9px] text-[var(--muted)] font-bold">
                              {record.check_in && new Date(record.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                              {record.check_out && ` - ${new Date(record.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR: COLLEAGUES ON LEAVE */}
        <aside className="space-y-6">
          <section className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
               <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                 <Users size={18} />
               </div>
               <h2 className="text-md font-bold tracking-tight">On Leave Today</h2>
            </div>
            
            <div className="space-y-3">
              {colleaguesOnLeave && colleaguesOnLeave.length > 0 ? (
                colleaguesOnLeave.map((leave) => (
                  <div key={leave.id} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
                    <div className="h-10 w-10 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center font-black text-sm">
                      {leave.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text)]">{leave.user_name}</p>
                      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{leave.type.replace("_", " ")} Leave</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center border border-dashed border-[var(--border)] rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-[var(--muted)]">No colleagues are on leave today.</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
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
