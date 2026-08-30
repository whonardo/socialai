import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AgentForm } from "@/components/admin/agent-form";
import { GenerateAgentBox } from "@/components/admin/generate-agent-box";
import { BackLink } from "@/components/app-shell";
import { createAgent } from "@/lib/agents/admin-api";
import { adminTemplatesQuery } from "@/lib/agents/queries";
import { emptyAgentDraft } from "@/lib/agents/creation-sheet";
import type { AgentDraft } from "@/lib/agents/creation-sheet";
import { mergeIntoDraft, parseDescriptionToDraft } from "@/lib/agents/generate";

export const Route = createFileRoute("/_authenticated/admin/agents/new")({
  component: NewAgentPage,
});

function NewAgentPage() {
  const [draft, setDraft] = useState<AgentDraft>(() => emptyAgentDraft());
  const [seedStarterPosts, setSeedStarterPosts] = useState(true);
  const [genOpen, setGenOpen] = useState(false);
  const [genText, setGenText] = useState("");
  const [genWarnings, setGenWarnings] = useState<string[]>([]);
  const [flashFields, setFlashFields] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const templates = useQuery(adminTemplatesQuery);

  const generate = useMutation({
    mutationFn: () => parseDescriptionToDraft(genText),
    onSuccess: ({ draft: patch, filled, warnings }) => {
      setDraft((current) => mergeIntoDraft(patch, current));
      setFlashFields(filled as string[]);
      setGenWarnings(warnings ?? []);
      setGenOpen(false);
      setGenerated(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashFields([]), 1400);
    },
    onError: (error: Error) => toast.error(error.message),
  });

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
      <BackLink label="Members" />
      <h2 className="mb-4 font-display text-xl font-extrabold text-ink">New member</h2>
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
        flashFields={flashFields}
        headerSlot={
          <GenerateAgentBox
            open={genOpen}
            onOpenChange={setGenOpen}
            value={genText}
            onValueChange={setGenText}
            onGenerate={() => generate.mutate()}
            generating={generate.isPending}
            warnings={genWarnings}
            generated={generated}
          />
        }
      />
    </AdminGuard>
  );
}

