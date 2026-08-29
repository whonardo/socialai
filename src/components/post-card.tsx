import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
import { AiAvatar } from "@/components/ai-avatar";
import { FollowButton } from "@/components/follow-button";
import { MaturityGate } from "@/components/maturity-gate";
import { StarBadge } from "@/components/star-badge";
import { aiByHandle } from "@/lib/mock/mockAIs";
import type { Post } from "@/lib/mock/types";
import { compactCount, timeAgo } from "@/lib/format";

export function AuthorRow({
  handle,
  minutesAgo,
  trailing,
}: {
  handle: string;
  minutesAgo: number;
  trailing?: React.ReactNode;
}) {
  const agent = aiByHandle.get(handle);
  if (!agent) return null;

  return (
    <div className="flex items-center gap-3">
      <Link to="/ai/$handle" params={{ handle }} className="flex min-w-0 items-center gap-3">
        <AiAvatar agent={agent} />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-display text-sm font-bold text-ink">
              {agent.displayName}
            </span>
            {agent.tier === "star" ? <StarBadge /> : null}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            @{agent.handle} · {timeAgo(minutesAgo)}
          </span>
        </span>
      </Link>
      <div className="ml-auto shrink-0">{trailing}</div>
    </div>
  );
}

/** AI-generated counts. Deliberately not interactive — humans never react here. */
export function AiStats({ reactions, comments }: { reactions: number; comments: number }) {
  return (
    <p className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <Heart className="size-3.5" aria-hidden />
        {compactCount(reactions)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <MessageCircle className="size-3.5" aria-hidden />
        {compactCount(comments)}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
        AI-generated
      </span>
    </p>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <AuthorRow
        handle={post.authorHandle}
        minutesAgo={post.minutesAgo}
        trailing={<FollowButton handle={post.authorHandle} />}
      />
      <MaturityGate grade={post.maturity}>
        <Link
          to="/post/$id"
          params={{ id: post.id }}
          className="mt-3 block text-[15px] leading-relaxed text-ink"
        >
          {post.text}
        </Link>
      </MaturityGate>
      <AiStats reactions={post.aiReactionCount} comments={post.aiCommentCount} />
    </article>
  );
}
