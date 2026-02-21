import { Skeleton } from '@/components/ui/skeleton';

export default function ClassroomLoading() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <Skeleton className="h-8 w-48 mb-8 rounded-md bg-[var(--bg-overlay)]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] animate-pulse"
          >
            <div className="h-5 bg-[var(--bg-overlay)] rounded w-2/3 mb-3" />
            <div className="h-3 bg-[var(--bg-overlay)] rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
