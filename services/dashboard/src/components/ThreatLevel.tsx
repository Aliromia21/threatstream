interface ThreatLevelProps {
  totalEvents: number;
  authFailures: number;
}

export function ThreatLevel({ totalEvents, authFailures }: ThreatLevelProps) {
  const ratio = totalEvents > 0 ? authFailures / totalEvents : 0;

  let level: 'low' | 'medium' | 'high' | 'critical';
  let color: string;
  let bg: string;

  if (totalEvents < 50) {
    level = 'low';
    color = 'text-green-400';
    bg = 'bg-green-400/10 border-green-400/30';
  } else if (ratio < 0.3) {
    level = 'medium';
    color = 'text-yellow-400';
    bg = 'bg-yellow-400/10 border-yellow-400/30';
  } else if (ratio < 0.6) {
    level = 'high';
    color = 'text-orange-400';
    bg = 'bg-orange-400/10 border-orange-400/30';
  } else {
    level = 'critical';
    color = 'text-red-400';
    bg = 'bg-red-400/10 border-red-400/30';
  }

  return (
    <div className={`rounded-xl border p-5 ${bg}`}>
      <p className="text-sm text-slate-400 mb-1">Threat level</p>
      <p className={`text-3xl font-bold uppercase tracking-wider ${color}`}>
        {level}
      </p>
      <p className="text-xs text-slate-500 mt-2">
        {totalEvents} events | {Math.round(ratio * 100)}% failures
      </p>
    </div>
  );
}