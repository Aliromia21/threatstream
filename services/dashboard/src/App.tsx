import { useStats } from './hooks/useStats';
import { ThreatLevel } from './components/ThreatLevel';
import { StatCard } from './components/StatCard';
import { TopAttackers } from './components/TopAttackers';
import { EventTimeline } from './components/EventTimeline';
import { AttackTypeChart } from './components/AttackTypeChart';
import { RecentEvents } from './components/RecentEvents';
import { ConnectionBanner } from './components/ConnectionBanner';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { LiveIndicator } from './components/LiveIndicator';

function App() {
  const { today, topAttackers, attackTypes, timeline, recentEvents, isConnected, isLoading } = useStats();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <ConnectionBanner isConnected={isConnected} />

      <header className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">ThreatStream</h1>
          <p className="text-xs text-slate-500">Real-time threat intelligence</p>
        </div>
        <LiveIndicator isConnected={isConnected} />
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ThreatLevel
            totalEvents={today?.total_events || 0}
            authFailures={today?.auth_failures || 0}
          />
          <StatCard
            title="Total events"
            value={today?.total_events?.toLocaleString() || '0'}
            subtitle="Today"
          />
          <StatCard
            title="Auth failures"
            value={today?.auth_failures?.toLocaleString() || '0'}
            subtitle="Today"
            color="text-red-400"
          />
          <StatCard
            title="Port scans"
            value={today?.port_scans?.toLocaleString() || '0'}
            subtitle="Today"
            color="text-yellow-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EventTimeline data={timeline} />
          <AttackTypeChart data={attackTypes} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopAttackers attackers={topAttackers} />
          <RecentEvents events={recentEvents} />
        </div>
      </main>

      <footer className="border-t border-slate-700/50 px-6 py-3 text-center">
        <p className="text-xs text-slate-600">
          ThreatStream — Real-time threat intelligence pipeline
        </p>
      </footer>
    </div>
  );
}

export default App;