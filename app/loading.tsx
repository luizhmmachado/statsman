export default function Loading() {
  return (
    <div className="container-app py-16">
      <div className="h-3 w-28 animate-pulse rounded bg-surface2" />
      <div className="mt-4 h-8 w-72 animate-pulse rounded bg-surface2" />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
