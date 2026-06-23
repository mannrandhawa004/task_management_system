"use client";

import { Loader2 } from "lucide-react";

export default function AppLoader({
  message = "Loading workspace...",
  fullScreen = false,
  className = "",
}) {
  return (
    <div
      className={`
        flex items-center justify-center
        ${fullScreen ? "min-h-screen w-full" : "min-h-[260px] w-full"}
        bg-[var(--bg)] text-[var(--text)]
        ${className}
      `}
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-5 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
        <p className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">
          {message}
        </p>
      </div>
    </div>
  );
}
