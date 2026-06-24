"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Coffee,
  Play,
  Square,
  Clock,
  LogIn,
  LogOut,
  Timer,
  Pause,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import {
  getTodayStatusThunk,
  checkInThunk,
  checkOutThunk,
  startBreakThunk,
  endBreakThunk,
} from "@/features/attendance/thunks/attendanceThunks";

export default function AttendanceWidget() {
  const dispatch = useDispatch();
  const { todayRecord, weeklyHours, loading } = useSelector(
    (state) => state.attendance
  );
  const { user } = useSelector((state) => state.auth);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [breakElapsed, setBreakElapsed] = useState(0);

  // Fetch today's status on mount
  useEffect(() => {
    if (user && user.role !== "super_admin") {
      dispatch(getTodayStatusThunk());
    }
  }, [dispatch, user]);

  // Live timer logic
  useEffect(() => {
    let interval = null;

    if (todayRecord && todayRecord.status === "working") {
      // Active working — tick every second
      const tick = () => {
        const checkInTime = new Date(todayRecord.check_in).getTime();
        const now = Date.now();
        const totalBreakSecs = todayRecord.total_break_seconds || 0;
        const elapsed = Math.floor((now - checkInTime) / 1000) - totalBreakSecs;
        setElapsedSeconds(elapsed > 0 ? elapsed : 0);
      };
      tick(); // immediate first tick
      interval = setInterval(tick, 1000);
    } else if (todayRecord && todayRecord.status === "on_break") {
      // On break — freeze work timer at the moment break started
      const checkInTime = new Date(todayRecord.check_in).getTime();
      const breakStartTime = new Date(todayRecord.break_start).getTime();
      const totalBreakSecs = todayRecord.total_break_seconds || 0;
      const frozenElapsed =
        Math.floor((breakStartTime - checkInTime) / 1000) - totalBreakSecs;
      setElapsedSeconds(frozenElapsed > 0 ? frozenElapsed : 0);

      // Tick break timer
      const tickBreak = () => {
        const breakSecs = Math.floor((Date.now() - breakStartTime) / 1000);
        setBreakElapsed(breakSecs > 0 ? breakSecs : 0);
      };
      tickBreak();
      interval = setInterval(tickBreak, 1000);
    } else if (todayRecord && todayRecord.check_out) {
      // Checked out — show final working hours
      const hours = parseFloat(todayRecord.working_hours) || 0;
      setElapsedSeconds(Math.round(hours * 3600));
      setBreakElapsed(0);
    } else {
      setElapsedSeconds(0);
      setBreakElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [todayRecord]);

  // Hide for super_admin or if no user
  if (!user || user.role === "super_admin") return null;

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatBreakTotal = (seconds) => {
    if (!seconds || seconds === 0) return "0m";
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m`;
  };

  const handleCheckIn = () => dispatch(checkInThunk());
  const handleCheckOut = () => dispatch(checkOutThunk());
  const handleStartBreak = () => dispatch(startBreakThunk());
  const handleEndBreak = () => dispatch(endBreakThunk());

  // Determine visual state
  const status = todayRecord?.status;
  const isWorking = status === "working";
  const isOnBreak = status === "on_break";
  const isCheckedOut = todayRecord?.check_out != null;
  const isNotCheckedIn = !todayRecord;

  // Status-specific theme
  const getStatusConfig = () => {
    if (isWorking)
      return {
        label: "Working",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        dot: "bg-emerald-500",
        pulse: true,
      };
    if (isOnBreak)
      return {
        label: "On Break",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        dot: "bg-amber-500",
        pulse: true,
      };
    if (isCheckedOut)
      return {
        label: "Session Complete",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        dot: "bg-blue-500",
        pulse: false,
      };
    return {
      label: "Not Checked In",
      color: "text-zinc-400",
      bg: "bg-zinc-500/5",
      border: "border-zinc-500/10",
      dot: "bg-zinc-400",
      pulse: false,
    };
  };

  const cfg = getStatusConfig();

  return (
    <div
      className="relative overflow-hidden rounded-3xl border bg-[var(--card)] shadow-sm backdrop-blur-sm"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Subtle gradient accent at top */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isWorking
            ? "bg-gradient-to-r from-emerald-400 to-teal-500"
            : isOnBreak
              ? "bg-gradient-to-r from-amber-400 to-orange-500"
              : isCheckedOut
                ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                : "bg-gradient-to-r from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700"
        }`}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--primary)]/10">
              <Timer size={18} className="text-[var(--primary)]" />
            </div>
            Time Tracker
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}
            >
              <span className="relative flex h-2 w-2">
                {cfg.pulse && (
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`}
                  />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`}
                />
              </span>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center py-4">
          <div
            className={`text-5xl font-black tabular-nums tracking-tight mb-1 transition-colors duration-300 ${
              isWorking
                ? "text-emerald-600 dark:text-emerald-400"
                : isOnBreak
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-zinc-800 dark:text-zinc-100"
            }`}
          >
            {formatTime(elapsedSeconds)}
          </div>
          <p className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
            {isWorking && "productive time"}
            {isOnBreak && "productive time (paused)"}
            {isCheckedOut && "total hours logged"}
            {isNotCheckedIn && "ready to start"}
          </p>

          {/* Break timer shown during break */}
          {isOnBreak && breakElapsed > 0 && (
            <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <Coffee size={14} className="text-amber-500" />
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                Break: {formatTime(breakElapsed)}
              </span>
            </div>
          )}
        </div>

        {/* Time Details Grid */}
        {todayRecord && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
              <LogIn size={14} className="text-emerald-500 mb-1" />
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                Check In
              </span>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                {formatTimestamp(todayRecord.check_in)}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
              <Coffee size={14} className="text-amber-500 mb-1" />
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                Break
              </span>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                {formatBreakTotal(
                  (todayRecord.total_break_seconds || 0) +
                    (isOnBreak ? breakElapsed : 0)
                )}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
              <LogOut size={14} className="text-blue-500 mb-1" />
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                Check Out
              </span>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                {formatTimestamp(todayRecord.check_out)}
              </span>
            </div>
          </div>
        )}

        {/* Weekly Hours Badge */}
        <div className="flex items-center justify-center gap-2 mb-5 px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
          <TrendingUp size={14} className="text-[var(--primary)]" />
          <span className="text-xs font-bold text-zinc-500">
            This Week:{" "}
            <span className="text-zinc-800 dark:text-zinc-200">
              {Number(weeklyHours)?.toFixed(1) || "0.0"}h
            </span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Not checked in → Show Check In */}
          {isNotCheckedIn && (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              <Play size={18} />
              Start Your Day
            </button>
          )}

          {/* Working → Show Start Break + Check Out */}
          {isWorking && (
            <>
              <button
                onClick={handleStartBreak}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-3.5 px-5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
              >
                <Pause size={16} />
                Break
              </button>
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3.5 px-5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
              >
                <Square size={16} />
                Check Out
              </button>
            </>
          )}

          {/* On break → Show End Break */}
          {isOnBreak && (
            <button
              onClick={handleEndBreak}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              <Play size={18} />
              End Break & Resume
            </button>
          )}

          {/* Checked out → Show completion */}
          {isCheckedOut && (
            <div className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
              <CheckCircle2 size={18} className="text-blue-500" />
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                Day Complete —{" "}
                {parseFloat(todayRecord.working_hours)?.toFixed(1) || "0.0"}h
                logged
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
