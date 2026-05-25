export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 h-8 w-64 rounded-lg bg-[var(--surface-card)] animate-pulse" />
      <div className="mt-2 h-5 w-80 rounded bg-[var(--surface-card)] animate-pulse" />
      <div className="mt-8 flex flex-col gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-[var(--surface-card)] animate-pulse"
          />
        ))}
        <div className="mt-4 h-48 rounded-xl bg-[var(--surface-card)] animate-pulse" />
      </div>
    </div>
  );
}
