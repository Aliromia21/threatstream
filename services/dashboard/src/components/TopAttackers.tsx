import { TopAttacker } from '../types';

interface TopAttackersProps {
  attackers: TopAttacker[];
}

export function TopAttackers({ attackers }: TopAttackersProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
      <h3 className="text-sm text-slate-400 mb-3">Top attackers</h3>
      <div className="space-y-2">
        {attackers.length === 0 && (
          <p className="text-slate-500 text-sm">No data yet</p>
        )}
        {attackers.map((attacker, i) => (
          <div
            key={attacker.source_ip}
            className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 w-5">{i + 1}</span>
              <span className="font-mono text-sm text-slate-200">{attacker.source_ip}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{attacker.last_event_type}</span>
              <span className="text-sm font-bold text-red-400">{attacker.event_count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}