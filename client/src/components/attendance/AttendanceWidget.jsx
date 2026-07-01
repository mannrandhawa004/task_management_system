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
  FileText,
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
      const tick = () => {
        const checkInTime = new Date(todayRecord.check_in).getTime();
        const now = Date.now();
        const totalBreakSecs = todayRecord.total_break_seconds || 0;
        const elapsed = Math.floor((now - checkInTime) / 1000) - totalBreakSecs;
        setElapsedSeconds(elapsed > 0 ? elapsed : 0);
      };
      tick();
      interval = setInterval(tick, 1000);
    } else if (todayRecord && todayRecord.status === "on_break") {
      const checkInTime = new Date(todayRecord.check_in).getTime();
      const breakStartTime = new Date(todayRecord.break_start).getTime();
      const totalBreakSecs = todayRecord.total_break_seconds || 0;
      const frozenElapsed =
        Math.floor((breakStartTime - checkInTime) / 1000) - totalBreakSecs;
      setElapsedSeconds(frozenElapsed > 0 ? frozenElapsed : 0);

      const tickBreak = () => {
        const breakSecs = Math.floor((Date.now() - breakStartTime) / 1000);
        setBreakElapsed(breakSecs > 0 ? breakSecs : 0);
      };
      tickBreak();
      interval = setInterval(tickBreak, 1000);
    } else if (todayRecord && todayRecord.check_out) {
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

  const status = todayRecord?.status;
  const isWorking = status === "working";
  const isOnBreak = status === "on_break";
  const isCheckedOut = todayRecord?.check_out != null;
  const isNotCheckedIn = !todayRecord;

  // Status badge config — purely semantic, theme-agnostic colors
  const getStatusConfig = () => {
    if (isWorking)
      return { label: "Working", colorClass: "text-emerald-500", bgClass: "bg-emerald-500/15 border-emerald-500/25", dot: "bg-emerald-500", pulse: true };
    if (isOnBreak)
      return { label: "On Break", colorClass: "text-amber-500", bgClass: "bg-amber-500/15 border-amber-500/25", dot: "bg-amber-500", pulse: true };
    if (isCheckedOut)
      return { label: "Session Complete", colorClass: "text-[var(--primary)]", bgClass: "bg-[var(--primary)]/10 border-[var(--primary)]/20", dot: "bg-[var(--primary)]", pulse: false };
    return { label: "Not Checked In", colorClass: "text-[var(--muted)]", bgClass: "bg-[var(--hover)] border-[var(--border)]", dot: "bg-[var(--muted)]", pulse: false };
  };

  const cfg = getStatusConfig();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] shadow-lg backdrop-blur-md bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--primary)]/5">
      {/* Top accent bar that matches the primary color */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--primary)] via-[var(--primary)]/60 to-transparent" />

      {/* Background texture pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 20% 80%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--primary) 0%, transparent 50%)" }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/15">
              <Timer size={16} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Time Tracker</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bgClass} ${cfg.colorClass}`}>
            <span className="relative flex h-2 w-2">
              {cfg.pulse && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`} />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
            </span>
            {cfg.label}
          </div>
        </div>

        {/* BIG TIMER DISPLAY — matches reference card design */}
        <div className="flex flex-col items-center py-6">
          <div
            className="text-6xl font-black tabular-nums tracking-tight leading-none text-[var(--text)] mb-2"
          >
            {formatTime(elapsedSeconds)}
          </div>
          <p className="text-[10px] font-black text-[var(--muted)] tracking-widest uppercase mt-1">
            {isWorking && "Active Session"}
            {isOnBreak && "On Break — Paused"}
            {isCheckedOut && `${parseFloat(todayRecord.working_hours)?.toFixed(1) || "0.0"}h Logged`}
            {isNotCheckedIn && "Ready to Start"}
          </p>

          {/* Break timer during break */}
          {isOnBreak && breakElapsed > 0 && (
            <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Coffee size={13} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-500 tabular-nums">
                Break: {formatTime(breakElapsed)}
              </span>
            </div>
          )}

          {/* Active session — display a project name placeholder if working */}
          {(isWorking || isOnBreak) && todayRecord?.check_in && (
            <p className="text-xs font-medium text-[var(--muted)] mt-2">
              Session started at {formatTimestamp(todayRecord.check_in)}
            </p>
          )}
        </div>

        {/* Weekly hours strip */}
        <div className="flex items-center justify-center gap-2 mb-5 px-4 py-2.5 rounded-2xl bg-[var(--hover)]/50 border border-[var(--border)]">
          <TrendingUp size={13} className="text-[var(--primary)]" />
          <span className="text-xs font-bold text-[var(--muted)]">
            This Week:{" "}
            <span className="text-[var(--text)] font-black">
              {Number(weeklyHours)?.toFixed(1) || "0.0"}h
            </span>
          </span>
        </div>

        {/* Check-in/out timestamp strip */}
        {todayRecord && (
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <div className="flex flex-col items-center p-3 rounded-2xl bg-[var(--hover)]/50 border border-[var(--border)]">
              <LogIn size={13} className="text-[var(--primary)] mb-1" />
              <span className="text-[9px] font-bold uppercase text-[var(--muted)] tracking-wider">In</span>
              <span className="text-sm font-black text-[var(--text)]">
                {formatTimestamp(todayRecord.check_in)}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-[var(--hover)]/50 border border-[var(--border)]">
              <Coffee size={13} className="text-amber-500 mb-1" />
              <span className="text-[9px] font-bold uppercase text-[var(--muted)] tracking-wider">Break</span>
              <span className="text-sm font-black text-[var(--text)]">
                {formatBreakTotal(
                  (todayRecord.total_break_seconds || 0) +
                    (isOnBreak ? breakElapsed : 0)
                )}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-[var(--hover)]/50 border border-[var(--border)]">
              <LogOut size={13} className="text-[var(--primary)] mb-1" />
              <span className="text-[9px] font-bold uppercase text-[var(--muted)] tracking-wider">Out</span>
              <span className="text-sm font-black text-[var(--text)]">
                {formatTimestamp(todayRecord.check_out)}
              </span>
            </div>
          </div>
        )}

        {/* Logged indicator (like reference: "✓ Logged — X logs saved") */}
        {todayRecord && (
          <div className="flex items-center justify-end gap-1.5 mb-4 text-xs font-bold text-[var(--primary)]">
            <CheckCircle2 size={13} />
            <div className="flex flex-col items-end leading-tight">
              <span>Logged</span>
              <span className="text-[9px] font-medium text-[var(--muted)]">
                {isCheckedOut ? "Session complete" : "In progress"}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons — rounded square icon buttons like reference */}
        <div className="flex gap-3">
          {isNotCheckedIn && (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3.5 px-6 rounded-2xl transition-all hover:-translate-y-[1px] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              <Play size={18} />
              Start Your Day
            </button>
          )}

          {isWorking && (
            <>
              <button
                onClick={handleStartBreak}
                disabled={loading}
                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[var(--hover)] border border-[var(--border)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 text-[var(--text)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Take a break"
              >
                <Pause size={18} />
              </button>
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[var(--hover)] border border-[var(--border)] hover:bg-rose-500/10 hover:border-rose-500/30 text-[var(--text)] hover:text-rose-500 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Check out"
              >
                <Square size={18} />
              </button>
              <div className="flex-1 flex items-center justify-end gap-1.5 text-xs font-bold text-[var(--primary)]">
                <CheckCircle2 size={13} />
                <div className="flex flex-col items-end leading-tight">
                  <span>Logged</span>
                  <span className="text-[9px] font-medium text-[var(--muted)]">0 logs saved</span>
                </div>
              </div>
            </>
          )}

          {isOnBreak && (
            <button
              onClick={handleEndBreak}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3.5 px-6 rounded-2xl transition-all hover:-translate-y-[1px] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              <Play size={18} />
              End Break & Resume
            </button>
          )}

          {isCheckedOut && (
            <div className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <CheckCircle2 size={18} className="text-[var(--primary)]" />
              <span className="text-sm font-bold text-[var(--primary)]">
                Day Complete — {parseFloat(todayRecord.working_hours)?.toFixed(1) || "0.0"}h logged
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
