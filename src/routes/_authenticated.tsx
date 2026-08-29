import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { CardSkeletonList } from "@/components/states";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { hydrated, account } = useSession();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    if (hydrated && !account) {
      void navigate({ to: "/auth", search: { redirect: href }, replace: true });
    }
  }, [hydrated, account, href, navigate]);

  if (!hydrated || !account) return <CardSkeletonList count={3} />;

  return <Outlet />;
}
