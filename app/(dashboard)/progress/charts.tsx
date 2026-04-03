"use client";

import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { VolumePoint, ExercisePoint, UsedTemplate } from "@/lib/queries/progress";

function fmtDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr + "T00:00:00"));
}

function fmtKg(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}t`;
  return `${Math.round(value)}kg`;
}

const AXIS_STYLE = { fill: "#71717a", fontSize: 11 };
const GRID_COLOR = "#e4e4e7";
const PRIMARY = "#18181b";
const MUTED = "#a1a1aa";

export function VolumeChart({ data }: { data: VolumePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.12} />
            <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtDate}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
        />
        <YAxis
          tickFormatter={fmtKg}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <Tooltip
          formatter={(v: unknown) => [fmtKg(Number(v)), "Volume"]}
          labelFormatter={(label: unknown) =>
            typeof label === "string" ? fmtDate(label) : String(label)
          }
          contentStyle={{
            borderRadius: "0.5rem",
            border: "1px solid #e4e4e7",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="tonnage"
          stroke={PRIMARY}
          strokeWidth={2}
          fill="url(#vGrad)"
          dot={false}
          activeDot={{ r: 4, fill: PRIMARY }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ExerciseProgressChart({ data }: { data: ExercisePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtDate}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={fmtKg}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(v) => `${v}kg`}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip
          formatter={(v: unknown, name: unknown) => [
            name === "tonnage" ? fmtKg(Number(v)) : `${Number(v)}kg`,
            name === "tonnage" ? "Volume" : "Max weight",
          ]}
          labelFormatter={(label: unknown) =>
            typeof label === "string" ? fmtDate(label) : String(label)
          }
          contentStyle={{
            borderRadius: "0.5rem",
            border: "1px solid #e4e4e7",
            fontSize: 12,
          }}
        />
        <Bar
          yAxisId="left"
          dataKey="tonnage"
          fill={MUTED}
          radius={[3, 3, 0, 0]}
          maxBarSize={32}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="maxWeight"
          stroke={PRIMARY}
          strokeWidth={2}
          dot={{ r: 3, fill: PRIMARY, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ExerciseSelector({
  templates,
  selectedId,
}: {
  templates: UsedTemplate[];
  selectedId: string | undefined;
}) {
  const router = useRouter();

  return (
    <select
      value={selectedId ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        router.push(val ? `/progress?exercise=${val}` : "/progress");
      }}
      className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">Select an exercise…</option>
      {templates.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
