import { auth } from "@/feature/auth/auth";
import { getWorkout } from "@/lib/queries/workout-detail";
import { deleteWorkout } from "@/app/actions/delete-workout";
import { formatDate, formatTonnage } from "@/lib/date";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Dumbbell,
  Weight,
  Hash,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const qualityStyle = {
  GREEN: { dot: "bg-green-500", label: "Good" },
  YELLOW: { dot: "bg-yellow-400", label: "OK" },
  RED: { dot: "bg-red-500", label: "Hard" },
} as const;

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const workout = await getWorkout(id, userId);
  if (!workout) notFound();

  const totalSets = workout.exercises.reduce(
    (n, ex) => n + ex.sets.length,
    0
  );
  const totalTonnage = workout.exercises.reduce(
    (total, ex) =>
      total + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
      {/* Back + actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <form
          action={async () => {
            "use server";
            await deleteWorkout(id);
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </form>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          {workout.name}
        </h1>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-3.5" />
          {formatDate(new Date(workout.date))}
        </div>
        {workout.notes && (
          <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {workout.notes}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="mb-1 flex justify-center text-muted-foreground">
            <Dumbbell className="size-4" />
          </div>
          <p className="text-lg font-bold">{workout.exercises.length}</p>
          <p className="text-[11px] text-muted-foreground">exercises</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="mb-1 flex justify-center text-muted-foreground">
            <Hash className="size-4" />
          </div>
          <p className="text-lg font-bold">{totalSets}</p>
          <p className="text-[11px] text-muted-foreground">sets</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="mb-1 flex justify-center text-muted-foreground">
            <Weight className="size-4" />
          </div>
          <p className="text-lg font-bold">{formatTonnage(totalTonnage)}</p>
          <p className="text-[11px] text-muted-foreground">volume</p>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {workout.exercises.map((ex, exIdx) => {
          const exTonnage = ex.sets.reduce(
            (s, set) => s + set.weight * set.reps,
            0
          );

          return (
            <div
              key={ex.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Exercise header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-muted-foreground w-5 shrink-0">
                    {exIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {ex.template?.name ?? "Exercise"}
                    </p>
                    {ex.template?.equipment && (
                      <p className="text-[11px] text-muted-foreground uppercase">
                        {ex.template.equipment.toLowerCase()}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {formatTonnage(exTonnage)}
                </span>
              </div>

              {/* Machine settings */}
              {ex.machineSettings && (
                <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  ⚙️ {ex.machineSettings}
                </div>
              )}

              {/* Sets */}
              <div className="px-4 py-3 space-y-2">
                {/* Header row */}
                <div className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-2 text-[10px] font-medium uppercase text-muted-foreground px-1">
                  <span>#</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span>Quality</span>
                </div>

                {ex.sets.map((set, i) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-[2rem_1fr_1fr_1fr] items-center gap-2 rounded-lg bg-muted/40 px-1 py-1.5"
                  >
                    <span className="text-center text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">
                      {set.weight}
                      <span className="text-xs text-muted-foreground ml-0.5">
                        {set.unit}
                      </span>
                    </span>
                    <span className="text-sm font-medium">
                      {set.reps}
                      <span className="text-xs text-muted-foreground ml-0.5">
                        reps
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {set.quality ? (
                        <>
                          <span
                            className={cn(
                              "size-2.5 rounded-full",
                              qualityStyle[set.quality].dot
                            )}
                          />
                          <span className="text-xs text-muted-foreground">
                            {qualityStyle[set.quality].label}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                ))}

                {ex.notes && (
                  <p className="text-xs text-muted-foreground pt-1 px-1">
                    {ex.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
