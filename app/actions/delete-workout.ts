"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/feature/auth/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export async function deleteWorkout(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  await prisma.workout.deleteMany({ where: { id, userId } });
  redirect(routes.dashboard);
}
