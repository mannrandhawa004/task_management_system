"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, UserMinus, Edit2, Building2, Users2, User, Clock, BadgeCheck } from "lucide-react";

const attendanceTone = {
  working:  { dot: "bg-emerald-500 animate-pulse", label: "Working",  cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  present:  { dot: "bg-blue-500",                  label: "Present",  cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  late:     { dot: "bg-amber-500",                 label: "Late",     cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  on_break: { dot: "bg-yellow-400",                label: "On Break", cls: "bg-yellow-400/10 text-yellow-500 border-yellow-400/20" },
  on_leave: { dot: "bg-indigo-500",                label: "On Leave", cls: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  absent:   { dot: "bg-rose-500",                  label: "Absent",   cls: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  remote:   { dot: "bg-sky-500",                   label: "Remote",   cls: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
};

const roleColor = {
  super_admin: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  admin:       "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20",
  hr:          "bg-pink-500/10 text-pink-500 border-pink-500/20",
  dept_head:   "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  manager:     "bg-blue-500/10 text-blue-500 border-blue-500/20",
  employee:    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

function Avatar({ user }) {
  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.name || "User"}
        width={40} height={40}
        className="w-10 h-10 rounded-xl object-cover border border-[var(--border)] shrink-0"
      />
    );
  }
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm shrink-0"
      style={{ background: "var(--primary)" }}
    >
      {(user.first_name?.[0] || user.name?.[0] || "?").toUpperCase()}
    </div>
  );
}

export default function UserTable({
  users,
  loading,
  onDeleteUser,
  onEditUser,
  onStatusChange,
  statusConfig,
}) {
  if (loading) {
    return (
      <div className="rounded-3xl border overflow-hidden animate-pulse" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="h-12 bg-[var(--hover)] border-b border-[var(--border)]" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border)]/60">
            <div className="w-10 h-10 rounded-xl bg-[var(--hover)] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-[var(--hover)] rounded-lg w-36" />
              <div className="h-2.5 bg-[var(--hover)] rounded-lg w-48" />
            </div>
            <div className="h-7 bg-[var(--hover)] rounded-lg w-20" />
            <div className="h-7 bg-[var(--hover)] rounded-lg w-16" />
            <div className="h-7 bg-[var(--hover)] rounded-lg w-20" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-[var(--hover)] rounded-xl" />
              <div className="h-8 w-8 bg-[var(--hover)] rounded-xl" />
              <div className="h-8 w-8 bg-[var(--hover)] rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div
        className="rounded-3xl border py-20 flex flex-col items-center justify-center text-center"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <p className="text-sm font-bold text-[var(--muted)]">No employees found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border shadow-sm animate-in fade-in duration-200" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--hover)]/50">
              {["Employee", "Role", "Department / Team", "Manager", "Attendance", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted)] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/60">
            {users.map((user) => {
              const currentStatus = statusConfig[user.status] || { bg: "bg-neutral-500/10", text: "text-neutral-500", border: "border-neutral-500/20", label: user.status };
              const roleClass = roleColor[user.role?.toLowerCase()] || "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
              const att = user.today_attendance_status
                ? attendanceTone[user.today_attendance_status] || { dot: "bg-neutral-400", label: user.today_attendance_status, cls: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20" }
                : null;

              return (
                <tr
                  key={`user-row-${user.id}`}
                  className="hover:bg-[var(--hover)]/30 transition-colors duration-150 group"
                >
                  {/* Employee Identity */}
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
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${roleClass}`}>
                      {user.role || "Employee"}
                    </span>
                  </td>

                  {/* Department / Team */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]">
                        <Building2 size={11} className="text-[var(--muted)] shrink-0" />
                        <span className="truncate max-w-[120px]">{user.department_name || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                        <Users2 size={10} className="shrink-0" />
                        <span className="truncate max-w-[120px]">{user.team_name || "—"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Manager */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]">
                      <User size={11} className="text-[var(--muted)] shrink-0" />
                      <span className="truncate max-w-[110px]">{user.manager_name || "—"}</span>
                    </div>
                  </td>

                  {/* Attendance */}
                  <td className="px-5 py-4">
                    {att ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border whitespace-nowrap ${att.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${att.dot}`} />
                        {att.label}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                        <Clock size={11} /> No data
                      </span>
                    )}
                  </td>

                  {/* Status Selector */}
                  <td className="px-5 py-4">
                    <div className="relative">
                      <select
                        value={user.status}
                        onChange={(e) => onStatusChange(user, e.target.value)}
                        className={`pl-2.5 pr-7 py-1.5 text-[10px] font-black rounded-xl border outline-none cursor-pointer appearance-none bg-transparent transition focus:ring-2 focus:ring-[var(--primary)]/20 ${currentStatus.text} ${currentStatus.border} ${currentStatus.bg}`}
                      >
                        <option value="active" className="bg-[var(--card)] text-[var(--text)]">Active</option>
                        <option value="inactive" className="bg-[var(--card)] text-[var(--text)]">Inactive</option>
                        <option value="suspended" className="bg-[var(--card)] text-[var(--text)]">Suspended</option>
                      </select>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        className="h-8 w-8 rounded-xl border border-[var(--border)] bg-[var(--hover)]/40 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all active:scale-95"
                        title="View Profile"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        className="h-8 w-8 rounded-xl border border-[var(--border)] bg-[var(--hover)]/40 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all active:scale-95 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user)}
                        className="h-8 w-8 rounded-xl border border-transparent flex items-center justify-center text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-95 cursor-pointer"
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