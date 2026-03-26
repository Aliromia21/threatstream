import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TimelineEntry } from '../types';

interface EventTimelineProps {
  data: TimelineEntry[];
}

export function EventTimeline({ data }: EventTimelineProps) {
  const chartData = data.map((entry) => ({
    hour: new Date(entry.hour).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    events: parseInt(entry.event_count, 10),
  }));

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
      <h3 className="text-sm text-slate-400 mb-3">Events (last 24h)</h3>
      {chartData.length === 0 ? (
        <p className="text-slate-500 text-sm">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="hour"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
            />
            <Line
              type="monotone"
              dataKey="events"
              stroke="#e94560"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#e94560' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}