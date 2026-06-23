export function TaskCardSkeleton() {
  return (
    <div className="border rounded-2xl p-5 space-y-3 bg-white/5 animate-pulse">
      <div className="h-4 w-1/3 bg-gray-300/30 rounded" />
      <div className="h-3 w-2/3 bg-gray-300/30 rounded" />
      <div className="h-3 w-1/4 bg-gray-300/30 rounded" />
    </div>
  );
}