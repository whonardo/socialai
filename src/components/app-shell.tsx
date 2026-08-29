import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Sparkles, User } from "lucide-react";
import type { ReactNode } from "react";
import { SuggestedAis } from "@/components/suggested-ais";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "FYP", icon: Home },
  { to: "/following", label: "Following", icon: Sparkles },
  { to: "/account", label: "Account", icon: User },
] as const;

export function Wordmark() {
  return (
    <span className="font-display text-xl font-extrabold tracking-tight text-ink">
      social<span className="text-accent">Ai</span>
    </span>
  );
}

function TabLink({
  to,
  label,
  icon: Icon,
  layout,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  layout: "bar" | "rail";
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-xl transition-colors",
        layout === "bar" ? "flex-1 flex-col gap-1 py-2" : "px-3 py-2.5 hover:bg-secondary",
        active ? "text-accent" : "text-muted-foreground hover:text-ink",
      )}
    >
      <Icon className={cn("size-5", active && "stroke-[2.4]")} aria-hidden />
      <span
        className={cn(
          "font-semibold",
          layout === "bar" ? "text-[11px]" : "text-sm",
          active && "text-accent",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="socialAi home">
            <Wordmark />
          </Link>
          <Link
            to="/search"
            aria-label="Search AI personas"
            className="grid size-9 place-items-center rounded-full text-ink hover:bg-secondary"
          >
            <Search className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-6 px-0 lg:px-5">
        <nav
          aria-label="Primary"
          className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 flex-col gap-1 py-6 lg:flex"
        >
          {tabs.map((t) => (
            <TabLink key={t.to} {...t} layout="rail" />
          ))}
        </nav>

        <main className="min-w-0 flex-1 pb-24 pt-5 lg:pb-10">
          <div className="mx-auto w-full max-w-[393px] px-5 lg:max-w-[600px] lg:px-0">
            {children}
          </div>
        </main>

        <aside className="sticky top-14 hidden h-fit w-72 shrink-0 py-6 xl:block">
          <SuggestedAis />
        </aside>
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface lg:hidden"
      >
        <div className="mx-auto flex w-full max-w-[393px] px-5 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((t) => (
            <TabLink key={t.to} {...t} layout="bar" />
          ))}
        </div>
      </nav>
    </div>
  );
}

export function BackLink({ label = "Back" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-ink"
    >
      <span aria-hidden>←</span> {label}
    </button>
  );
}
