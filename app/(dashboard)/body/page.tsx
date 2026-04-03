import { auth } from "@/feature/auth/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import {
  getTodayBodyData,
  getBodyWeightHistory,
  getRecentBodyLog,
} from "@/lib/queries/body";
import { Scale, Droplets } from "lucide-react";
import { WeightChart, WeightForm, WaterForm, BodyLog } from "./components";

export default async function BodyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect(routes.login);
  const userId = session.user.id;

  const [today, weightHistory, recentLog] = await Promise.all([
    getTodayBodyData(userId),
    getBodyWeightHistory(userId),
    getRecentBodyLog(userId),
  ]);

  const todayDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Body</h1>
        <p className="mt-1 text-sm text-muted-foreground">{todayDate}</p>
      </div>

      {/* Today's log */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Weight */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Scale className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Body Weight
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {today.weight ? (
              <>
                {today.weight.weight}
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  kg
                </span>
              </>
            ) : (
              <span className="text-muted-foreground/40">—</span>
            )}
          </p>
          <WeightForm current={today.weight?.weight ?? null} />
        </div>

        {/* Water */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Droplets className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Water Intake
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {today.water ? (
              <>
                {today.water.amount >= 1000
                  ? (today.water.amount / 1000).toFixed(1)
                  : today.water.amount}
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  {today.water.amount >= 1000 ? "L" : "ml"}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground/40">—</span>
            )}
          </p>
          <WaterForm current={today.water?.amount ?? null} />
        </div>
      </div>

      {/* Weight history chart */}
      {weightHistory.length > 1 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="mb-4 text-sm font-semibold">Weight History</h2>
          <WeightChart data={weightHistory} />
        </div>
      )}

      {/* Recent log */}
      {recentLog.length > 0 && (
        <div className="rounded-xl border border-border bg-card px-4 py-3 md:px-5">
          <div className="mb-1 flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>Date</span>
            <div className="flex gap-4">
              <span>Weight</span>
              <span>Water</span>
            </div>
          </div>
          <BodyLog entries={recentLog} />
        </div>
      )}
    </div>
  );
}
