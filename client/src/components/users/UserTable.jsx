"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, UserMinus, Edit2, Building2, Users2, User, Clock, BadgeCheck } from "lucide-react";

// ─── Dark-aware badge colour tokens ──────────────────────────────────────────

const attendanceTone = {
  working:  { dot: "bg-emerald-400 animate-pulse", label: "Working",  bg: "bg-emerald-500/10 dark:bg-emerald-400/[0.12]", text: "text-emerald-600 dark:text-emerald-300", border: "border-emerald-500/20 dark:border-emerald-400/20" },
  present:  { dot: "bg-blue-400",                  label: "Present",  bg: "bg-blue-500/10 dark:bg-blue-400/[0.12]",     text: "text-blue-600 dark:text-blue-300",     border: "border-blue-500/20 dark:border-blue-400/20"    },
  late:     { dot: "bg-amber-400",                 label: "Late",     bg: "bg-amber-500/10 dark:bg-amber-400/[0.12]",   text: "text-amber-600 dark:text-amber-300",   border: "border-amber-500/20 dark:border-amber-400/20"  },
  on_break: { dot: "bg-yellow-400",                label: "On Break", bg: "bg-yellow-500/10 dark:bg-yellow-400/[0.12]", text: "text-yellow-600 dark:text-yellow-300", border: "border-yellow-500/20 dark:border-yellow-400/20"},
  on_leave: { dot: "bg-indigo-400",                label: "On Leave", bg: "bg-indigo-500/10 dark:bg-indigo-400/[0.12]", text: "text-indigo-600 dark:text-indigo-300", border: "border-indigo-500/20 dark:border-indigo-400/20"},
  absent:   { dot: "bg-rose-400",                  label: "Absent",   bg: "bg-rose-500/10 dark:bg-rose-400/[0.12]",     text: "text-rose-600 dark:text-rose-300",     border: "border-rose-500/20 dark:border-rose-400/20"    },
  remote:   { dot: "bg-sky-400",                   label: "Remote",   bg: "bg-sky-500/10 dark:bg-sky-400/[0.12]",       text: "text-sky-600 dark:text-sky-300",       border: "border-sky-500/20 dark:border-sky-400/20"      },
};

const roleTone = {
  super_admin: { bg: "bg-violet-500/10 dark:bg-violet-400/[0.12]", text: "text-violet-600 dark:text-violet-300", border: "border-violet-500/20 dark:border-violet-400/20" },
  admin:       { bg: "bg-[var(--primary)]/10",                     text: "text-[var(--primary)]",               border: "border-[var(--primary)]/20"                      },
  hr:          { bg: "bg-pink-500/10 dark:bg-pink-400/[0.12]",     text: "text-pink-600 dark:text-pink-300",    border: "border-pink-500/20 dark:border-pink-400/20"      },
  dept_head:   { bg: "bg-cyan-500/10 dark:bg-cyan-400/[0.12]",     text: "text-cyan-600 dark:text-cyan-300",    border: "border-cyan-500/20 dark:border-cyan-400/20"      },
  manager:     { bg: "bg-blue-500/10 dark:bg-blue-400/[0.12]",     text: "text-blue-600 dark:text-blue-300",    border: "border-blue-500/20 dark:border-blue-400/20"      },
  employee:    { bg: "bg-emerald-500/10 dark:bg-emerald-400/[0.12]",text: "text-emerald-600 dark:text-emerald-300",border:"border-emerald-500/20 dark:border-emerald-400/20"},
};

const statusTone = {
  active:    { bg: "bg-emerald-500/10 dark:bg-emerald-400/[0.12]", text: "text-emerald-600 dark:text-emerald-300", border: "border-emerald-500/20 dark:border-emerald-400/20", select: "text-emerald-600 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-400/25 bg-emerald-500/10 dark:bg-emerald-400/[0.12]" },
  inactive:  { bg: "bg-amber-500/10 dark:bg-amber-400/[0.12]",     text: "text-amber-600 dark:text-amber-300",     border: "border-amber-500/20 dark:border-amber-400/20",     select: "text-amber-600 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/25 bg-amber-500/10 dark:bg-amber-400/[0.12]"   },
  suspended: { bg: "bg-rose-500/10 dark:bg-rose-400/[0.12]",       text: "text-rose-600 dark:text-rose-300",       border: "border-rose-500/20 dark:border-rose-400/20",       select: "text-rose-600 dark:text-rose-300 border-rose-500/30 dark:border-rose-400/25 bg-rose-500/10 dark:bg-rose-400/[0.12]"         },
};

const statusLabel = { active: "Active", inactive: "Inactive", suspended: "Suspended" };

function Avatar({ user }) {
  if (user.avatar) {
    return (
      <Image src={user.avatar} alt={user.name || "User"} width={40} height={40}
        className="w-10 h-10 rounded-xl object-cover border border-[var(--border)] shrink-0"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm shrink-0"
      style={{ background: "var(--primary)" }}>
      {(user.first_name?.[0] || user.name?.[0] || "?").toUpperCase()}
    </div>
  );
}

export default function UserTable({ users, loading, onDeleteUser, onEditUser, onStatusChange }) {
  if (loading) {
    return (
      <div className="rounded-3xl border overflow-hidden animate-pulse" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="h-11 bg-[var(--hover)] border-b border-[var(--border)]" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border)]/60">
            <div className="w-10 h-10 rounded-xl bg-[var(--hover)] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-[var(--hover)] rounded-lg w-36" />
              <div className="h-2.5 bg-[var(--hover)] rounded-lg w-48" />
            </div>
            <div className="h-6 bg-[var(--hover)] rounded-lg w-20" />
            <div className="h-6 bg-[var(--hover)] rounded-lg w-16" />
            <div className="h-6 bg-[var(--hover)] rounded-lg w-20" />
            <div className="flex gap-2">
              {[0,1,2].map(j => <div key={j} className="h-8 w-8 bg-[var(--hover)] rounded-xl" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="rounded-3xl border py-20 flex flex-col items-center justify-center text-center"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <p className="text-sm font-bold text-[var(--muted)]">No employees found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border shadow-sm animate-in fade-in duration-200"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.03]">
              {["Employee", "Role", "Dept / Team", "Manager", "Attendance", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted)] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => {
              const st  = statusTone[user.status]  || statusTone.active;
              const rt  = roleTone[user.role?.toLowerCase()] || { bg:"bg-neutral-500/10 dark:bg-neutral-400/10", text:"text-neutral-500 dark:text-neutral-400", border:"border-neutral-500/20" };
              const att = user.today_attendance_status
                ? (attendanceTone[user.today_attendance_status] || { dot:"bg-neutral-400", label:user.today_attendance_status, bg:"bg-neutral-500/10 dark:bg-neutral-400/10", text:"text-neutral-500 dark:text-neutral-400", border:"border-neutral-500/20" })
                : null;

              return (
                <tr
                  key={`user-row-${user.id}`}
                  className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors duration-150 ${idx !== users.length - 1 ? "border-b border-[var(--border)]/60" : ""}`}
                >
                  {/* Identity */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} />
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[var(--text)] truncate">{user.name || "—"}</p>
                        <p className="text-[11px] text-[var(--muted)] truncate">{user.email}</p>
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-[var(--primary)] uppercase tracking-widest mt-0.5">
                          <BadgeCheck size={9} /> {user.employee_id || "—"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${rt.bg} ${rt.text} ${rt.border}`}>
                      {user.role || "Employee"}
                    </span>
                  </td>

                  {/* Dept / Team */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={10} className="text-[var(--muted)] shrink-0" />
                        <span className="text-xs font-bold text-[var(--text)] truncate max-w-[120px]">{user.department_name || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users2 size={10} className="text-[var(--muted)] shrink-0" />
                        <span className="text-[11px] text-[var(--muted)] truncate max-w-[120px]">{user.team_name || "—"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Manager */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <User size={10} className="text-[var(--muted)] shrink-0" />
                      <span className="text-xs font-bold text-[var(--text)] truncate max-w-[110px]">{user.manager_name || "—"}</span>
                    </div>
                  </td>

                  {/* Attendance */}
                  <td className="px-5 py-4">
                    {att ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border whitespace-nowrap ${att.bg} ${att.text} ${att.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${att.dot}`} />
                        {att.label}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                        <Clock size={11} /> No data
                      </span>
                    )}
                  </td>

                  {/* Status selector */}
                  <td className="px-5 py-4">
                    <select
                      value={user.status}
                      onChange={(e) => onStatusChange(user, e.target.value)}
                      className={`pl-2.5 pr-6 py-1.5 text-[10px] font-black rounded-xl border outline-none cursor-pointer appearance-none transition focus:ring-2 focus:ring-[var(--primary)]/20 ${st.select}`}
                    >
                      <option value="active"    className="bg-[var(--card)] text-[var(--text)]">{statusLabel.active}</option>
                      <option value="inactive"  className="bg-[var(--card)] text-[var(--text)]">{statusLabel.inactive}</option>
                      <option value="suspended" className="bg-[var(--card)] text-[var(--text)]">{statusLabel.suspended}</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        className="h-8 w-8 rounded-xl border border-[var(--border)] bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all active:scale-95"
                        title="View"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        className="h-8 w-8 rounded-xl border border-[var(--border)] bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all active:scale-95 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user)}
                        className="h-8 w-8 rounded-xl border border-transparent flex items-center justify-center text-[var(--muted)] hover:text-rose-400 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-400/10 hover:border-rose-500/20 transition-all active:scale-95 cursor-pointer"
                        title="Delete"
                      >
                        <UserMinus size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}