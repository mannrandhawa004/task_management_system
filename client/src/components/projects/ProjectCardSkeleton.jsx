"use client";

export default function ProjectCardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header card skeleton */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-7 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-28 bg-[var(--hover)] rounded-lg" />
          <div className="h-8 w-72 bg-[var(--hover)] rounded-xl" />
          <div className="h-3.5 w-full max-w-lg bg-[var(--hover)] rounded-lg" />
          <div className="h-3.5 w-2/3 bg-[var(--hover)] rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-16 w-36 bg-[var(--hover)] rounded-xl" />
          <div className="h-16 w-36 bg-[var(--hover)] rounded-xl" />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 h-28">
            <div className="h-10 w-10 bg-[var(--hover)] rounded-xl mb-3" />
            <div className="h-3 w-20 bg-[var(--hover)] rounded-lg mb-2" />
            <div className="h-7 w-16 bg-[var(--hover)] rounded-lg" />
          </div>
        ))}
      </div>

      {/* Tab skeleton */}
      <div className="h-10 w-60 bg-[var(--hover)] rounded-2xl" />

      {/* Table skeleton */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="h-14 bg-[var(--hover)] border-b border-[var(--border)]" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border)]/60">
            <div className="w-9 h-9 bg-[var(--hover)] rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-[var(--hover)] rounded-lg w-40" />
              <div className="h-2.5 bg-[var(--hover)] rounded-lg w-56" />
            </div>
            <div className="h-6 w-20 bg-[var(--hover)] rounded-xl" />
            <div className="h-6 w-24 bg-[var(--hover)] rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}