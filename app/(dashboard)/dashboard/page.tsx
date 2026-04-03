import { auth } from "@/feature/auth/auth";
import {
  getDashboardStats,
  getWorkouts,
  type WorkoutWithStats,
} from "@/lib/queries/workouts";
import { formatRelativeDate, formatTonnage } from "@/lib/date";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Dumbbell,
  Calendar,
  Weight,
  Flame,
  ChevronRight,
  Plus,
} from "lucide-react";
import { routes } from "@/lib/routes";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect(routes.login);

  const [stats, workouts] = await Promise.all([
    getDashboardStats(userId),
    getWorkouts(userId),
  ]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          {greeting}, {session?.user?.name?.split(" ")[0] ?? "Athlete"} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }).format(new Date())}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Dumbbell className="size-4" />}
          label="Total Workouts"
          value={stats.totalWorkouts.toString()}
        />
        <StatCard
          icon={<Calendar className="size-4" />}
          label="This Week"
          value={stats.workoutsThisWeek.toString()}
        />
        <StatCard
          icon={<Weight className="size-4" />}
          label="Total Volume"
          value={formatTonnage(stats.totalTonnage)}
        />
        <StatCard
          icon={<Flame className="size-4" />}
          label="Last Workout"
          value={
            workouts[0] ? formatRelativeDate(new Date(workouts[0].date)) : "—"
          }
        />
      </div>

      {/* Workout list */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent Workouts</h2>
        <Link
          href={routes.workoutNew}
          className="border-sidebar-primary text-sidebar-primary hover:bg-sidebar-primary hover:text-sidebar-primary-foreground flex w-fit items-center justify-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-semibold transition-colors"
        >
          <Plus className="size-3.5" />
          New
        </Link>
      </div>

      {workouts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {workouts.map((workout: WorkoutWithStats) => (
            <Link
              key={workout.id}
              href={routes.workout(workout.id)}
              className="group border-border bg-card hover:bg-muted/50 flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors md:gap-4 md:px-5 md:py-4"
            >
              {/* Date badge */}
              <div className="bg-muted flex w-12 shrink-0 flex-col items-center rounded-lg px-2 py-1.5 text-center">
                <span className="text-muted-foreground text-xs font-medium uppercase">
                  {new Intl.DateTimeFormat("en-US", { month: "short" }).format(
                    new Date(workout.date)
                  )}
                </span>
                <span className="text-xl leading-tight font-bold">
                  {new Date(workout.date).getDate()}
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{workout.name}</p>
                <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                  <span>{workout.exerciseCount} exercises</span>
                  <span>·</span>
                  <span>{formatTonnage(workout.tonnage)} volume</span>
                  <span>·</span>
                  <span>
                    {workout.exercises.reduce(
                      (n: number, ex) => n + ex.sets.length,
                      0
                    )}{" "}
                    sets
                  </span>
                </div>
                {/* Exercise names */}
                {workout.exercises.length > 0 && (
                  <p className="text-muted-foreground/70 mt-1 truncate text-xs">
                    {workout.exercises
                      .slice(0, 4)
                      .map((ex) => ex.template?.name ?? "Exercise")
                      .join(", ")}
                    {workout.exercises.length > 4 &&
                      ` +${workout.exercises.length - 4} more`}
                  </p>
                )}
              </div>

              <ChevronRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border bg-card rounded-xl border p-3 md:p-4">
      <div className="text-muted-foreground mb-2 flex items-center gap-1.5 md:mb-3 md:gap-2">
        {icon}
        <span className="text-[11px] font-medium md:text-xs">{label}</span>
      </div>
      <p className="text-xl font-bold tracking-tight md:text-2xl">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <Dumbbell className="text-muted-foreground/40 mb-4 size-10" />
      <p className="font-medium">No workouts yet</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Log your first workout to get started
      </p>
      <Link
        href="/workouts/new"
        className="bg-primary text-primary-foreground mt-4 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
      >
        Log a Workout
      </Link>
    </div>
  );
}
