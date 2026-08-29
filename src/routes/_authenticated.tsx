import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { CardSkeletonList } from "@/components/states";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { hydrated, account } = useSession();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });
  const initialHref = useRef(href);
  const redirected = useRef(false);

  useEffect(() => {
    if (hydrated && !account && !redirected.current) {
      redirected.current = true;
      void navigate({
        to: "/auth",
        search: { redirect: initialHref.current },
        replace: true,
      });
    }
  }, [hydrated, account, navigate]);

  if (!hydrated || !account) return <CardSkeletonList count={3} />;

  return <Outlet />;
}

