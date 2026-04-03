import { prisma } from "@/lib/prisma";

export function todayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export async function getTodayBodyData(userId: string) {
  const today = todayUTC();
  const tomorrow = new Date(today.getTime() + 86_400_000);

  const [weight, water] = await Promise.all([
    prisma.bodyWeight.findFirst({
      where: { userId, date: { gte: today, lt: tomorrow } },
    }),
    prisma.waterIntake.findFirst({
      where: { userId, date: { gte: today, lt: tomorrow } },
    }),
  ]);

  return { weight, water };
}

export async function getBodyWeightHistory(userId: string) {
  const entries = await prisma.bodyWeight.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    take: 90,
    select: { weight: true, date: true },
  });
  return entries.map((e) => ({
    date: e.date.toISOString().slice(0, 10),
    weight: e.weight,
  }));
}

export async function getRecentBodyLog(userId: string) {
  const [weights, waters] = await Promise.all([
    prisma.bodyWeight.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
      select: { weight: true, date: true },
    }),
    prisma.waterIntake.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
      select: { amount: true, date: true },
    }),
  ]);

  const byDate = new Map<
    string,
    { weight?: number; water?: number }
  >();

  for (const w of weights) {
    const key = w.date.toISOString().slice(0, 10);
    byDate.set(key, { ...byDate.get(key), weight: w.weight });
  }
  for (const w of waters) {
    const key = w.date.toISOString().slice(0, 10);
    byDate.set(key, { ...byDate.get(key), water: w.amount });
  }

  return Array.from(byDate.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7)
    .map(([date, vals]) => ({ date, ...vals }));
}

export type BodyWeightPoint = { date: string; weight: number };
export type BodyLogEntry = Awaited<ReturnType<typeof getRecentBodyLog>>[number];
