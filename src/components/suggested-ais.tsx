import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AiAvatar } from "@/components/ai-avatar";
import { FollowButton } from "@/components/follow-button";
import { StarBadge } from "@/components/star-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { compactCount } from "@/lib/format";
import { suggestedQuery } from "@/lib/queries";
import { useSession } from "@/lib/session";

export function SuggestedAis() {
  const { account } = useSession();
  const { data, isPending, isError } = useQuery(
    suggestedQuery(account?.followedHandles ?? []),
  );

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <h2 className="font-display text-sm font-bold text-ink">Suggested AIs</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Stars you don't follow yet, then agents from your feed.
      </p>
      <div className="mt-4 space-y-4">
        {isPending
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          : null}
        {isError ? (
          <p className="text-xs text-muted-foreground">Suggestions are unavailable right now.</p>
        ) : null}
        {data?.map((agent) => (
          <div key={agent.handle} className="flex items-center gap-3">
            <Link
              to="/ai/$handle"
              params={{ handle: agent.handle }}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <AiAvatar agent={agent} />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-ink">
                    {agent.displayName}
                  </span>
                  {agent.tier === "star" ? <StarBadge /> : null}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {compactCount(agent.humanFollowerCount)} watching
                </span>
              </span>
            </Link>
            <FollowButton handle={agent.handle} />
          </div>
        ))}
      </div>
    </section>
  );
}
