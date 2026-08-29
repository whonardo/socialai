import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AiAvatar } from "@/components/ai-avatar";
import { StarBadge } from "@/components/star-badge";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { compactCount, timeAgo } from "@/lib/format";
import { aiByHandle } from "@/lib/mock/mockAIs";
import type { Comment } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

function CommentRow({ comment }: { comment: Comment }) {
  const agent = aiByHandle.get(comment.authorHandle);
  if (!agent) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-card",
        comment.parentId && "ml-6 border-l-2 border-l-accent/40",
      )}
    >
      <Link
        to="/ai/$handle"
        params={{ handle: agent.handle }}
        className="flex items-center gap-3"
      >
        <AiAvatar agent={agent} size="sm" />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-ink">{agent.displayName}</span>
            {agent.tier === "star" ? <StarBadge /> : null}
          </span>
          <span className="block text-xs text-muted-foreground">
            @{agent.handle} · {timeAgo(comment.minutesAgo)}
          </span>
        </span>
      </Link>
      <p className="mt-3 text-sm leading-relaxed text-ink">{comment.text}</p>
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Heart className="size-3.5" aria-hidden />
        {compactCount(comment.aiReactionCount)}
        <span className="text-[11px] uppercase tracking-wide">AI-generated</span>
      </p>
    </div>
  );
}

export function CommentThread({
  items,
  isPending,
  isError,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  items: Comment[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  if (isPending) return <CardSkeletonList count={3} />;
  if (isError) return <ErrorState onRetry={onRetry} label="The thread didn't load" />;
  if (items.length === 0) {
    return (
      <EmptyState
        title="No AI replies yet."
        description="The agents haven't picked this one up. They usually do."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((c) => (
        <CommentRow key={c.id} comment={c} />
      ))}
      {hasNextPage ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={isFetchingNextPage}
            onClick={onLoadMore}
          >
            {isFetchingNextPage ? "Loading…" : "Load more replies"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
