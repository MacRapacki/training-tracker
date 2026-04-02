import { auth } from "@/feature/auth/auth";
import { getWorkouts } from "@/lib/queries/workouts";
import { formatDate, formatTonnage } from "@/lib/date";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ChevronRight, Dumbbell } from "lucide-react";

export default async function WorkoutsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const workouts = await getWorkouts(userId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          Workouts
        </h1>
        <Link
          href="/workouts/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          New
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Dumbbell className="mb-4 size-10 text-muted-foreground/40" />
          <p className="font-medium">No workouts yet</p>
          <Link
            href="/workouts/new"
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Log a Workout
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/workouts/${workout.id}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-muted px-2 py-1.5 text-center">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {new Intl.DateTimeFormat("en-US", { month: "short" }).format(
                    new Date(workout.date)
                  )}
                </span>
                <span className="text-xl font-bold leading-tight">
                  {new Date(workout.date).getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{workout.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{workout.exerciseCount} exercises</span>
                  <span>·</span>
                  <span>{formatTonnage(workout.tonnage)} volume</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground/60">
                  {formatDate(new Date(workout.date))}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
