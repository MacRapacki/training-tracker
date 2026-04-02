"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/feature/auth/auth";
import { redirect } from "next/navigation";

export async function deleteWorkout(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  await prisma.workout.deleteMany({ where: { id, userId } });
  redirect("/dashboard");
}
