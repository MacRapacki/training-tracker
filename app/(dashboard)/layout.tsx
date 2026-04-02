import { auth } from "@/feature/auth/auth";
import { logout } from "@/app/actions/auth";
import Link from "next/link";
import { Dumbbell, LogOut, Plus } from "lucide-react";
import { SidebarNavLinks, BottomNav } from "./components/nav-links";

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
    <div className="flex h-screen bg-background">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden w-60 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Dumbbell className="size-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Training Tracker
          </span>
        </div>

        {/* New workout */}
        <div className="px-3 pt-4">
          <Link
            href="/workouts/new"
            className="flex w-full items-center gap-2 rounded-lg bg-sidebar-primary px-3 py-2 text-sm font-medium text-sidebar-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            New Workout
          </Link>
        </div>

        <SidebarNavLinks />

        {/* User */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
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
                className="text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground"
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
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-foreground">
              <Dumbbell className="size-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold">Training Tracker</span>
          </div>
          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {initials}
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>

        {/* Mobile bottom nav */}
        <div className="border-t border-border bg-background md:hidden">
          <div className="relative">
            <BottomNav />
            {/* FAB — new workout */}
            <Link
              href="/workouts/new"
              className="absolute -top-6 left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-95"
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
