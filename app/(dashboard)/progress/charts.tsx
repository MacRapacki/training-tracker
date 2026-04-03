"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { formatTonnage } from "@/lib/date";
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

export function ExerciseSection({
  templates,
  selectedId,
  exerciseProgress,
}: {
  templates: UsedTemplate[];
  selectedId: string | undefined;
  exerciseProgress: ExercisePoint[] | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(val: string) {
    startTransition(() => {
      router.push(val ? `/progress?exercise=${val}` : "/progress");
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Exercise Progress</h2>
        <select
          value={selectedId ?? ""}
          onChange={(e) => navigate(e.target.value)}
          disabled={isPending}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="">Select an exercise…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/70 backdrop-blur-[1px]">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {exerciseProgress === null ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Select an exercise to see its progress
          </p>
        ) : exerciseProgress.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data for this exercise
          </p>
        ) : (
          <>
            <div className="mb-3 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-full bg-zinc-400" />
                Volume (bars, left axis)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-full bg-zinc-900" />
                Max weight (line, right axis)
              </span>
            </div>
            <ExerciseProgressChart data={exerciseProgress} />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div>
                <p className="text-[11px] text-muted-foreground">Best weight</p>
                <p className="mt-0.5 text-sm font-semibold">
                  {Math.max(...exerciseProgress.map((p) => p.maxWeight))}kg
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">
                  Best session volume
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {formatTonnage(
                    Math.max(...exerciseProgress.map((p) => p.tonnage))
                  )}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Sessions</p>
                <p className="mt-0.5 text-sm font-semibold">
                  {exerciseProgress.length}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
