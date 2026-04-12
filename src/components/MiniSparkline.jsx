import { LineChart, Line, ResponsiveContainer, YAxis, CartesianGrid, ReferenceLine } from 'recharts';

function formatValue(v, decimals = 0) {
  if (v == null) return '--';
  return decimals > 0 ? Number(v).toFixed(decimals) : String(Math.round(v));
}

export default function MiniSparkline({ label, data, unit, color, decimals = 0 }) {
  const current = data.length ? data[data.length - 1] : null;
  const max = data.length ? Math.max(...data) : 0;
  const pad = max * 0.15 || 1;
  const domainMax = Math.ceil(max + pad);
  const avg = data.length ? data.reduce((a, b) => a + b, 0) / data.length : 0;

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline justify-between">
        <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-400">{label}</div>
        {current !== null && (
          <div className="text-[10px] font-semibold tabular-nums" style={{ color }}>
            {formatValue(current, decimals)} {unit}
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={56}>
        <LineChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 2, bottom: 2, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <YAxis
            domain={[0, domainMax]}
            width={28}
            tick={{ fontSize: 9, fill: '#52525b', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            tickCount={3}
          />
          <ReferenceLine y={Math.round(avg)} stroke="#d4d4d8" strokeDasharray="4 2" />
          <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1.5} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      {data.length > 1 && (
        <div className="flex justify-between text-[8px] tabular-nums text-zinc-400">
          <span>{Math.round(data.length / 2)}s ago</span>
          <span>now</span>
        </div>
      )}
    </div>
  );
}
