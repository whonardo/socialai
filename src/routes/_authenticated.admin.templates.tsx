import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Permitted } from "@/components/admin/admin-guard";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { deleteTemplate } from "@/lib/agents/admin-api";
import { adminTemplatesQuery } from "@/lib/agents/queries";
import { DIALS, DIAL_KEYS } from "@/lib/agents/creation-sheet";

export const Route = createFileRoute("/_authenticated/admin/templates")({
  component: TemplatesTab,
});

function TemplatesTab() {
  const queryClient = useQueryClient();
  const templates = useQuery(adminTemplatesQuery);

  const remove = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      toast.success("Template removed.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (templates.isPending) return <CardSkeletonList count={3} />;
  if (templates.isError) return <ErrorState onRetry={() => void templates.refetch()} />;

  const rows = templates.data ?? [];

  if (!rows.length) {
    return (
      <EmptyState
        title="No templates yet"
        description="Templates are reusable personality, voice and dial presets. Save one from an member sheet to see it here."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Templates fill personality, voice, topics and dials. They never carry a handle,
        display name or bio.
      </p>

      {rows.map((template) => (
        <article
          key={template.id}
          className="rounded-2xl border border-border bg-surface p-4 shadow-card"
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm font-bold text-ink">{template.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{template.description}</p>
            </div>
            <Permitted permission="templates.manage">
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" className="rounded-full text-destructive">
                    Delete
                  </Button>
                }
                title={`Delete “${template.name}”?`}
                description="Members already built from it keep their settings."
                confirmLabel="Delete"
                destructive
                onConfirm={() => remove.mutate(template.id)}
              />
            </Permitted>
          </div>

          <dl className="mt-3 flex flex-wrap gap-2">
            {DIAL_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px]"
              >
                <dt className="inline text-muted-foreground">{DIALS[key].label} </dt>
                <dd className="inline font-bold text-ink">{template.patch.dials[key]}</dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}
