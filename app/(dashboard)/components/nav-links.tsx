"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

const navLinks = [
  { href: routes.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: routes.workouts, label: "Workouts", icon: Dumbbell },
  { href: routes.progress, label: "Progress", icon: TrendingUp },
  { href: routes.body, label: "Body", icon: Scale },
];

export function SidebarNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-3 pt-4">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn("rounded-lg p-1.5 transition-colors", active && "bg-foreground text-background")}>
              <Icon className="size-5" />
            </div>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
