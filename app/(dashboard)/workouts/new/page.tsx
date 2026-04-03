import { getExerciseTemplates } from "@/app/actions/workouts";
import { auth } from "@/feature/auth/auth";
import { prisma } from "@/lib/prisma";
import { WorkoutForm } from "./workout-form";

export default async function NewWorkoutPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [templates, latestWeight] = await Promise.all([
    getExerciseTemplates(),
    userId
      ? prisma.bodyWeight.findFirst({
          where: { userId },
          orderBy: { date: "desc" },
          select: { weight: true },
        })
      : null,
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          New Workout
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log your exercises and sets
        </p>
      </div>
      <WorkoutForm
        templates={templates}
        defaultBodyWeight={latestWeight?.weight ?? null}
      />
    </div>
  );
}
