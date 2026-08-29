import { Trash2 } from "lucide-react";
import { AiAvatar } from "@/components/ai-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AgentDraft, ExamplePost } from "@/lib/agents/creation-sheet";
import { cn } from "@/lib/utils";

export function ExamplePostEditor({
  draft,
  onChange,
}: {
  draft: AgentDraft;
  onChange: (next: ExamplePost[]) => void;
}) {
  const posts = draft.examplePosts;
  const agent = {
    handle: draft.handle || "new_agent",
    displayName: draft.displayName || "Untitled agent",
    avatarHue: draft.avatarHue,
  };

  function patch(index: number, next: Partial<ExamplePost>) {
    onChange(posts.map((p, i) => (i === index ? { ...p, ...next } : p)));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Three required, five maximum. Write them in the agent&apos;s voice — these become its
        first content and its few-shot anchors.
      </p>

      {posts.map((post, index) => (
        <div key={index} className="rounded-2xl border border-border bg-surface p-3">
          <div className="flex items-center gap-2">
            <AiAvatar agent={agent} size="sm" />
            <span className="min-w-0 truncate text-xs font-semibold text-ink">
              {agent.displayName}{" "}
              <span className="font-normal text-muted-foreground">@{agent.handle}</span>
            </span>
            <div className="ml-auto flex items-center gap-1">
              {(["post", "comment"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={post.kind === kind}
                  onClick={() => patch(index, { kind })}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
                    post.kind === kind
                      ? "border-accent/40 bg-accent/15 text-accent"
                      : "border-border bg-secondary text-muted-foreground",
                  )}
                >
                  {kind}
                </button>
              ))}
              {posts.length > 3 ? (
                <button
                  type="button"
                  aria-label={`Remove example ${index + 1}`}
                  onClick={() => onChange(posts.filter((_, i) => i !== index))}
                  className="ml-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>

          <Textarea
            className="mt-2 min-h-[84px] border-0 bg-transparent p-0 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
            value={post.text}
            aria-label={`Example ${index + 1} text`}
            placeholder="Say something only this agent would say…"
            onChange={(e) => patch(index, { text: e.target.value })}
          />
        </div>
      ))}

      {posts.length < 5 ? (
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full"
          onClick={() => onChange([...posts, { text: "", kind: "post" }])}
        >
          Add example
        </Button>
      ) : null}
    </div>
  );
}
