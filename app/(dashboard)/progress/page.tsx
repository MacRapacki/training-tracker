import { auth } from "@/feature/auth/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import {
  getVolumeHistory,
  getUsedTemplates,
  getExerciseProgress,
} from "@/lib/queries/progress";
import { formatTonnage } from "@/lib/date";
import { TrendingUp } from "lucide-react";
import {
  VolumeChart,
  ExerciseProgressChart,
  ExerciseSelector,
} from "./charts";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect(routes.login);
  const userId = session.user.id;

  const { exercise: selectedId } = await searchParams;

  const [volumeHistory, usedTemplates] = await Promise.all([
    getVolumeHistory(userId),
    getUsedTemplates(userId),
  ]);

  const exerciseProgress =
    selectedId ? await getExerciseProgress(userId, selectedId) : null;

  const selectedTemplate = usedTemplates.find((t) => t.id === selectedId);

  const totalTonnage = volumeHistory.reduce((s, w) => s + w.tonnage, 0);
  const totalWorkouts = volumeHistory.length;
  const bestSession =
    volumeHistory.length > 0
      ? volumeHistory.reduce((best, w) =>
          w.tonnage > best.tonnage ? w : best
        )
      : null;

  if (totalWorkouts === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
        <h1 className="mb-6 text-xl font-bold tracking-tight md:text-2xl">
          Progress
        </h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <TrendingUp className="mb-4 size-10 text-muted-foreground/40" />
          <p className="font-medium">No data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Log your first workout to start tracking progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-6 text-xl font-bold tracking-tight md:text-2xl">
        Progress
      </h1>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-3 gap-3 md:gap-4">
        <div className="rounded-xl border border-border bg-card p-3 md:p-4">
          <p className="text-[11px] font-medium text-muted-foreground md:text-xs">
            Total Workouts
          </p>
          <p className="mt-1.5 text-xl font-bold tracking-tight md:text-2xl">
            {totalWorkouts}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 md:p-4">
          <p className="text-[11px] font-medium text-muted-foreground md:text-xs">
            Total Volume
          </p>
          <p className="mt-1.5 text-xl font-bold tracking-tight md:text-2xl">
            {formatTonnage(totalTonnage)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 md:p-4">
          <p className="text-[11px] font-medium text-muted-foreground md:text-xs">
            Best Session
          </p>
          <p className="mt-1.5 text-xl font-bold tracking-tight md:text-2xl">
            {bestSession ? formatTonnage(bestSession.tonnage) : "—"}
          </p>
        </div>
      </div>

      {/* Volume over time */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4 md:p-5">
        <h2 className="mb-4 text-sm font-semibold">Volume per Workout</h2>
        <VolumeChart data={volumeHistory} />
      </div>

      {/* Exercise progress */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Exercise Progress</h2>
          <ExerciseSelector
            templates={usedTemplates}
            selectedId={selectedId}
          />
        </div>

        {exerciseProgress && selectedTemplate ? (
          exerciseProgress.length === 0 ? (
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
              {/* Best stats */}
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Best weight
                  </p>
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
          )
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Select an exercise to see its progress
          </p>
        )}
      </div>
    </div>
  );
}
