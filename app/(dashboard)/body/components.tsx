"use client";

import { useActionState, useTransition } from "react";
import { saveBodyWeight, saveWaterIntake, type BodyActionState } from "@/app/actions/body";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { BodyWeightPoint, BodyLogEntry } from "@/lib/queries/body";

// ── Charts ────────────────────────────────────────────────────────────────

const AXIS_STYLE = { fill: "#71717a", fontSize: 11 };
const GRID_COLOR = "#e4e4e7";
const PRIMARY = "#18181b";

function fmtDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr + "T00:00:00"));
}

export function WeightChart({ data }: { data: BodyWeightPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
          domain={["auto", "auto"]}
          tickFormatter={(v: number) => `${v}kg`}
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          formatter={(v: unknown) => [`${Number(v)}kg`, "Weight"]}
          labelFormatter={(label: unknown) =>
            typeof label === "string" ? fmtDate(label) : String(label)
          }
          contentStyle={{
            borderRadius: "0.5rem",
            border: "1px solid #e4e4e7",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke={PRIMARY}
          strokeWidth={2}
          dot={{ r: 3, fill: PRIMARY, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Log forms ─────────────────────────────────────────────────────────────

export function WeightForm({
  current,
}: {
  current: number | null;
}) {
  const [state, action, pending] = useActionState<BodyActionState, FormData>(
    saveBodyWeight,
    undefined
  );

  return (
    <form action={action} className="mt-3 flex items-center gap-2">
      <input
        name="weight"
        type="number"
        inputMode="decimal"
        step="0.1"
        min={20}
        max={500}
        defaultValue={current ?? ""}
        placeholder="kg"
        className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
      </button>
      {state?.success && (
        <CheckCircle2 className="size-4 shrink-0 text-green-500" />
      )}
      {state?.error && (
        <span className="text-xs text-destructive">{state.error}</span>
      )}
    </form>
  );
}

const WATER_GOAL = 2000;

export function WaterForm({ current }: { current: number | null }) {
  const [state, action, pending] = useActionState<BodyActionState, FormData>(
    saveWaterIntake,
    undefined
  );
  const [, startTransition] = useTransition();

  function quickAdd(ml: number) {
    const formData = new FormData();
    formData.set("amount", String((current ?? 0) + ml));
    startTransition(() => action(formData));
  }

  const pct = Math.min(((current ?? 0) / WATER_GOAL) * 100, 100);

  return (
    <div className="mt-3 space-y-3">
      {/* Progress bar */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>{current ?? 0} ml</span>
          <span>goal: {WATER_GOAL} ml</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Quick-add buttons */}
      <div className="flex gap-2">
        {[250, 500, 1000].map((ml) => (
          <button
            key={ml}
            type="button"
            disabled={pending}
            onClick={() => quickAdd(ml)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            +{ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
          </button>
        ))}
      </div>

      {/* Manual input */}
      <form action={action} className="flex items-center gap-2">
        <input
          name="amount"
          type="number"
          inputMode="numeric"
          min={0}
          max={10000}
          defaultValue={current ?? ""}
          placeholder="ml"
          className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : "Set"}
        </button>
        {state?.success && (
          <CheckCircle2 className="size-4 shrink-0 text-green-500" />
        )}
        {state?.error && (
          <span className="text-xs text-destructive">{state.error}</span>
        )}
      </form>
    </div>
  );
}

// ── History list ──────────────────────────────────────────────────────────

export function BodyLog({ entries }: { entries: BodyLogEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="divide-y divide-border">
      {entries.map(({ date, weight, water }) => (
        <div key={date} className="flex items-center justify-between py-3 text-sm">
          <span className="text-muted-foreground">{fmtDate(date)}</span>
          <div className="flex gap-4">
            {weight != null ? (
              <span className="font-medium">{weight} kg</span>
            ) : (
              <span className="text-muted-foreground/50">—</span>
            )}
            {water != null ? (
              <span className="text-muted-foreground">
                {water >= 1000 ? `${(water / 1000).toFixed(1)}L` : `${water}ml`}
              </span>
            ) : (
              <span className="text-muted-foreground/50">—</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
