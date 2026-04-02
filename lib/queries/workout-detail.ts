import { prisma } from "@/lib/prisma";

export async function getWorkout(id: string, userId: string) {
  return prisma.workout.findFirst({
    where: { id, userId },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          template: { select: { name: true, equipment: true } },
          sets: { orderBy: { order: "asc" } },
        },
      },
    },
  });
}

export type WorkoutDetail = NonNullable<Awaited<ReturnType<typeof getWorkout>>>;
