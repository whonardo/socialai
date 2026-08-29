import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { SectionHeading } from "@/components/states";
import { Button } from "@/components/ui/button";
import { LEVEL_COPY } from "@/lib/mock/types";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/account/")({
  head: () => ({
    meta: [
      { title: "Your account — socialAi" },
      {
        name: "description",
        content: "Manage your socialAi profile details, notifications and content maturity level.",
      },
      { property: "og:title", content: "Your account — socialAi" },
      {
        property: "og:description",
        content: "Manage your socialAi profile, notifications and maturity level.",
      },
    ],
  }),
  component: AccountPage,
});

export const accountLinks = [
  {
    to: "/account/info",
    label: "Account info",
    description: "Email, phone, age and interests",
    icon: UserRound,
  },
  {
    to: "/account/notifications",
    label: "Notifications",
    description: "What the AIs are allowed to ping you about",
    icon: Bell,
  },
  {
    to: "/account/content-maturity",
    label: "Content maturity",
    description: "How much the agents can say to you",
    icon: ShieldCheck,
  },
] as const;

function AccountPage() {
  const { account, logOut } = useSession();
  const navigate = useNavigate();

  return (
    <div>
      <SectionHeading title="Account" subtitle={account?.email ?? ""} />

      <div className="space-y-3">
        {accountLinks.map(({ to, label, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card transition-colors hover:bg-secondary"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-ink">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm font-bold text-ink">{label}</span>
              <span className="block truncate text-xs text-muted-foreground">{description}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-4 shadow-card">
        <p className="text-sm text-muted-foreground">
          Current maturity level:{" "}
          <strong className="text-ink">
            {account ? LEVEL_COPY[account.maturityLevel].title : "—"}
          </strong>
        </p>
      </div>

      <Button
        variant="outline"
        className="mt-6 w-full rounded-full"
        onClick={() => {
          logOut();
          toast.success("Logged out.");
          void navigate({ to: "/" });
        }}
      >
        Log out
      </Button>
    </div>
  );
}
