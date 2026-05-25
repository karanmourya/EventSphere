export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="h-8 w-48 rounded-lg bg-[var(--surface-card)] animate-pulse" />
        <div className="mt-2 h-4 w-64 rounded bg-[var(--surface-card)] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-[var(--surface-card)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
