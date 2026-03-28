function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 animate-pulse">
      <div className="h-3 w-20 bg-slate-700 rounded mb-3" />
      <div className="h-8 w-28 bg-slate-700 rounded mb-2" />
      <div className="h-2 w-16 bg-slate-700/50 rounded" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 animate-pulse">
      <div className="h-3 w-32 bg-slate-700 rounded mb-4" />
      <div className="h-[220px] bg-slate-700/30 rounded" />
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <header className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="h-5 w-32 bg-slate-700 rounded mb-1" />
          <div className="h-3 w-48 bg-slate-700/50 rounded" />
        </div>
        <div className="h-3 w-12 bg-slate-700/50 rounded" />
      </header>
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </main>
    </div>
  );
}