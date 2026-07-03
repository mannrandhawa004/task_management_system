"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckSquare, User } from "lucide-react";

function getTwoInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function DashboardCreatorAvatar({ item }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = item?.avatar || item?.creator_avatar;
  const initials = getTwoInitials(item?.creator_name);

  return (
    <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[var(--primary)]/15 text-[var(--primary)] font-black text-[8px] border border-[var(--primary)]/20 shadow-2xs">
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={item?.creator_name || "Owner"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default function DashboardCardList({ title, count, items, type, onInspectTask }) {
    return (
        <div className="border rounded-2xl overflow-hidden bg-[var(--card)] border-[var(--border)] shadow-sm">
            <div className="p-4 border-b flex items-center justify-between border-[var(--border)]">
                <h2 className="text-base font-semibold tracking-tight">{title}</h2>
                {count !== undefined && count > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[var(--hover)] text-[var(--muted)]">
                        Total: {count}
                    </span>
                )}
            </div>
            <div className="p-2 space-y-1">
                {items && items.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                        {items.slice(0, 5).map((item) => {
                            const isTask = type === "task";
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => isTask && onInspectTask?.(item.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-[var(--hover)] group ${isTask ? "cursor-pointer" : ""}`}
                                >
                                    <div className="flex-1 min-w-0 pr-3 space-y-1">
                                        <h3 className="font-semibold text-sm truncate text-[var(--text)]">{item.name || item.title}</h3>

                                        {isTask ? (
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`inline-flex mr-auto px-2 py-0.5 rounded-md text-[10px] font-black uppercase border tracking-wider ${item.status?.toLowerCase() === "completed"
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                    : item.status?.toLowerCase() === "in_progress"
                                                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                    }`}>
                                                    {(item.status || "todo").replace("_", " ")}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">
                                                    <span>• Priority: {item.priority || "medium"}</span>
                                                    {item.due_date && <span>• Limit: {new Date(item.due_date).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-xs truncate text-[var(--muted)] font-medium">{item.description || "No project overview description logged."}</p>
                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">
                                                    <span className="flex items-center gap-1.5 bg-[var(--hover)] px-2 py-0.5 border border-[var(--border)] rounded-md">
                                                        <DashboardCreatorAvatar item={item} /> Owner: {item.creator_name || "System"}
                                                    </span>
                                                    <span className="flex items-center gap-1 bg-[var(--hover)] px-2 py-0.5 border border-[var(--border)] rounded-md">
                                                        <CheckSquare size={11} /> Tasks Bound: {item.tasks_count || 0}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] border font-black ${item.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                        item.status === "active" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-neutral-500/10 text-[var(--muted)]"
                                                        }`}>{item.status}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {!isTask ? (
                                        <Link
                                            href={`/dashboard/projects/${item.id}`}
                                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-[var(--hover)] border border-transparent hover:border-[var(--border)] transition-all flex-shrink-0 ml-2"
                                        >
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <div className="p-1 text-[var(--muted)] flex-shrink-0">
                                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 py-12">
                        <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-wide">No data context mapped.</p>
                    </div>
                )}
            </div>
        </div>
    );
}