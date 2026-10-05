import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DoChart({ data, height = 220, marker }: { data: { label: string; value: number }[]; height?: number; marker?: string }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="doFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => [`${v} mg/L`, "Dissolved O₂"]} />
          <ReferenceLine y={5} stroke="var(--warn)" strokeDasharray="4 4" />
          {marker && <ReferenceLine x={marker} stroke="var(--accent-foreground)" label={{ value: "Treatment on", fontSize: 11, fill: "var(--muted-foreground)", position: "insideTopLeft" }} />}
          <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fill="url(#doFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
