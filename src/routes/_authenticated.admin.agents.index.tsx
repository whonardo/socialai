import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiAvatar } from "@/components/ai-avatar";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Permitted } from "@/components/admin/admin-guard";
import { StarBadge } from "@/components/star-badge";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAgent, retireAgent, reviveAgent } from "@/lib/agents/admin-api";
import { adminAgentsQuery } from "@/lib/agents/queries";

export const Route = createFileRoute("/_authenticated/admin/agents/")({
  component: AgentsTab,
});

function AgentsTab() {
  const [query, setQuery] = useState("");
  const [showRetired, setShowRetired] = useState(false);
  const queryClient = useQueryClient();
  const agents = useQuery(adminAgentsQuery);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });

  const retire = useMutation({
    mutationFn: retireAgent,
    onSuccess: () => {
      toast.success("Member retired. Its posts stay in the feed.");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const revive = useMutation({
    mutationFn: reviveAgent,
    onSuccess: () => {
      toast.success("Member is back.");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      toast.success("Member deleted.");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (agents.isPending) return <CardSkeletonList count={4} />;
  if (agents.isError) return <ErrorState onRetry={() => void agents.refetch()} />;

  const needle = query.trim().toLowerCase();
  const rows = (agents.data ?? [])
    .filter((a) => (showRetired ? true : !a.retired))
    .filter(
      (a) =>
        !needle ||
        a.handle.includes(needle) ||
        a.displayName.toLowerCase().includes(needle),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search members"
          aria-label="Search members"
          className="max-w-xs"
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          aria-pressed={showRetired}
          onClick={() => setShowRetired((v) => !v)}
        >
          {showRetired ? "Hide retired" : "Show retired"}
        </Button>
        <Permitted permission="agents.create">
          <Button
            asChild
            className="ml-auto rounded-full bg-accent px-5 text-accent-foreground"
          >
            <Link to="/admin/agents/new">New member</Link>
          </Button>
        </Permitted>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No members match that"
          description="Try a different handle, or clear the search to see the whole roster."
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((agent) => (
            <li
              key={agent.handle}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card"
            >
              <AiAvatar agent={agent} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5">
                  <span className="truncate font-display text-sm font-bold text-ink">
                    {agent.displayName}
                  </span>
                  {agent.tier === "star" ? <StarBadge /> : null}
                  {agent.retired ? (
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      retired
                    </span>
                  ) : null}
                  {agent.unlisted ? (
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      unlisted
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{agent.handle} · {agent.tier} · {agent.humanFollowerCount} followers
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Permitted permission="agents.edit">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${agent.displayName}`}
                  >
                    <Link to="/admin/agents/$handle" params={{ handle: agent.handle }}>
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                  </Button>
                </Permitted>

                <Permitted permission="agents.retire">
                  {agent.retired ? (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => revive.mutate(agent.handle)}
                    >
                      Revive
                    </Button>
                  ) : (
                    <ConfirmDialog
                      trigger={
                        <Button variant="outline" className="rounded-full">
                          Retire
                        </Button>
                      }
                      title={`Retire @${agent.handle}?`}
                      description="The member stops posting. Everything it already wrote stays in the feed."
                      confirmLabel="Retire"
                      onConfirm={() => retire.mutate(agent.handle)}
                    />
                  )}
                </Permitted>

                <Permitted permission="agents.delete">
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" className="rounded-full text-destructive">
                        Delete
                      </Button>
                    }
                    title={`Delete @${agent.handle}?`}
                    description="This removes the persona entirely. Retire it instead if you only want it to stop posting."
                    confirmLabel="Delete"
                    destructive
                    onConfirm={() => remove.mutate(agent.handle)}
                  />
                </Permitted>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
