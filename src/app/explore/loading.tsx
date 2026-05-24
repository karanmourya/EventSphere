export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-9 w-64 rounded-lg bg-muted animate-pulse" />
        <div className="mt-2 h-5 w-48 rounded bg-muted animate-pulse" />
      </div>
      <div className="mb-8 h-12 rounded-xl bg-muted animate-pulse" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
