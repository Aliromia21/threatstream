interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
}

export function StatCard({ title, value, subtitle, color = 'text-white' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
      <p className="text-sm text-slate-400 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}