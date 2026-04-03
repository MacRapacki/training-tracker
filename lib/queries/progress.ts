import { prisma } from "@/lib/prisma";

export async function getVolumeHistory(userId: string) {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    include: {
      exercises: {
        include: { sets: { select: { weight: true, reps: true } } },
      },
    },
  });

  return workouts.map((w) => ({
    date: w.date.toISOString().slice(0, 10),
    name: w.name,
    tonnage: w.exercises.reduce(
      (t, ex) =>
        t + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0
    ),
  }));
}

export async function getUsedTemplates(userId: string) {
  return prisma.exerciseTemplate.findMany({
    where: { exercises: { some: { workout: { userId } } } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getExerciseProgress(
  userId: string,
  templateId: string
) {
  const exercises = await prisma.exercise.findMany({
    where: { templateId, workout: { userId } },
    orderBy: { workout: { date: "asc" } },
    include: {
      sets: { select: { weight: true, reps: true } },
      workout: { select: { date: true, name: true } },
    },
  });

  return exercises.map((ex) => ({
    date: ex.workout.date.toISOString().slice(0, 10),
    workoutName: ex.workout.name,
    tonnage: ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    maxWeight:
      ex.sets.length > 0 ? Math.max(...ex.sets.map((s) => s.weight)) : 0,
  }));
}

export type VolumePoint = Awaited<ReturnType<typeof getVolumeHistory>>[number];
export type ExercisePoint = Awaited<
  ReturnType<typeof getExerciseProgress>
>[number];
export type UsedTemplate = Awaited<ReturnType<typeof getUsedTemplates>>[number];
