"use client";

import { Mail, Fingerprint, UserMinus, ShieldAlert, ChevronDown, Edit2 } from "lucide-react";

export default function UserCardGrid({
    users,
    loading,
    limit,
    onDeleteUser,
    onEditUser,
    onStatusChange,
    statusConfig,
}) {
    // --- SKELETON LOADING STATE ---
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(limit)].map((_, idx) => (
                    <div
                        key={`grid-skeleton-${idx}`}
                        className="h-56 rounded-2xl animate-pulse border flex flex-col justify-between p-6"
                        style={{ background: "var(--card)", borderColor: "var(--border)" }}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2 w-2/3">
                                    <div className="h-4 bg-black/10 dark:bg-white/10 rounded-md w-3/4" />
                                    <div className="h-3 bg-black/5 dark:bg-white/5 rounded-sm w-1/2" />
                                </div>
                                <div className="h-5 bg-black/10 dark:bg-white/10 rounded-full w-16" />
                            </div>
                            <div className="h-7 bg-black/5 dark:bg-white/5 rounded-lg w-24" />
                        </div>
                        <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl w-full" />
                    </div>
                ))}
            </div>
        );
    }

    // --- EMPTY STATE ---
    if (!users || users.length === 0) {
        return (
            <div
                className="rounded-2xl py-16 px-6 text-center border border-dashed flex flex-col items-center justify-center max-w-md mx-auto backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-300"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
                <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4 shadow-xs">
                    <ShieldAlert size={24} />
                </div>
                <h3 className="font-bold text-sm tracking-tight" style={{ color: "var(--text)" }}>
                    No Active Directory Records
                </h3>
                <p className="text-xs max-w-xs mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>
                    The target security register index contains zero system profile identities corresponding to this specific query filter scope.
                </p>
            </div>
        );
    }

    // --- DATA PRESENT STATE ---
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {users.filter(Boolean).map((user) => {
                const currentStatus = statusConfig[user.status] || {
                    bg: "bg-neutral-500/10",
                    text: "text-neutral-500",
                    border: "border-neutral-500/20",
                    label: user.status,
                };

                return (
                    <article
                        key={`user-card-${user.id}`}
                        className="rounded-2xl p-6 border flex flex-col justify-between transition-all duration-300 hover:border-neutral-400/30 hover:-translate-y-1 transform-gpu shadow-xs hover:shadow-lg group/card"
                        style={{ background: "var(--card)", borderColor: "var(--border)" }}
                    >
                        {/* Header / Identity Segment */}
                        <div className="space-y-4 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 space-y-1">
                                    <h3 className="text-sm font-bold tracking-tight truncate" style={{ color: "var(--text)" }}>
                                        {user.name || "Anonymous Operative"}
                                    </h3>
                                    <p className="text-xs font-medium flex items-center gap-1.5 transition-colors hover:text-[var(--primary)] truncate" style={{ color: "var(--muted)" }}>
                                        <Mail size={13} className="shrink-0 opacity-60" />
                                        {user.email}
                                    </p>
                                </div>

                                {/* Dynamic Status Pill */}
                                <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border transition-all duration-200 ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}>
                                    {currentStatus.label}
                                </span>
                            </div>

                            {/* Identity Parameters Container */}
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border text-[11px] font-medium transition hover:bg-black/[0.06] dark:hover:bg-white/[0.06]" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                                    <Fingerprint size={12} className="opacity-80 text-[var(--primary)]" />
                                    Role: <span className="font-bold uppercase tracking-wide text-xs">{user.role || "Standard"}</span>
                                </span>
                            </div>
                        </div>

                        {/* Actions / Control Panel Segment */}
                        <div className="mt-6 pt-4 border-t flex items-center justify-between gap-4" style={{ borderColor: "var(--border)" }}>
                            <div className="relative flex-1 group">
                                <select
                                    value={user.status}
                                    onChange={(e) => onStatusChange(user, e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border outline-none appearance-none cursor-pointer bg-[var(--input)] text-[var(--text)] border-[var(--border)] transition-all focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-neutral-400"
                                >
                                    <option value="active">Active State</option>
                                    <option value="inactive">Pending Hold</option>
                                    <option value="suspended">Suspended Vault</option>
                                </select>
                                {/* Replaced standard text chevron with modern lucide-react icon */}
                                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
                                    <ChevronDown size={14} />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => onEditUser(user)}
                                className="p-2 rounded-xl text-[var(--primary)] hover:bg-[var(--primary)]/5 border border-transparent hover:border-[var(--primary)]/10 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                                title="Edit Employee settings"
                            >
                                <Edit2 size={15} />
                            </button>

                            <button
                                type="button"
                                onClick={() => onDeleteUser(user)}
                                className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                                title="Purge Identity Records"
                            >
                                <UserMinus size={15} />
                            </button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}