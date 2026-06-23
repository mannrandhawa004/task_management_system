"use client";

import Link from "next/link";
import { Eye, UserMinus, Edit2 } from "lucide-react";

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
            <div
                className="rounded-3xl border overflow-hidden animate-pulse"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
                {[...Array(6)].map((_, i) => (
                    <div
                        key={`skeleton-row-${i}`}
                        className="flex items-center justify-between px-6 py-6 border-b"
                        style={{ borderColor: "var(--border)" }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-zinc-500/10 dark:bg-zinc-500/20" />
                            <div className="space-y-2">
                                <div className="h-4 w-40 rounded bg-zinc-500/10 dark:bg-zinc-500/20" />
                                <div className="h-3 w-56 rounded bg-zinc-500/10 dark:bg-zinc-500/20" />
                            </div>
                        </div>
                        <div className="h-10 w-24 rounded-xl bg-zinc-500/10 dark:bg-zinc-500/20" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            className="overflow-hidden rounded-3xl border shadow-xl animate-in fade-in duration-200"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr style={{ background: "var(--input)" }}>
                            <th className="p-5 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>User Details</th>
                            <th className="p-5 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Platform Role</th>
                            <th className="p-5 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Operational Status</th>
                            <th className="p-5 text-center text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Actions Matrix</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                        {users?.map((user) => {
                            const currentStatus = statusConfig[user.status] || { bg: "bg-neutral-500/10", text: "text-neutral-500", border: "border-neutral-500/20", label: user.status };
                            return (
                                <tr
                                    key={`user-row-${user.id}`}
                                    className="transition-colors hover:bg-zinc-500/5"
                                >
                                    {/* USER IDENTITY CORRIDOR */}
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-bold tracking-wider shadow-xs shrink-0"
                                                style={{ background: "var(--primary)" }}
                                            >
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-sm truncate" style={{ color: "var(--text)" }}>{user.name || "Anonymous User"}</h3>
                                                <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{user.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* ACCOUNT ROLE POOL */}
                                    <td className="p-5">
                                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/10 uppercase tracking-wide">
                                            {user.role || "Standard"}
                                        </span>
                                    </td>

                                    {/* ACTIVE OPERATIONAL STATUS SELECTOR */}
                                    <td className="p-5">
                                        <select
                                            value={user.status}
                                            onChange={(e) => onStatusChange(user, e.target.value)}
                                            className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border outline-none cursor-pointer bg-[var(--input)] transition focus:ring-2 focus:ring-[var(--primary)]/20 ${currentStatus.text} ${currentStatus.border}`}
                                        >
                                            <option value="active" className="text-[var(--text)] bg-[var(--card)]">Active State</option>
                                            <option value="inactive" className="text-[var(--text)] bg-[var(--card)]">Pending Hold</option>
                                            <option value="suspended" className="text-[var(--text)] bg-[var(--card)]">Suspended Vault</option>
                                        </select>
                                    </td>

                                    {/* SYSTEMIC MUTATION CONTROLS */}
                                    <td className="p-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/dashboard/users/${user.id}`}
                                                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border transition hover:bg-neutral-500/10 active:scale-95"
                                                style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--primary)" }}
                                                title="Inspect Node Audit View"
                                            >
                                                <Eye size={16} />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => onEditUser(user)}
                                                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border transition hover:bg-neutral-500/10 active:scale-95 cursor-pointer"
                                                style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--primary)" }}
                                                title="Edit Employee settings"
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDeleteUser(user)}
                                                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-transparent text-neutral-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/10 transition active:scale-95 cursor-pointer"
                                                title="Purge Identity Matrix Record"
                                            >
                                                <UserMinus size={16} />
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