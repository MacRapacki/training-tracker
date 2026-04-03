import { auth } from "@/feature/auth/auth";
import { prisma } from "@/lib/prisma";
import { getWorkout } from "@/lib/queries/workout-detail";
import { getExerciseTemplates } from "@/app/actions/workouts";
import { WorkoutForm } from "../../new/workout-form";
import { notFound, redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(routes.login);

  const [workout, templates, latestWeight] = await Promise.all([
    getWorkout(id, session.user.id),
    getExerciseTemplates(),
    prisma.bodyWeight.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      select: { weight: true },
    }),
  ]);

  if (!workout) notFound();

  const initialData = {
    name: workout.name,
    date: new Date(workout.date).toISOString().slice(0, 10),
    notes: workout.notes ?? "",
    exercises: workout.exercises.map((ex) => ({
      id: crypto.randomUUID(),
      templateId: ex.templateId ?? null,
      templateName: ex.template?.name ?? "",
      machineSettings: ex.machineSettings ?? "",
      notes: ex.notes ?? "",
      sets: ex.sets.map((s) => ({
        reps: String(s.reps),
        weight: String(s.weight),
        quality: s.quality ?? null,
        notes: s.notes ?? "",
      })),
      expanded: false,
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          Edit Workout
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your workout details
        </p>
      </div>
      <WorkoutForm
        templates={templates}
        initialData={initialData}
        workoutId={id}
        defaultBodyWeight={latestWeight?.weight ?? null}
      />
    </div>
  );
}
