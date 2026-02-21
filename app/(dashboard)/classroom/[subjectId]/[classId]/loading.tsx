export default function ActiveClassLoading() {
  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-base)]">
      <header className="shrink-0 border-b border-[var(--bg-border)] bg-[var(--bg-surface)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-[var(--bg-overlay)] animate-pulse" />
          <div className="h-3 w-16 rounded bg-[var(--bg-overlay)] animate-pulse" />
        </div>
      </header>
      <main className="flex-1 overflow-auto flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[900px] space-y-6">
          <div className="h-9 w-3/4 max-w-md rounded bg-[var(--bg-overlay)] animate-pulse" />
          <ul className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex gap-3">
                <div className="h-5 w-5 shrink-0 rounded bg-[var(--bg-overlay)] animate-pulse" />
                <div className="h-5 flex-1 max-w-sm rounded bg-[var(--bg-overlay)] animate-pulse" />
              </li>
            ))}
          </ul>
          <div className="mt-12 flex justify-center">
            <div className="h-12 w-24 rounded-lg bg-[var(--bg-overlay)] animate-pulse" />
          </div>
        </div>
      </main>
      <footer className="shrink-0 border-t border-[var(--bg-border)] bg-[var(--bg-surface)]/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="h-4 w-40 rounded bg-[var(--bg-overlay)] animate-pulse" />
        </div>
      </footer>
    </div>
  );
}
