export function TaskCardSkeleton({ view = "card" }) {
  if (view === "table") {
    return (
      <tr className="border-b border-[var(--border)]/60 animate-pulse">
        <td className="px-5 py-4"><div className="h-4 w-40 bg-neutral-400/20 rounded-lg" /><div className="h-2.5 w-56 bg-neutral-400/10 rounded mt-1.5" /></td>
        <td className="px-5 py-4"><div className="h-6 w-24 bg-neutral-400/20 rounded-full" /></td>
        <td className="px-5 py-4"><div className="h-6 w-20 bg-neutral-400/20 rounded-full" /></td>
        <td className="px-5 py-4"><div className="h-4 w-20 bg-neutral-400/20 rounded-lg" /></td>
        <td className="px-5 py-4"><div className="flex gap-1.5"><div className="h-6 w-16 bg-neutral-400/20 rounded-lg" /><div className="h-6 w-16 bg-neutral-400/20 rounded-lg" /></div></td>
        <td className="px-5 py-4 text-right"><div className="h-8 w-16 bg-neutral-400/20 rounded-xl ml-auto" /></td>
      </tr>
    );
  }

  return (
    <div className="border border-[var(--border)] rounded-2xl p-5 space-y-4 bg-[var(--card)] animate-pulse shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-3/5 bg-neutral-400/20 rounded-lg" />
          <div className="h-3 w-4/5 bg-neutral-400/10 rounded-lg" />
        </div>
        <div className="h-6 w-24 bg-neutral-400/20 rounded-full shrink-0" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-24 bg-neutral-400/15 rounded-lg" />
        <div className="h-6 w-28 bg-neutral-400/15 rounded-lg" />
      </div>
      <div className="pt-3 border-t border-[var(--border)]/60 flex justify-between items-center">
        <div className="flex gap-1.5">
          <div className="h-6 w-16 bg-neutral-400/20 rounded-lg" />
          <div className="h-6 w-16 bg-neutral-400/20 rounded-lg" />
        </div>
        <div className="h-6 w-6 bg-neutral-400/20 rounded-md" />
      </div>
    </div>
  );
}