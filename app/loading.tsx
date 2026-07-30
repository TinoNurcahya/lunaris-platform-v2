export default function Loading() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800/80" />

      {/* Widget Filter Skeleton */}
      <div className="h-28 w-full rounded-2xl bg-slate-200 dark:bg-slate-800/60" />

      {/* Feed Cards Skeletons */}
      <div className="space-y-4 pt-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 w-full rounded-2xl bg-slate-200 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50"
          />
        ))}
      </div>
    </div>
  );
}
