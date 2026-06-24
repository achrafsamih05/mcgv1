"use client";

/**
 * Dependency-free SVG charts used as placeholders for Recharts/Chart.js.
 * Swap these for a charting library later without touching the section layout.
 */

const NAVY = "#0F172A";
const ACCENT = "#F97316";

/* ----------------------------- Line Chart ----------------------------- */

export function LineChart({
  series,
  height = 220,
}: {
  series: { label: string; color: string; points: number[] }[];
  height?: number;
}) {
  const width = 520;
  const pad = 28;
  const all = series.flatMap((s) => s.points);
  const max = Math.max(...all, 1);
  const count = series[0]?.points.length ?? 1;

  const toXY = (v: number, i: number) => {
    const x = pad + (i / (count - 1)) * (width - pad * 2);
    const y = height - pad - (v / max) * (height - pad * 2);
    return [x, y] as const;
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      role="img"
      aria-label="Line chart"
    >
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={width - pad}
          y1={height - pad - g * (height - pad * 2)}
          y2={height - pad - g * (height - pad * 2)}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      ))}
      {series.map((s) => {
        const d = s.points
          .map((v, i) => {
            const [x, y] = toXY(v, i);
            return `${i === 0 ? "M" : "L"}${x},${y}`;
          })
          .join(" ");
        return (
          <g key={s.label}>
            <path d={d} fill="none" stroke={s.color} strokeWidth={2.5} />
            {s.points.map((v, i) => {
              const [x, y] = toXY(v, i);
              return <circle key={i} cx={x} cy={y} r={3} fill={s.color} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* ----------------------------- Area/Bar Chart ----------------------------- */

export function BarChart({
  data,
  height = 220,
}: {
  data: { label: string; value: number; secondary?: number }[];
  height?: number;
}) {
  const width = 520;
  const pad = 28;
  const max = Math.max(...data.map((d) => Math.max(d.value, d.secondary ?? 0)), 1);
  const slot = (width - pad * 2) / data.length;
  const barW = slot * 0.32;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      role="img"
      aria-label="Bar chart"
    >
      {data.map((d, i) => {
        const x = pad + i * slot + slot / 2;
        const h1 = (d.value / max) * (height - pad * 2);
        const h2 = ((d.secondary ?? 0) / max) * (height - pad * 2);
        return (
          <g key={d.label}>
            <rect
              x={x - barW - 2}
              y={height - pad - h1}
              width={barW}
              height={h1}
              rx={3}
              fill={NAVY}
            />
            {d.secondary !== undefined && (
              <rect
                x={x + 2}
                y={height - pad - h2}
                width={barW}
                height={h2}
                rx={3}
                fill={ACCENT}
              />
            )}
            <text
              x={x}
              y={height - 8}
              textAnchor="middle"
              className="fill-navy-400 text-[10px]"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ----------------------------- Donut Chart ----------------------------- */

export function DonutChart({
  data,
  size = 200,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-40 w-40 shrink-0 -rotate-90"
        role="img"
        aria-label="Donut chart"
      >
        {data.map((d) => {
          const len = (d.value / total) * c;
          const seg = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={20}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-navy-600">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="font-medium text-navy-800">{d.label}</span>
            <span className="text-navy-400">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartLegend({
  items,
}: {
  items: { label: string; color: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-xs text-navy-500">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: it.color }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}
