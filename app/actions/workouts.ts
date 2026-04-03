"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/feature/auth/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

const setSchema = z.object({
  reps: z.coerce.number().int().min(1),
  weight: z.coerce.number().min(0),
  unit: z.enum(["kg", "lbs"]).default("kg"),
  quality: z.enum(["GREEN", "YELLOW", "RED"]).nullable().optional(),
  notes: z.string().optional(),
});

const exerciseSchema = z.object({
  templateId: z.string().optional().nullable(),
  customName: z.string().optional(),
  order: z.coerce.number().int().default(0),
  machineSettings: z.string().optional(),
  notes: z.string().optional(),
  sets: z.array(setSchema).min(1),
});

const workoutSchema = z.object({
  name: z.string().min(1),
  date: z.string(),
  notes: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1),
});

export type SaveWorkoutInput = z.infer<typeof workoutSchema>;

export async function saveWorkout(data: SaveWorkoutInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Not authenticated" };

  const parsed = workoutSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid data", issues: parsed.error.flatten() };
  }

  const { name, date, notes, exercises } = parsed.data;

  const workout = await prisma.workout.create({
    data: {
      name,
      date: new Date(date),
      notes,
      userId,
      exercises: {
        create: exercises.map((ex, i) => ({
          order: i,
          notes: ex.notes,
          machineSettings: ex.machineSettings,
          templateId: ex.templateId ?? null,
          sets: {
            create: ex.sets.map((s, j) => ({
              order: j,
              reps: s.reps,
              weight: s.weight,
              unit: s.unit,
              quality: s.quality ?? null,
              notes: s.notes,
            })),
          },
        })),
      },
    },
  });

  redirect(routes.workout(workout.id));
}

export async function updateWorkout(id: string, data: SaveWorkoutInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Not authenticated" };

  const existing = await prisma.workout.findFirst({ where: { id, userId } });
  if (!existing) return { error: "Not found" };

  const parsed = workoutSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid data", issues: parsed.error.flatten() };
  }

  const { name, date, notes, exercises } = parsed.data;

  await prisma.workout.update({
    where: { id },
    data: {
      name,
      date: new Date(date),
      notes,
      exercises: {
        deleteMany: {},
        create: exercises.map((ex, i) => ({
          order: i,
          notes: ex.notes,
          machineSettings: ex.machineSettings,
          templateId: ex.templateId ?? null,
          sets: {
            create: ex.sets.map((s, j) => ({
              order: j,
              reps: s.reps,
              weight: s.weight,
              unit: s.unit,
              quality: s.quality ?? null,
              notes: s.notes,
            })),
          },
        })),
      },
    },
  });

  redirect(routes.workout(id));
}

export async function getExerciseTemplates(query: string = "") {
  const session = await auth();
  const userId = session?.user?.id;

  return prisma.exerciseTemplate.findMany({
    where: {
      OR: [{ isGlobal: true }, { userId: userId ?? "" }],
      name: { contains: query, mode: "insensitive" },
    },
    orderBy: [{ isGlobal: "desc" }, { name: "asc" }],
    take: 20,
  });
}
