import { RecentEvent } from '../types';

interface RecentEventsProps {
  events: RecentEvent[];
}

const TYPE_BADGE: Record<string, string> = {
  auth_failure: 'bg-red-400/10 text-red-400 border-red-400/30',
  auth_success: 'bg-green-400/10 text-green-400 border-green-400/30',
  port_scan: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  suspicious_request: 'bg-purple-400/10 text-purple-400 border-purple-400/30',
  rate_limit_exceeded: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
};

export function RecentEvents({ events }: RecentEventsProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
      <h3 className="text-sm text-slate-400 mb-3">Recent events</h3>
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {events.length === 0 && (
          <p className="text-slate-500 text-sm">No data yet</p>
        )}
        {events.map((event) => (
          <div
            key={event.event_id}
            className="flex items-center justify-between py-1.5 text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded border font-mono ${TYPE_BADGE[event.type] || 'bg-slate-700 text-slate-300'}`}
              >
                {event.type}
              </span>
              <span className="font-mono text-slate-400">{event.source_ip}</span>
            </div>
            <span className="text-xs text-slate-500">
              {new Date(event.timestamp).toLocaleTimeString('de-DE')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}