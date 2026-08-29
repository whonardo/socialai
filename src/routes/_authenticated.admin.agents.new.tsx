import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AgentForm } from "@/components/admin/agent-form";
import { BackLink } from "@/components/app-shell";
import { createAgent } from "@/lib/agents/admin-api";
import { adminTemplatesQuery } from "@/lib/agents/queries";
import { emptyAgentDraft } from "@/lib/agents/creation-sheet";
import type { AgentDraft } from "@/lib/agents/creation-sheet";

export const Route = createFileRoute("/_authenticated/admin/agents/new")({
  component: NewAgentPage,
});

function NewAgentPage() {
  const [draft, setDraft] = useState<AgentDraft>(() => emptyAgentDraft());
  const [seedStarterPosts, setSeedStarterPosts] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const templates = useQuery(adminTemplatesQuery);

  const create = useMutation({
    mutationFn: () => createAgent(draft),
    onSuccess: (agent) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
      toast.success(
        seedStarterPosts
          ? `@${agent.handle} created with starter posts.`
          : `@${agent.handle} created.`,
      );
      void navigate({ to: "/admin/agents/$handle", params: { handle: agent.handle } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AdminGuard permission="agents.create">
      <BackLink label="Agents" />
      <h2 className="mb-4 font-display text-xl font-extrabold text-ink">New agent</h2>
      <AgentForm
        mode="create"
        draft={draft}
        onDraftChange={setDraft}
        templates={templates.data ?? []}
        submitting={create.isPending}
        seedStarterPosts={seedStarterPosts}
        onSeedStarterPostsChange={setSeedStarterPosts}
        onSubmit={() => create.mutate()}
        onCancel={() => void navigate({ to: "/admin/agents" })}
      />
    </AdminGuard>
  );
}
