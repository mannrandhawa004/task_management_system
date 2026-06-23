"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Clock,
  Calendar,
  UserCheck,
  MapPin,
  Activity,
  CheckCircle,
  AlertCircle,
  Coffee,
  Building,
  Filter,
  Search,
  Edit2,
  X,
  Save,
} from "lucide-react";
import {
  checkInThunk,
  checkOutThunk,
  getTodayStatusThunk,
  getMyHistoryThunk,
  getDailyLogsThunk,
  updateAttendanceThunk,
} from "@/features/attendance/thunks/attendanceThunks";
import { getDepartmentsThunk } from "@/features/departments/thunks/departmentThunks";
import AppLoader from "@/components/common/AppLoader";

export default function AttendancePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { todayStatus, history, summary, dailyLogs, loading } = useSelector((state) => state.attendance);
  const { departmentsList } = useSelector((state) => state.departments);

  const [time, setTime] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [checkInStatus, setCheckInStatus] = useState("present"); // present, remote
  const [activeTab, setActiveTab] = useState("my-log"); // my-log, company-log
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Admin view filters
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterDept, setFilterDept] = useState("");

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editHours, setEditHours] = useState(0);

  const isManagement =
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "super_admin" ||
    user?.role?.toLowerCase() === "dept_head";

  // Dynamic Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDateLabel(
        now.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial personal details
  useEffect(() => {
    dispatch(getTodayStatusThunk());
    dispatch(getMyHistoryThunk({ month: selectedMonth, year: selectedYear }));
    if (isManagement) {
      dispatch(getDepartmentsThunk({ page: 1, limit: 100 }));
      dispatch(getDailyLogsThunk({ date: filterDate, departmentId: filterDept }));
    }
  }, [dispatch, selectedMonth, selectedYear, isManagement]);

  // Refetch company logs when filters change
  useEffect(() => {
    if (isManagement) {
      dispatch(getDailyLogsThunk({ date: filterDate, departmentId: filterDept }));
    }
  }, [dispatch, filterDate, filterDept, isManagement]);

  const handleCheckIn = () => {
    dispatch(checkInThunk(checkInStatus)).then(() => {
      dispatch(getMyHistoryThunk({ month: selectedMonth, year: selectedYear }));
      if (isManagement) {
        dispatch(getDailyLogsThunk({ date: filterDate, departmentId: filterDept }));
      }
    });
  };

  const handleCheckOut = () => {
    dispatch(checkOutThunk()).then(() => {
      dispatch(getMyHistoryThunk({ month: selectedMonth, year: selectedYear }));
      if (isManagement) {
        dispatch(getDailyLogsThunk({ date: filterDate, departmentId: filterDept }));
      }
    });
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    dispatch(
      updateAttendanceThunk({
        id: editingRecord.id,
        data: { status: editStatus, working_hours: Number(editHours) },
      })
    ).then(() => {
      dispatch(getDailyLogsThunk({ date: filterDate, departmentId: filterDept }));
      setEditingRecord(null);
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "late":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "half_day":
        return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
      case "remote":
        return "bg-sky-500/10 text-sky-500 border border-sky-500/20";
      case "on_leave":
        return "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20";
      case "absent":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-[var(--text)]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[var(--text)] to-[var(--muted)] bg-clip-text text-transparent">
            Attendance Tracking
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Manage your daily check-in, check-out, working hours, and view company logs.
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

      {/* DUAL COLUMN MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHECK-IN/OUT PANEL */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm backdrop-blur-md flex flex-col justify-between space-y-6 min-h-[300px]">
          <div>
            <h2 className="text-md font-bold tracking-tight mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--primary)]" />
              Check-In Space
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Log your workday arrival and departure status.
            </p>
          </div>

          <div className="space-y-4">
            {!todayStatus ? (
              // Ready to Check-In
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Select Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckInStatus("present")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      checkInStatus === "present"
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] hover:bg-[var(--hover)] text-[var(--muted)]"
                    }`}
                  >
                    Office Work
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckInStatus("remote")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      checkInStatus === "remote"
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] hover:bg-[var(--hover)] text-[var(--muted)]"
                    }`}
                  >
                    Remote Work
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCheckIn}
                  className="w-full py-3.5 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-[var(--primary)]/10 transition-all cursor-pointer active:scale-98"
                >
                  Confirm Check-In
                </button>
              </div>
            ) : todayStatus && !todayStatus.check_out ? (
              // Ready to Check-Out
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <div className="text-xs font-bold leading-none">
                    Checked in at {new Date(todayStatus.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckOut}
                  className="w-full py-3.5 bg-amber-500 hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/10 transition-all cursor-pointer active:scale-98"
                >
                  Log Check-Out
                </button>
              </div>
            ) : (
              // Completed Workday
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2 border border-green-500/20">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold">Workday Logged Successfully</h3>
                <p className="text-[11px] text-[var(--muted)] max-w-[200px] mx-auto">
                  Today's total working time: <span className="font-extrabold text-[var(--text)]">{todayStatus.working_hours} hours</span>.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
            <span>Location: Global Net</span>
            <span>Secure Tunnel</span>
          </div>
        </div>

        {/* METRICS & SUMMARIES */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="text-md font-bold tracking-tight mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--primary)]" />
              Monthly Attendance Performance
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Aggregated operational metrics for the selected month window.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-6">
            <div className="p-4 bg-[var(--hover)] border border-[var(--border)] rounded-2xl text-center">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Present</div>
              <div className="text-2xl font-black">{summary?.present_days || 0}</div>
            </div>
            <div className="p-4 bg-[var(--hover)] border border-[var(--border)] rounded-2xl text-center">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Late</div>
              <div className="text-2xl font-black text-amber-500">{summary?.late_days || 0}</div>
            </div>
            <div className="p-4 bg-[var(--hover)] border border-[var(--border)] rounded-2xl text-center">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Remote</div>
              <div className="text-2xl font-black text-sky-500">{summary?.remote_days || 0}</div>
            </div>
            <div className="p-4 bg-[var(--hover)] border border-[var(--border)] rounded-2xl text-center">
              <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Hours Logged</div>
              <div className="text-2xl font-black text-[var(--primary)]">
                {summary?.total_working_hours ? Math.round(Number(summary.total_working_hours)) : 0}h
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--input)] text-xs font-bold"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString(undefined, { month: "long" })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--input)] text-xs font-bold"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DETAILED VIEWS TABS */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm backdrop-blur-md">
        
        {/* TABS HEADER */}
        <div className="flex items-center border-b border-[var(--border)] pb-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("my-log")}
            className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "my-log"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            My Attendance History
          </button>
          
          {isManagement && (
            <button
              type="button"
              onClick={() => setActiveTab("company-log")}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === "company-log"
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Company Daily Roster
            </button>
          )}
        </div>

        {/* TAB 1: PERSONAL ATTENDANCE LOG */}
        {activeTab === "my-log" && (
          <div className="overflow-x-auto">
            {history && history.length > 0 ? (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Hours Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/40 text-xs font-bold">
                  {history.map((row) => (
                    <tr key={row.id} className="hover:bg-[var(--hover)]/40 transition-colors">
                      <td className="py-3.5 px-4 font-black">
                        {new Date(row.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--muted)]">
                        {row.check_in ? new Date(row.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--muted)]">
                        {row.check_out ? new Date(row.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-[var(--muted)]">
                        {row.working_hours ? `${row.working_hours} hrs` : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Coffee className="w-12 h-12 text-[var(--muted)] mx-auto mb-2" />
                <h3 className="text-xs font-bold text-[var(--muted)]">No attendance history logged for this month</h3>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPANY ROSTER LOG (MANAGEMENT ONLY) */}
        {activeTab === "company-log" && isManagement && (
          <div className="space-y-6">
            
            {/* FILTERS AREA */}
            <div className="flex flex-col sm:flex-row gap-3 items-center bg-[var(--hover)] border border-[var(--border)] p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)]">
                <Filter className="w-4 h-4" />
                Filters:
              </div>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="p-2 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold w-full sm:w-auto"
              />

              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="p-2 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold w-full sm:w-auto"
              >
                <option value="">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ROSTER GRID/LIST */}
            <div className="overflow-x-auto">
              {dailyLogs && dailyLogs.length > 0 ? (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Check-In</th>
                      <th className="py-3 px-4">Check-Out</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Hours</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/40 text-xs font-bold">
                    {dailyLogs.map((row) => (
                      <tr key={row.user_id} className="hover:bg-[var(--hover)]/40 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[var(--border)] relative bg-[var(--border)]">
                            {row.user_avatar ? (
                              <img src={row.user_avatar} alt={row.user_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--muted)] font-black uppercase">
                                {row.user_name?.substring(0, 2)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold">{row.user_name}</div>
                            <div className="text-[10px] text-[var(--muted)] leading-none">{row.user_email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--muted)]">{row.department_name || "Unassigned"}</td>
                        <td className="py-3 px-4 text-[var(--muted)]">
                          {row.check_in ? new Date(row.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                        </td>
                        <td className="py-3 px-4 text-[var(--muted)]">
                          {row.check_out ? new Date(row.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(row.status || "Absent")}`}>
                            {row.status || "Absent"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--muted)]">
                          {row.working_hours ? `${row.working_hours} hrs` : "--"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {row.id ? (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRecord(row);
                                setEditStatus(row.status);
                                setEditHours(row.working_hours || 0);
                              }}
                              className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                // Create manual check-in entry helper
                                setEditingRecord({
                                  id: null,
                                  user_id: row.user_id,
                                  user_name: row.user_name,
                                  date: filterDate,
                                });
                                setEditStatus("present");
                                setEditHours(8);
                              }}
                              className="px-2 py-1 border border-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/10 text-[10px] uppercase font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Log Entry
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <Coffee className="w-12 h-12 text-[var(--muted)] mx-auto mb-2" />
                  <h3 className="text-xs font-bold text-[var(--muted)]">No active employee roster records found</h3>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* EDIT/CORRECTION MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[var(--bg)] border border-[var(--border)] shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm">Attendance Correction</h3>
                <p className="text-[10px] text-[var(--muted)] uppercase font-bold">
                  Editing roster entry for {editingRecord.user_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Log Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                >
                  <option value="present">Present (Office)</option>
                  <option value="late">Late Arrival</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                  <option value="remote">Remote Work</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                  Working Hours
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--input)] text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] bg-[var(--hover)]/40 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-bold hover:bg-[var(--hover)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-[var(--primary)]/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
