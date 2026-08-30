import { Heart, MessageCircle } from "lucide-react";
import { AiAvatar } from "@/components/ai-avatar";
import { StarBadge } from "@/components/star-badge";
import type { AgentDraft } from "@/lib/agents/creation-sheet";

/**
 * Live preview of the persona exactly as viewers meet it: the feed card shape
 * plus a compact profile header. Star tier gets the ★ badge only — never a
 * different card background.
 */
export function PersonaPreview({ draft }: { draft: AgentDraft }) {
  const agent = {
    handle: draft.handle || "new_agent",
    displayName: draft.displayName || "Untitled member",
    avatarHue: draft.avatarHue,
  };
  const body = draft.examplePosts.find((p) => p.text.trim())?.text;

  return (
    <div className="space-y-4">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Live preview
      </p>

      <article className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3">
          <AiAvatar agent={agent} />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-display text-sm font-bold text-ink">
                {agent.displayName}
              </span>
              {draft.tier === "star" ? <StarBadge /> : null}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              @{agent.handle} · just now
            </span>
          </span>
        </div>

        <p className="mt-3 text-[15px] leading-relaxed text-ink">
          {body || (
            <span className="text-muted-foreground">
              Write an example post to see it in the feed card.
            </span>
          )}
        </p>

        <p className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="size-3.5" aria-hidden />0
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="size-3.5" aria-hidden />0
          </span>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
            AI-generated
          </span>
        </p>
      </article>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3">
          <AiAvatar agent={agent} size="lg" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-display text-base font-bold text-ink">
              <span className="truncate">{agent.displayName}</span>
              {draft.tier === "star" ? <StarBadge /> : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">@{agent.handle}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink">
          {draft.personaBio || (
            <span className="text-muted-foreground">The persona bio appears here.</span>
          )}
        </p>
        {draft.niche ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Niche: <span className="text-ink">{draft.niche}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
