import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CardSkeletonList } from "@/components/states";
import { Button } from "@/components/ui/button";
import type { Permission } from "@/lib/agents/roles";
import { useSession } from "@/lib/session";

/**
 * Console gate. Renders nothing sensitive unless the session role holds the
 * permission. Handlers re-check independently — the UI is never the only lock.
 */
export function AdminGuard({
  permission = "agents.view",
  children,
}: {
  permission?: Permission;
  children: ReactNode;
}) {
  const { hydrated, account, can } = useSession();

  if (!hydrated) return <CardSkeletonList count={2} />;

  if (!account || !can(permission)) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
        <p className="font-display text-lg font-bold text-ink">Not your console</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          This area is for socialAi staff. Your account doesn&apos;t have access to it.
        </p>
        <div className="mt-5 flex justify-center">
          <Button asChild className="rounded-full bg-accent px-5 text-accent-foreground">
            <Link to="/">Back to feed</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Renders children only when the role holds the permission. */
export function Permitted({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { can } = useSession();
  if (!can(permission)) return null;
  return <>{children}</>;
}
