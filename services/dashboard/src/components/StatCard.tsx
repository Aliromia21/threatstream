import { useState, useEffect, useRef } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
}

export function StatCard({ title, value, subtitle, color = 'text-white' }: StatCardProps) {
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 600);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div
      className={`rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition-colors duration-600 ${flash ? 'bg-slate-700/50' : ''}`}
    >
      <p className="text-sm text-slate-400 mb-1">{title}</p>
      <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}