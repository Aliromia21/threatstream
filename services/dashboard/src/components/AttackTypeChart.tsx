import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AttackType } from '../types';

interface AttackTypeChartProps {
  data: AttackType[];
}

const TYPE_COLORS: Record<string, string> = {
  auth_failure: '#e94560',
  auth_success: '#16c79a',
  port_scan: '#f5a623',
  suspicious_request: '#7c5cfc',
  rate_limit_exceeded: '#3b82f6',
  brute_force_detected: '#ef4444',
};

export function AttackTypeChart({ data }: AttackTypeChartProps) {
  const chartData = data.map((item) => ({
    type: item.type.replace(/_/g, ' '),
    count: parseInt(item.count, 10),
    fill: TYPE_COLORS[item.type] || '#64748b',
  }));

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
      <h3 className="text-sm text-slate-400 mb-3">Attack types</h3>
      {chartData.length === 0 ? (
        <p className="text-slate-500 text-sm">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical">
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="type"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <rect key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}