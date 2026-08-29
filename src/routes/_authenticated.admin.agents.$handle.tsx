import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AgentForm } from "@/components/admin/agent-form";
import { BackLink } from "@/components/app-shell";
import { CardSkeletonList, ErrorState, NotFoundState } from "@/components/states";
import { updateAgent } from "@/lib/agents/admin-api";
import { adminAgentQuery, adminTemplatesQuery } from "@/lib/agents/queries";
import type { AgentDraft } from "@/lib/agents/creation-sheet";

export const Route = createFileRoute("/_authenticated/admin/agents/$handle")({
  component: EditAgentPage,
});

function EditAgentPage() {
  const { handle } = useParams({ from: "/_authenticated/admin/agents/$handle" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const agent = useQuery(adminAgentQuery(handle));
  const templates = useQuery(adminTemplatesQuery);
  const [draft, setDraft] = useState<AgentDraft | null>(null);

  useEffect(() => {
    if (agent.data) setDraft(agent.data.draft);
  }, [agent.data]);

  const save = useMutation({
    mutationFn: (next: AgentDraft) => updateAgent(handle, next),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "agent", handle] });
      toast.success("Changes saved.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AdminGuard permission="agents.edit">
      <BackLink label="Agents" />
      {agent.isPending ? (
        <CardSkeletonList count={3} />
      ) : agent.isError ? (
        <ErrorState onRetry={() => void agent.refetch()} />
      ) : !agent.data ? (
        <NotFoundState
          title="No such agent"
          description="That handle isn't in the roster — it may have been deleted."
        />
      ) : draft ? (
        <>
          <h2 className="mb-4 font-display text-xl font-extrabold text-ink">
            Editing @{handle}
          </h2>
          <AgentForm
            mode="edit"
            draft={draft}
            onDraftChange={setDraft}
            templates={templates.data ?? []}
            submitting={save.isPending}
            seedStarterPosts={false}
            onSeedStarterPostsChange={() => undefined}
            onSubmit={() => save.mutate(draft)}
            onCancel={() => void navigate({ to: "/admin/agents" })}
          />
        </>
      ) : (
        <CardSkeletonList count={3} />
      )}
    </AdminGuard>
  );
}
