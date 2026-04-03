"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/feature/auth/auth";
import { revalidatePath } from "next/cache";
import { routes } from "@/lib/routes";
import { todayUTC } from "@/lib/queries/body";

const weightSchema = z.object({
  weight: z.coerce.number().min(20).max(500),
});

const waterSchema = z.object({
  amount: z.coerce.number().min(0).max(10_000),
});

export type BodyActionState = { error?: string; success?: boolean } | undefined;

export async function saveBodyWeight(
  _prev: BodyActionState,
  formData: FormData
): Promise<BodyActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parsed = weightSchema.safeParse({ weight: formData.get("weight") });
  if (!parsed.success) return { error: "Enter a valid weight (20–500 kg)." };

  const today = todayUTC();

  await prisma.bodyWeight.upsert({
    where: { userId_date: { userId: session.user.id, date: today } },
    create: { userId: session.user.id, weight: parsed.data.weight, date: today },
    update: { weight: parsed.data.weight },
  });

  revalidatePath(routes.body);
  return { success: true };
}

export async function saveWaterIntake(
  _prev: BodyActionState,
  formData: FormData
): Promise<BodyActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parsed = waterSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) return { error: "Enter a valid amount (0–10 000 ml)." };

  const today = todayUTC();

  await prisma.waterIntake.upsert({
    where: { userId_date: { userId: session.user.id, date: today } },
    create: { userId: session.user.id, amount: parsed.data.amount, date: today },
    update: { amount: parsed.data.amount },
  });

  revalidatePath(routes.body);
  return { success: true };
}
