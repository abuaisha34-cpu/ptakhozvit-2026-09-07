import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtInt, fmtNum } from "@/lib/utils";

const axis = { fill: "#45634d", fontSize: 11 };
const grid = "rgba(22,52,28,0.08)";
const actual = "#2d8a48";
const standard = "#7b9582";
const warn = "#d07028";
const accent = "#3a9a55";

const SITE_COLORS = ["#2d8a48", "#16341c", "#3a9a55", "#c0922e", "#d07028"];

const tipStyle = {
  background: "#ffffff",
  border: "1px solid rgba(22,52,28,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#16341c",
};

const legendStyle = { fontSize: 12, color: "#45634d", paddingTop: 8 };

function tickDate(v: string) {
  if (v.length >= 10) return `${v.slice(8, 10)}.${v.slice(5, 7)}`;
  return v.slice(5);
}

function EmptyChart() {
  return (
    <div className="grid h-48 place-items-center text-sm text-muted">Немає даних для графіка</div>
  );
}

export function WeightChart({
  data,
}: {
  data: Array<{ date: string; weight: number; stdWeight: number; ageDays?: number }>;
}) {
  if (!data.length) return <EmptyChart />;
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={tickDate} minTickGap={22}
            tick={axis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={axis} axisLine={false} tickLine={false} width={44} />
          <Tooltip contentStyle={tipStyle} formatter={(v) => [`${fmtInt(Number(v))} г`]} />
          <Line type="monotone" dataKey="stdWeight" name="Норма, г" stroke={standard} strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="weight" name="Факт, г" stroke={actual} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MortChart({
  data,
}: {
  data: Array<{ date: string; mortPct: number }>;
}) {
  if (!data.length) return <EmptyChart />;
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="date" tickFormatter={tickDate} minTickGap={22} tick={axis} axisLine={false} tickLine={false} />
          <YAxis tick={axis} axisLine={false} tickLine={false} width={36} />
          <Tooltip contentStyle={tipStyle} formatter={(v) => [`${fmtNum(Number(v), 2)}%`]} />
          <Area type="monotone" dataKey="mortPct" name="Падіж, %" stroke={warn} fill="rgba(179,107,50,0.16)" strokeWidth={1.75} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Daily feed kg vs breed standard (same headcount). */
export function FeedKgChart({
  data,
}: {
  data: Array<{ date: string; feedKg: number; stdFeedKg: number }>;
}) {
  if (!data.length) return <EmptyChart />;
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={tickDate} minTickGap={22}
            tick={axis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={axis}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) => fmtInt(v)}
          />
          <Tooltip contentStyle={tipStyle} formatter={(v) => [`${fmtNum(Number(v), 0)} кг`]} />
          <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
          <Bar dataKey="feedKg" name="Факт" fill={actual} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Line
            type="monotone"
            dataKey="stdFeedKg"
            name="Норма кросу"
            stroke={standard}
            strokeWidth={1.75}
            dot={false}
            strokeDasharray="4 4"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Daily feed grams per bird vs breed standard. */
export function FeedPerBirdChart({
  data,
}: {
  data: Array<{ date: string; feedGPerBird: number; stdFeedGPerBird: number }>;
}) {
  if (!data.length) return <EmptyChart />;
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={tickDate} minTickGap={22}
            tick={axis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={axis}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v: number) => fmtInt(v)}
          />
          <Tooltip contentStyle={tipStyle} formatter={(v) => [`${fmtNum(Number(v), 0)} г/гол.`]} />
          <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
          <Line
            type="monotone"
            dataKey="stdFeedGPerBird"
            name="Норма"
            stroke={standard}
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="feedGPerBird"
            name="Факт"
            stroke={accent}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WaterPerBirdChart({
  data,
}: {
  data: Array<{ date: string; waterMlPerBird: number | null; stdWaterMlPerBird: number }>;
}) {
  const rows = data.filter((d) => d.waterMlPerBird != null);
  if (!rows.length) return <EmptyChart />;
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={tickDate} minTickGap={22}
            tick={axis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={axis}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v: number) => fmtInt(v)}
          />
          <Tooltip contentStyle={tipStyle} formatter={(v) => [`${fmtNum(Number(v), 0)} мл/гол.`]} />
          <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
          <Line
            type="monotone"
            dataKey="stdWaterMlPerBird"
            name="Норма"
            stroke={standard}
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="waterMlPerBird"
            name="Факт"
            stroke={warn}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Cumulative feed vs standard — house / flock view. */
export function CumFeedChart({
  data,
}: {
  data: Array<{ date: string; cumFeedKg: number; stdCumFeedKg: number }>;
}) {
  if (!data.length) return <EmptyChart />;
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={tickDate} minTickGap={22}
            tick={axis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={axis}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v: number) => fmtInt(v)}
          />
          <Tooltip contentStyle={tipStyle} formatter={(v) => [`${fmtNum(Number(v), 0)} кг`]} />
          <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
          <Area
            type="monotone"
            dataKey="stdCumFeedKg"
            name="Норма накопичено"
            stroke={standard}
            fill="rgba(138,144,130,0.14)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey="cumFeedKg"
            name="Факт накопичено"
            stroke={accent}
            fill="rgba(79,106,70,0.18)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Stacked daily feed by factory. */
export function FeedBySiteChart({
  data,
  keys,
}: {
  data: Array<{ date: string; feedBySite?: Record<string, number> } & Record<string, unknown>>;
  keys: string[];
}) {
  if (!data.length || !keys.length) return <EmptyChart />;
  const flat = data.map((row) => {
    const next: Record<string, string | number> = { date: String(row.date) };
    const src = (row.feedBySite as Record<string, number> | undefined) ?? {};
    for (const k of keys) {
      const v = src[k] ?? Number(row[k] ?? 0);
      next[k] = Number.isFinite(v) ? v : 0;
    }
    return next;
  });
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={flat} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={tickDate} minTickGap={22}
            tick={axis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={axis}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v: number) => fmtInt(v)}
          />
          <Tooltip contentStyle={tipStyle} formatter={(v, name) => [`${fmtNum(Number(v), 0)} кг`, String(name)]} />
          <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
          {keys.map((k, i) => (
            <Bar
              key={k}
              dataKey={k}
              name={k}
              stackId="feed"
              fill={SITE_COLORS[i % SITE_COLORS.length]}
              maxBarSize={36}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
