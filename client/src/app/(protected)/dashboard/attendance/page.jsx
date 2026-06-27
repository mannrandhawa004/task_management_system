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
  FileText,
  Search,
  Filter
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
import Pagination from "@/components/common/Pagination";

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
  const { history, summary, dailyLogs, dailyLogsMeta, loading: attLoading } = useSelector((state) => state.attendance);
  const { colleaguesOnLeave, loading: leaveLoading } = useSelector((state) => state.leaves);
  const { departmentsList } = useSelector((state) => state.departments);
  const loading = attLoading || leaveLoading;

  const [time, setTime] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [cursorDate, setCursorDate] = useState(() => new Date());

  // Super Admin view filters
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterDept, setFilterDept] = useState("");

  const isManagement = ["admin", "super_admin", "dept_head", "hr"].includes(
    user?.role?.toLowerCase()
  );
  const isSuperAdmin = user?.role?.toLowerCase() === "super_admin";

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

  // Fetch initial data
  useEffect(() => {
    dispatch(getColleaguesOnLeaveThunk());
    if (isManagement) {
      dispatch(getDepartmentsThunk({ page: 1, limit: 100 }));
    }
    if (!isSuperAdmin) {
      dispatch(getTodayStatusThunk());
    }
  }, [dispatch, isManagement, isSuperAdmin]);

  // Fetch super admin daily logs when filters change
  useEffect(() => {
    if (isSuperAdmin) {
      dispatch(getDailyLogsThunk({ date: filterDate, departmentId: filterDept, page: 1, limit: 10 }));
    }
  }, [dispatch, isSuperAdmin, filterDate, filterDept]);

  // Fetch personal history when cursorDate changes (for non-super admins)
  useEffect(() => {
    if (!isSuperAdmin) {
      dispatch(getMyHistoryThunk({ month: cursorDate.getMonth() + 1, year: cursorDate.getFullYear() }));
    }
  }, [dispatch, cursorDate, isSuperAdmin]);

  // Calendar Logic (for non-super admins)
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
    <div className="space-y-6 max-w-7xl mx-auto w-full text-[var(--text)]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <Clock className="text-[var(--primary)]" />
            {isSuperAdmin ? "Company Attendance Dashboard" : "Attendance Tracking"}
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            {isSuperAdmin 
              ? "Monitor live company-wide attendance logs and employee statuses."
              : "Manage your daily check-in, check-out, working hours, and view team status."}
          </p>
        </div>

        {/* Dynamic Clock Widget */}
        <div className="flex items-center gap-3.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-[var(--shadow)] backdrop-blur-md">
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

      {isSuperAdmin ? (
        /* SUPER ADMIN VIEW */
        <SuperAdminAttendanceView 
          dailyLogs={dailyLogs} 
          dailyLogsMeta={dailyLogsMeta}
          onPageChange={({ page, limit }) => {
            dispatch(getDailyLogsThunk({ date: filterDate, departmentId: filterDept, page, limit }));
          }}
          filterDate={filterDate} 
          setFilterDate={setFilterDate} 
          filterDept={filterDept} 
          setFilterDept={setFilterDept} 
          departmentsList={departmentsList} 
          loading={loading}
        />
      ) : (
        /* EMPLOYEE / REGULAR VIEW */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* CHECK-IN/OUT WIDGET */}
            <AttendanceWidget />

            {/* METRICS & SUMMARIES */}
            <div className="lg:col-span-1 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-[var(--shadow)] backdrop-blur-md">
              <div className="mb-6">
                <h2 className="text-md font-bold tracking-tight mb-1 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--primary)]" />
                  Monthly Performance ({currentMonthLabel})
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  Aggregated operational metrics for the selected month window.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--hover)]/30 border border-[var(--border)] hover:bg-[var(--hover)]/60 transition-all duration-300 rounded-2xl text-center">
                  <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Present</div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{summary?.present_days || 0}</div>
                </div>
                <div className="p-4 bg-[var(--hover)]/30 border border-[var(--border)] hover:bg-[var(--hover)]/60 transition-all duration-300 rounded-2xl text-center">
                  <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Late</div>
                  <div className="text-2xl font-black text-amber-500">{summary?.late_days || 0}</div>
                </div>
                <div className="p-4 bg-[var(--hover)]/30 border border-[var(--border)] hover:bg-[var(--hover)]/60 transition-all duration-300 rounded-2xl text-center">
                  <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Absent</div>
                  <div className="text-2xl font-black text-rose-500">{summary?.absent_days || 0}</div>
                </div>
                <div className="p-4 bg-[var(--hover)]/30 border border-[var(--border)] hover:bg-[var(--hover)]/60 transition-all duration-300 rounded-2xl text-center">
                  <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Hours Logged</div>
                  <div className="text-2xl font-black text-[var(--primary)]">
                    {summary?.total_working_hours ? Math.round(Number(summary.total_working_hours)) : 0}h
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
            {/* MONTHLY CALENDAR GRID */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-[var(--shadow)] backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                 <div>
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <Calendar className="text-[var(--primary)] w-5 h-5" />
                      Attendance Calendar
                    </h2>
                    <p className="text-xs text-[var(--muted)] mt-1">Daily working hours and status logs.</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCursorDate((date) => addMonths(date, -1))} 
                      className="rounded-xl border border-[var(--border)] bg-[var(--hover)]/40 p-2 hover:bg-[var(--hover)] transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="min-w-[160px] rounded-xl border border-[var(--border)] bg-[var(--hover)]/20 px-4 py-2 text-center text-sm font-black">
                      {currentMonthLabel}
                    </div>
                    <button 
                      onClick={() => setCursorDate((date) => addMonths(date, 1))} 
                      className="rounded-xl border border-[var(--border)] bg-[var(--hover)]/40 p-2 hover:bg-[var(--hover)] transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={18} />
                    </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--hover)] text-center text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-3">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 bg-[var(--border)]/20 gap-[1px]">
                  {calendarDays.map((day) => {
                    const dateKey = toDateKey(day);
                    const record = historyByDate[dateKey];
                    const isCurrentMonth = day.getMonth() === cursorDate.getMonth();
                    const isToday = dateKey === todayKey;

                    return (
                      <div 
                        key={dateKey} 
                        className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors duration-200 ${
                          isCurrentMonth 
                            ? "bg-[var(--card)] hover:bg-[var(--hover)]/20" 
                            : "bg-[var(--hover)]/10 opacity-30 pointer-events-none"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black transition-all ${
                            isToday 
                              ? "bg-[var(--primary)] text-white shadow-sm" 
                              : "text-[var(--muted)]"
                          }`}>
                            {day.getDate()}
                          </span>
                          {record && (
                             <span className={`px-1.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider ${statusTone[record.status] || statusTone.absent}`}>
                               {record.status.replace("_", " ")}
                             </span>
                          )}
                        </div>
                        
                        {record && (
                          <div className="mt-auto space-y-0.5 text-center bg-[var(--hover)]/40 rounded-xl p-1.5 border border-[var(--border)]/60 hover:bg-[var(--hover)]/70 transition-all duration-200">
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
            <aside className="space-y-8">
              <section className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-[var(--shadow)] backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4">
                   <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                     <Users size={18} />
                   </div>
                   <h2 className="text-md font-bold tracking-tight">On Leave Today</h2>
                </div>
                
                <div className="space-y-3">
                  {colleaguesOnLeave && colleaguesOnLeave.length > 0 ? (
                    colleaguesOnLeave.map((leave) => (
                      <div key={leave.id} className="flex items-center gap-3 p-3 bg-[var(--hover)]/30 hover:bg-[var(--hover)]/60 transition-all border border-[var(--border)] rounded-2xl">
                        <div className="h-10 w-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black text-sm">
                          {leave.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text)]">{leave.user_name}</p>
                          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{leave.type.replace("_", " ")} Leave</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center border border-dashed border-[var(--border)] bg-[var(--hover)]/10 rounded-2xl">
                      <AlertCircle className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold text-[var(--muted)]">No colleagues are on leave today.</p>
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// SUPER ADMIN COMPANY VIEW COMPONENT
// ----------------------------------------------------------------------
function SuperAdminAttendanceView({ dailyLogs, dailyLogsMeta, onPageChange, filterDate, setFilterDate, filterDept, setFilterDept, departmentsList, loading }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate quick stats
  const stats = useMemo(() => {
    if (!dailyLogs) return { total: 0, working: 0, present: 0, late: 0, absent: 0, leave: 0 };
    return dailyLogs.reduce((acc, log) => {
      acc.total += 1;
      const status = log.status;
      if (status === 'working') acc.working += 1;
      else if (status === 'present') acc.present += 1;
      else if (status === 'late') acc.late += 1;
      else if (status === 'on_leave') acc.leave += 1;
      else acc.absent += 1; // if null or absent
      return acc;
    }, { total: 0, working: 0, present: 0, late: 0, absent: 0, leave: 0 });
  }, [dailyLogs]);

  // Filter logs by employee name
  const filteredLogs = useMemo(() => {
    if (!dailyLogs) return [];
    return dailyLogs.filter(log => {
      const matchesName = log.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = log.department_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesName || matchesDept;
    });
  }, [dailyLogs, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* QUICK STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow)] hover:shadow-md transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Total Employees</p>
            </div>
            <p className="text-2xl font-black text-[var(--text)]">{stats.total}</p>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow)] hover:shadow-md transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Currently Working</p>
            </div>
            <p className="text-2xl font-black text-emerald-500">{stats.working}</p>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow)] hover:shadow-md transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Present (Out)</p>
            </div>
            <p className="text-2xl font-black text-blue-500">{stats.present}</p>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow)] hover:shadow-md transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Late</p>
            </div>
            <p className="text-2xl font-black text-amber-500">{stats.late}</p>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow)] hover:shadow-md transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Absent</p>
            </div>
            <p className="text-2xl font-black text-rose-500">{stats.absent}</p>
          </div>
        </div>
      </div>

      {/* FILTER & DATA TABLE */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-[var(--shadow)] backdrop-blur-md">
        
        {/* FILTERS */}
        <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center gap-4 bg-[var(--hover)]/40">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--input)] text-[var(--text)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[var(--input)] border border-[var(--border)] rounded-xl px-3 py-1.5 focus-within:border-[var(--primary)] transition-all">
              <Calendar className="w-4 h-4 text-[var(--muted)]" />
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none text-[var(--text)] border-none focus:ring-0 focus:shadow-none p-0 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 bg-[var(--input)] border border-[var(--border)] rounded-xl px-3 py-1.5 focus-within:border-[var(--primary)] transition-all">
              <Filter className="w-4 h-4 text-[var(--muted)]" />
              <select 
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none text-[var(--text)] border-none focus:ring-0 focus:shadow-none p-0 cursor-pointer pr-6"
              >
                <option value="">All Departments</option>
                {departmentsList?.map(dept => (
                  <option key={dept.id} value={dept.id} className="bg-[var(--bg)] text-[var(--text)]">{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--hover)] border-b border-[var(--border)]">
                <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Employee</th>
                <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Status</th>
                <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Check In</th>
                <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Check Out</th>
                <th className="p-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-wider text-right">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-[var(--muted)]">
                    <AppLoader />
                  </td>
                </tr>
              ) : filteredLogs?.length > 0 ? (
                filteredLogs.map((log) => {
                  const status = log.status || "absent";
                  return (
                    <tr key={log.id || log.user_id} className="hover:bg-[var(--hover)]/30 transition-colors duration-200">
                      <td className="p-4">
                        <div className="font-black text-sm text-[var(--text)]">{log.user_name}</div>
                        <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mt-0.5">{log.department_name || "No Dept"}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${statusTone[status] || statusTone.absent}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-[var(--text)]">
                        {log.check_in ? new Date(log.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "—"}
                      </td>
                      <td className="p-4 text-sm font-bold text-[var(--text)]">
                        {log.check_out ? new Date(log.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "—"}
                      </td>
                      <td className="p-4 text-right text-sm font-black text-[var(--text)]">
                        {log.working_hours ? `${Number(log.working_hours).toFixed(1)}h` : "—"}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-[var(--muted)]">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold">No attendance records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {dailyLogsMeta && (
          <Pagination
            page={dailyLogsMeta.page}
            limit={dailyLogsMeta.limit}
            total={dailyLogsMeta.total}
            totalPages={dailyLogsMeta.totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// UTILS
// ----------------------------------------------------------------------
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
