export default function SubjectDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="h-8 w-64 rounded-md bg-[var(--bg-overlay)] animate-pulse mb-8" />
      <div className="relative border-l-2 border-[var(--bg-border)] ml-4 pl-8 space-y-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-6 animate-pulse"
          >
            <div className="h-4 bg-[var(--bg-overlay)] rounded w-20 mb-3" />
            <div className="h-6 bg-[var(--bg-overlay)] rounded w-3/4 mb-4" />
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-[var(--bg-overlay)] rounded w-full" />
              <div className="h-3 bg-[var(--bg-overlay)] rounded w-5/6" />
              <div className="h-3 bg-[var(--bg-overlay)] rounded w-4/6" />
            </div>
            <div className="h-10 bg-[var(--bg-overlay)] rounded w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
