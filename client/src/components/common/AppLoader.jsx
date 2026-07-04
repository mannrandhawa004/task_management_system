"use client";

import { Loader2 } from "lucide-react";

export default function AppLoader({
  message = "Loading...",
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
      
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
        <p className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">
          {message}
        </p>
     
    </div>
  );
}
