import { auth } from "@/feature/auth/auth";
import { logout } from "@/app/actions/auth";
import Link from "next/link";
import { Dumbbell, LogOut, Plus } from "lucide-react";
import { SidebarNavLinks, BottomNav } from "./components/nav-links";
import { routes } from "@/lib/routes";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const initials =
    session?.user?.name?.[0]?.toUpperCase() ??
    session?.user?.email?.[0]?.toUpperCase();

  return (
    <div className="bg-background flex h-screen">
      {/* ── Desktop sidebar ── */}
      <aside className="border-border bg-sidebar text-sidebar-foreground hidden w-60 flex-col border-r md:flex">
        {/* Logo */}
        <div className="border-sidebar-border flex h-16 items-center gap-2.5 border-b px-5">
          <div className="bg-sidebar-primary flex size-8 items-center justify-center rounded-lg">
            <Dumbbell className="text-sidebar-primary-foreground size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Training Tracker
          </span>
        </div>

        {/* New workout */}
        <div className="px-3 pt-4">
          <Link
            href={routes.workoutNew}
            className="border-sidebar-primary text-sidebar-primary hover:bg-sidebar-primary hover:text-sidebar-primary-foreground flex w-full items-center justify-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-semibold transition-colors"
          >
            <Plus className="size-4" />
            New Workout
          </Link>
        </div>

        <SidebarNavLinks />

        {/* User */}
        <div className="border-sidebar-border border-t p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="bg-sidebar-accent text-sidebar-accent-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">
                {session?.user?.name ?? session?.user?.email}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-sidebar-foreground/50 hover:text-sidebar-foreground cursor-pointer transition-colors"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Mobile + main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top header */}
        <header className="border-border bg-background flex h-14 items-center justify-between border-b px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-foreground flex size-7 items-center justify-center rounded-md">
              <Dumbbell className="text-background size-3.5" />
            </div>
            <span className="text-sm font-semibold">Training Tracker</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xs font-semibold">
              {initials}
            </div>
            <button
              type="submit"
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground cursor-pointer transition-colors"
              title="Sign out"
              onClick={logout}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>

        {/* Mobile bottom nav */}
        <div className="border-border bg-background border-t md:hidden">
          <div className="relative">
            <BottomNav />
            {/* FAB — new workout */}
            <Link
              href={routes.workoutNew}
              className="bg-foreground text-background absolute -top-6 left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
              aria-label="New workout"
            >
              <Plus className="size-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
