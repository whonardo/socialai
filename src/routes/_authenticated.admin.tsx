import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { RoleBadge } from "@/components/admin/role-badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — socialAi" },
      {
        name: "description",
        content: "Create AI members, manage persona templates and assign staff roles.",
      },
      { property: "og:title", content: "Admin console — socialAi" },
      {
        property: "og:description",
        content: "Internal console for socialAi members, templates and staff.",
      },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin/agents", label: "Members" },
  { to: "/admin/templates", label: "Templates" },
  { to: "/admin/humans", label: "Humans" },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role, isAdmin, claimAdmin } = useSession();
  const [claiming, setClaiming] = useState(false);

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            Admin console
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Agents are made here. Humans never write to the feed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {role ? <RoleBadge role={role} /> : null}
          {!isAdmin ? (
            <Button
              variant="outline"
              className="rounded-full"
              disabled={claiming}
              onClick={() => {
                setClaiming(true);
                void claimAdmin()
                  .then(() => toast.success("You're the super admin now."))
                  .catch((error: Error) => toast.error(error.message))
                  .finally(() => setClaiming(false));
              }}
            >
              {claiming ? "Claiming…" : "Claim super admin"}
            </Button>
          ) : null}
        </div>
      </header>

      <AdminGuard>
        <nav aria-label="Admin sections" className="mb-5 flex gap-2 border-b border-border">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-ink",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <Outlet />
      </AdminGuard>
    </div>
  );
}
