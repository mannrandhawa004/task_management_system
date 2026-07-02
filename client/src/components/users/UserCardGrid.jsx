"use client";

import {
  Mail, Fingerprint, UserMinus, ShieldAlert, ChevronDown,
  Edit2, Building2, Users2, User, Clock, BadgeCheck, Eye
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const attendanceTone = {
  working:   { dot: "bg-emerald-500",  label: "Working",   cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  present:   { dot: "bg-blue-500",     label: "Present",   cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  late:      { dot: "bg-amber-500",    label: "Late",      cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  on_break:  { dot: "bg-yellow-400",   label: "On Break",  cls: "bg-yellow-400/10 text-yellow-500 border-yellow-400/20" },
  on_leave:  { dot: "bg-indigo-500",   label: "On Leave",  cls: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  absent:    { dot: "bg-rose-500",     label: "Absent",    cls: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  remote:    { dot: "bg-sky-500",      label: "Remote",    cls: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
};

const roleColor = {
  super_admin: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  admin:       "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20",
  hr:          "bg-pink-500/10 text-pink-500 border-pink-500/20",
  dept_head:   "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  manager:     "bg-blue-500/10 text-blue-500 border-blue-500/20",
  employee:    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

function Avatar({ user, size = 12 }) {
  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.name || "User"}
        width={48} height={48}
        className={`w-${size} h-${size} rounded-2xl object-cover border-2 border-[var(--border)]`}
      />
    );
  }
  const initials = (user.first_name?.[0] || user.name?.[0] || "?").toUpperCase();
  return (
    <div
      className={`w-${size} h-${size} rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0`}
      style={{ background: "var(--primary)" }}
    >
      {initials}
    </div>
  );
}

export default function UserCardGrid({
  users,
  loading,
  limit,
  onDeleteUser,
  onEditUser,
  onStatusChange,
  statusConfig,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(limit || 9)].map((_, idx) => (
          <div
            key={`grid-skeleton-${idx}`}
            className="h-72 rounded-2xl animate-pulse border flex flex-col gap-4 p-5"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--hover)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--hover)] rounded-lg w-3/4" />
                <div className="h-3 bg-[var(--hover)] rounded-lg w-1/2" />
              </div>
              <div className="h-5 bg-[var(--hover)] rounded-full w-16" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[var(--hover)] rounded-xl" />)}
            </div>
            <div className="h-10 bg-[var(--hover)] rounded-xl w-full mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="rounded-2xl py-20 px-6 text-center border border-dashed flex flex-col items-center justify-center">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4">
          <ShieldAlert size={28} />
        </div>
        <h3 className="font-black text-base tracking-tight text-[var(--text)]">No Employees Found</h3>
        <p className="text-xs max-w-xs mt-1.5 leading-relaxed text-[var(--muted)]">
          No employee records match your current filters. Try adjusting search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
      {users.filter(Boolean).map((user) => {
        const currentStatus = statusConfig[user.status] || {
          bg: "bg-neutral-500/10",
          text: "text-neutral-500",
          border: "border-neutral-500/20",
          label: user.status,
        };
        const roleClass = roleColor[user.role?.toLowerCase()] || "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
        const att = user.today_attendance_status
          ? attendanceTone[user.today_attendance_status] || { dot: "bg-neutral-400", label: user.today_attendance_status, cls: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20" }
          : null;

        return (
          <article
            key={`user-card-${user.id}`}
            className="rounded-2xl border flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm overflow-hidden group/card"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            {/* Top accent line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-[var(--primary)] via-[var(--primary)]/50 to-transparent" />

            <div className="p-5 flex flex-col gap-4 flex-1">
              {/* Header row — avatar + name + status */}
              <div className="flex items-start gap-3">
                <Avatar user={user} size={12} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black tracking-tight truncate text-[var(--text)]">
                      {user.name || "Unknown"}
                    </h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}>
                      {currentStatus.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail size={11} className="text-[var(--muted)] shrink-0" />
                    <span className="text-[11px] text-[var(--muted)] truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <BadgeCheck size={11} className="text-[var(--primary)] shrink-0" />
                    <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">{user.employee_id || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1 bg-[var(--hover)]/40 rounded-xl p-2.5 border border-[var(--border)]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1">
                    <Building2 size={9} /> Department
                  </span>
                  <span className="text-xs font-black text-[var(--text)] truncate">{user.department_name || "—"}</span>
                </div>
                <div className="flex flex-col gap-1 bg-[var(--hover)]/40 rounded-xl p-2.5 border border-[var(--border)]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1">
                    <Users2 size={9} /> Team
                  </span>
                  <span className="text-xs font-black text-[var(--text)] truncate">{user.team_name || "—"}</span>
                </div>
                <div className="flex flex-col gap-1 bg-[var(--hover)]/40 rounded-xl p-2.5 border border-[var(--border)]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1">
                    <User size={9} /> Manager
                  </span>
                  <span className="text-xs font-black text-[var(--text)] truncate">{user.manager_name || "—"}</span>
                </div>
                <div className="flex flex-col gap-1 bg-[var(--hover)]/40 rounded-xl p-2.5 border border-[var(--border)]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1">
                    <Clock size={9} /> Attendance
                  </span>
                  {att ? (
                    <span className={`text-[10px] font-black flex items-center gap-1 ${att.cls.split(" ").find(c => c.startsWith("text-"))}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${att.dot} ${user.today_attendance_status === "working" ? "animate-pulse" : ""}`} />
                      {att.label}
                    </span>
                  ) : (
                    <span className="text-xs font-black text-[var(--muted)]">—</span>
                  )}
                </div>
              </div>

              {/* Role badge */}
              <div className="flex items-center gap-2">
                <Fingerprint size={12} className="text-[var(--primary)] shrink-0" />
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${roleClass}`}>
                  {user.role || "Employee"}
                </span>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-5 pb-5 pt-0">
              <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
                {/* Status selector */}
                <div className="relative flex-1">
                  <select
                    value={user.status}
                    onChange={(e) => onStatusChange(user, e.target.value)}
                    className={`w-full pl-3 pr-8 py-2 text-xs font-black rounded-xl border outline-none appearance-none cursor-pointer bg-[var(--hover)]/40 transition-all focus:ring-2 focus:ring-[var(--primary)]/20 ${currentStatus.text} ${currentStatus.border}`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]" />
                </div>

                <Link
                  href={`/dashboard/users/${user.id}`}
                  className="h-9 w-9 rounded-xl border border-[var(--border)] bg-[var(--hover)]/40 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all active:scale-95"
                  title="View Profile"
                >
                  <Eye size={14} />
                </Link>

                <button
                  type="button"
                  onClick={() => onEditUser(user)}
                  className="h-9 w-9 rounded-xl border border-[var(--border)] bg-[var(--hover)]/40 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all active:scale-95 cursor-pointer"
                  title="Edit Employee"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteUser(user)}
                  className="h-9 w-9 rounded-xl border border-transparent bg-transparent flex items-center justify-center text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-95 cursor-pointer"
                  title="Delete Employee"
                >
                  <UserMinus size={14} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}