"use client";

import {
  Mail, Fingerprint, UserMinus, ShieldAlert, ChevronDown,
  Edit2, Building2, Users2, User, Clock, BadgeCheck, Eye
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─── Semantic badge helpers ───────────────────────────────────────────────────
// Use CSS-var colours so they automatically flip between light & dark themes.
// We rely on Tailwind's dark: prefix for every badge so the background,
// text, and border all shift appropriately.

const attendanceTone = {
  working:  {
    dot: "bg-emerald-400 dark:bg-emerald-400 animate-pulse",
    label: "Working",
    bg:   "bg-emerald-500/10 dark:bg-emerald-400/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border:"border-emerald-500/25 dark:border-emerald-400/25",
  },
  present: {
    dot: "bg-blue-400",
    label: "Present",
    bg:   "bg-blue-500/10 dark:bg-blue-400/10",
    text: "text-blue-600 dark:text-blue-400",
    border:"border-blue-500/25 dark:border-blue-400/25",
  },
  late: {
    dot: "bg-amber-400",
    label: "Late",
    bg:   "bg-amber-500/10 dark:bg-amber-400/10",
    text: "text-amber-600 dark:text-amber-400",
    border:"border-amber-500/25 dark:border-amber-400/25",
  },
  on_break: {
    dot: "bg-yellow-400",
    label: "On Break",
    bg:   "bg-yellow-500/10 dark:bg-yellow-400/10",
    text: "text-yellow-600 dark:text-yellow-300",
    border:"border-yellow-500/25 dark:border-yellow-400/25",
  },
  on_leave: {
    dot: "bg-indigo-400",
    label: "On Leave",
    bg:   "bg-indigo-500/10 dark:bg-indigo-400/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border:"border-indigo-500/25 dark:border-indigo-400/25",
  },
  absent: {
    dot: "bg-rose-400",
    label: "Absent",
    bg:   "bg-rose-500/10 dark:bg-rose-400/10",
    text: "text-rose-600 dark:text-rose-400",
    border:"border-rose-500/25 dark:border-rose-400/25",
  },
  remote: {
    dot: "bg-sky-400",
    label: "Remote",
    bg:   "bg-sky-500/10 dark:bg-sky-400/10",
    text: "text-sky-600 dark:text-sky-400",
    border:"border-sky-500/25 dark:border-sky-400/25",
  },
};

const roleTone = {
  super_admin: {
    bg: "bg-violet-500/10 dark:bg-violet-400/[0.12]",
    text: "text-violet-600 dark:text-violet-300",
    border: "border-violet-500/20 dark:border-violet-400/20",
  },
  admin: {
    bg: "bg-[var(--primary)]/10",
    text: "text-[var(--primary)]",
    border: "border-[var(--primary)]/20",
  },
  hr: {
    bg: "bg-pink-500/10 dark:bg-pink-400/[0.12]",
    text: "text-pink-600 dark:text-pink-300",
    border: "border-pink-500/20 dark:border-pink-400/20",
  },
  dept_head: {
    bg: "bg-cyan-500/10 dark:bg-cyan-400/[0.12]",
    text: "text-cyan-600 dark:text-cyan-300",
    border: "border-cyan-500/20 dark:border-cyan-400/20",
  },
  manager: {
    bg: "bg-blue-500/10 dark:bg-blue-400/[0.12]",
    text: "text-blue-600 dark:text-blue-300",
    border: "border-blue-500/20 dark:border-blue-400/20",
  },
  employee: {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/[0.12]",
    text: "text-emerald-600 dark:text-emerald-300",
    border: "border-emerald-500/20 dark:border-emerald-400/20",
  },
};

// Maps statusConfig keys → dark-aware overrides
const statusTone = {
  active: {
    bg:   "bg-emerald-500/10 dark:bg-emerald-400/[0.12]",
    text: "text-emerald-600 dark:text-emerald-300",
    border:"border-emerald-500/20 dark:border-emerald-400/20",
  },
  inactive: {
    bg:   "bg-amber-500/10 dark:bg-amber-400/[0.12]",
    text: "text-amber-600 dark:text-amber-300",
    border:"border-amber-500/20 dark:border-amber-400/20",
  },
  suspended: {
    bg:   "bg-rose-500/10 dark:bg-rose-400/[0.12]",
    text: "text-rose-600 dark:text-rose-300",
    border:"border-rose-500/20 dark:border-rose-400/20",
  },
};

const statusLabel = { active: "Active", inactive: "Inactive", suspended: "Suspended" };

function Avatar({ user }) {
  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.name || "User"}
        width={44} height={44}
        className="w-11 h-11 rounded-xl object-cover border border-[var(--border)] shrink-0"
      />
    );
  }
  const initials = (user.first_name?.[0] || user.name?.[0] || "?").toUpperCase();
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm shrink-0"
      style={{ background: "var(--primary)" }}
    >
      {initials}
    </div>
  );
}

function Badge({ bg, text, border, children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${bg} ${text} ${border}`}>
      {children}
    </span>
  );
}

function InfoCell({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-2.5 border border-black/[0.06] dark:border-white/[0.07]">
      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">
        <Icon size={9} />
        {label}
      </span>
      <span className="text-xs font-black text-[var(--text)] truncate">{value || "—"}</span>
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
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[var(--hover)]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-[var(--hover)] rounded-lg w-3/4" />
                <div className="h-2.5 bg-[var(--hover)] rounded-lg w-1/2" />
              </div>
              <div className="h-5 bg-[var(--hover)] rounded-full w-14" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-11 bg-[var(--hover)] rounded-xl" />)}
            </div>
            <div className="h-9 bg-[var(--hover)] rounded-xl w-full mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="rounded-2xl py-20 px-6 text-center border border-dashed border-[var(--border)] flex flex-col items-center justify-center">
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 mb-4">
          <ShieldAlert size={28} />
        </div>
        <h3 className="font-black text-base tracking-tight text-[var(--text)]">No Employees Found</h3>
        <p className="text-xs max-w-xs mt-1.5 leading-relaxed text-[var(--muted)]">
          No employee records match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
      {users.filter(Boolean).map((user) => {
        const st = statusTone[user.status] || statusTone.active;
        const rt = roleTone[user.role?.toLowerCase()] || {
          bg: "bg-neutral-500/10 dark:bg-neutral-400/10",
          text: "text-neutral-500 dark:text-neutral-400",
          border: "border-neutral-500/20",
        };
        const att = user.today_attendance_status
          ? (attendanceTone[user.today_attendance_status] || {
              dot: "bg-neutral-400",
              label: user.today_attendance_status,
              bg: "bg-neutral-500/10 dark:bg-neutral-400/10",
              text: "text-neutral-500 dark:text-neutral-400",
              border: "border-neutral-500/20",
            })
          : null;

        return (
          <article
            key={`user-card-${user.id}`}
            className="rounded-2xl border border-[var(--border)] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm overflow-hidden bg-[var(--card)] group/card"
          >
            {/* Top accent stripe */}
            <div className="h-[3px] w-full bg-gradient-to-r from-[var(--primary)] via-[var(--primary)]/40 to-transparent" />

            <div className="p-5 flex flex-col gap-4 flex-1">
              {/* ── Identity row ── */}
              <div className="flex items-start gap-3">
                <Avatar user={user} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-black tracking-tight truncate text-[var(--text)]">
                        {user.name || "Unknown"}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail size={10} className="text-[var(--muted)] shrink-0" />
                        <span className="text-[11px] text-[var(--muted)] truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <BadgeCheck size={10} className="text-[var(--primary)] shrink-0" />
                        <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider">
                          {user.employee_id || "—"}
                        </span>
                      </div>
                    </div>
                    {/* Status pill */}
                    <Badge bg={st.bg} text={st.text} border={st.border}>
                      {statusLabel[user.status] || user.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* ── Info grid (dept / team / manager / attendance) ── */}
              <div className="grid grid-cols-2 gap-2">
                <InfoCell icon={Building2} label="Department" value={user.department_name} />
                <InfoCell icon={Users2}   label="Team"        value={user.team_name} />
                <InfoCell icon={User}     label="Manager"     value={user.manager_name} />
                <div className="flex flex-col gap-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-2.5 border border-black/[0.06] dark:border-white/[0.07]">
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">
                    <Clock size={9} /> Attendance
                  </span>
                  {att ? (
                    <span className={`flex items-center gap-1.5 text-[11px] font-black ${att.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${att.dot}`} />
                      {att.label}
                    </span>
                  ) : (
                    <span className="text-[11px] font-black text-[var(--muted)]">—</span>
                  )}
                </div>
              </div>

              {/* ── Role badge ── */}
              <div className="flex items-center gap-2">
                <Fingerprint size={12} className="text-[var(--primary)] shrink-0" />
                <Badge bg={rt.bg} text={rt.text} border={rt.border}>
                  {user.role || "Employee"}
                </Badge>
              </div>
            </div>

            {/* ── Footer actions ── */}
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
                {/* Status selector */}
                <div className="relative flex-1">
                  <select
                    value={user.status}
                    onChange={(e) => onStatusChange(user, e.target.value)}
                    className={`w-full pl-3 pr-7 py-2 text-[10px] font-black rounded-xl border outline-none appearance-none cursor-pointer transition-all focus:ring-2 focus:ring-[var(--primary)]/20
                      bg-black/[0.03] dark:bg-white/[0.04]
                      border-black/[0.08] dark:border-white/[0.08]
                      ${st.text}`}
                  >
                    <option value="active"    className="bg-[var(--card)] text-[var(--text)]">Active</option>
                    <option value="inactive"  className="bg-[var(--card)] text-[var(--text)]">Inactive</option>
                    <option value="suspended" className="bg-[var(--card)] text-[var(--text)]">Suspended</option>
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]" />
                </div>

                <Link
                  href={`/dashboard/users/${user.id}`}
                  className="h-9 w-9 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all active:scale-95"
                  title="View Profile"
                >
                  <Eye size={14} />
                </Link>

                <button
                  type="button"
                  onClick={() => onEditUser(user)}
                  className="h-9 w-9 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all active:scale-95 cursor-pointer"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteUser(user)}
                  className="h-9 w-9 rounded-xl border border-transparent flex items-center justify-center text-[var(--muted)] hover:text-rose-400 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-400/10 hover:border-rose-500/20 transition-all active:scale-95 cursor-pointer"
                  title="Delete"
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