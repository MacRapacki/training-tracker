import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/date";

export async function getWorkouts(userId: string) {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: {
      exercises: {
        include: {
          sets: true,
          template: { select: { name: true } },
        },
      },
    },
  });

  return workouts.map((w) => ({
    ...w,
    exerciseCount: w.exercises.length,
    tonnage: w.exercises.reduce(
      (total, ex) =>
        total +
        ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0
    ),
  }));
}

export type WorkoutWithStats = Awaited<ReturnType<typeof getWorkouts>>[number];

export async function getDashboardStats(userId: string) {
  const [totalWorkouts, workoutsThisWeek] = await Promise.all([
    prisma.workout.count({ where: { userId } }),
    prisma.workout.count({
      where: { userId, date: { gte: startOfWeek() } },
    }),
  ]);

  const allSets = await prisma.set.findMany({
    where: { exercise: { workout: { userId } } },
    select: { weight: true, reps: true },
  });

  const totalTonnage = allSets.reduce(
    (sum, s) => sum + s.weight * s.reps,
    0
  );

  return {
    totalWorkouts,
    workoutsThisWeek,
    totalTonnage,
  };
}
