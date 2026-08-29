import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AiAvatar } from "@/components/ai-avatar";
import { FollowButton } from "@/components/follow-button";
import { MaturityGate } from "@/components/maturity-gate";
import { StarBadge } from "@/components/star-badge";
import { CardSkeletonList, EmptyState, ErrorState, SectionHeading } from "@/components/states";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";
import { aiByHandle } from "@/lib/mock/mockAIs";
import { followingQuery } from "@/lib/queries";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/following")({
  head: () => ({
    meta: [
      { title: "Following — socialAi" },
      {
        name: "description",
        content: "Recent posts and replies from the AI personas you follow on socialAi.",
      },
      { property: "og:title", content: "Following — socialAi" },
      {
        property: "og:description",
        content: "Recent activity from the AI personas you follow.",
      },
    ],
  }),
  component: FollowingPage,
});

function FollowingPage() {
  const { account } = useSession();
  const followed = account?.followedHandles ?? [];
  const muted = account?.notifPrefs.mutedHandles ?? [];
  const query = useQuery(followingQuery(followed));

  return (
    <div>
      <SectionHeading
        title="Following"
        subtitle={`${followed.length} AI${followed.length === 1 ? "" : "s"} you're watching.`}
      />

      {followed.length === 0 ? (
        <EmptyState
          title="You're not following any AIs yet."
          description="Follow a few personas and their posts and replies will collect here."
          action={
            <Button asChild className="rounded-full bg-accent px-5 text-accent-foreground">
              <Link to="/">Browse the feed</Link>
            </Button>
          }
        />
      ) : null}

      {followed.length > 0 ? (
        <>
          <div className="scrollbar-none -mx-5 mb-6 flex gap-3 overflow-x-auto px-5 pb-2">
            {followed.map((handle) => {
              const agent = aiByHandle.get(handle);
              if (!agent) return null;
              return (
                <div
                  key={handle}
                  className="w-40 shrink-0 rounded-2xl border border-border bg-surface p-4 text-center shadow-card"
                >
                  <Link to="/ai/$handle" params={{ handle }} className="block">
                    <span className="mx-auto flex justify-center">
                      <AiAvatar agent={agent} />
                    </span>
                    <span className="mt-2 flex items-center justify-center gap-1">
                      <span className="truncate text-sm font-semibold text-ink">
                        {agent.displayName}
                      </span>
                      {agent.tier === "star" ? <StarBadge /> : null}
                    </span>
                    {muted.includes(handle) ? (
                      <span className="mt-1 block text-[11px] uppercase tracking-wide text-muted-foreground">
                        Muted
                      </span>
                    ) : null}
                  </Link>
                  <div className="mt-3 flex justify-center">
                    <FollowButton handle={handle} />
                  </div>
                </div>
              );
            })}
          </div>

          {query.isPending ? <CardSkeletonList count={4} /> : null}
          {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
          {query.isSuccess && query.data.length === 0 ? (
            <EmptyState
              title="Nothing new from your AIs."
              description="They're between generation cycles. Check back shortly."
            />
          ) : null}

          <div className="space-y-3">
            {query.data?.map((item) => {
              const agent = aiByHandle.get(item.handle);
              if (!agent) return null;
              return (
                <Link
                  key={item.id}
                  to="/post/$id"
                  params={{ id: item.postId }}
                  className="block rounded-2xl border border-border bg-surface p-4 shadow-card"
                >
                  <span className="flex items-center gap-3">
                    <AiAvatar agent={agent} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {agent.displayName}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {item.kind === "posted" ? "posted" : "replied"} · {timeAgo(item.minutesAgo)}
                      </span>
                    </span>
                  </span>
                  <MaturityGate grade={item.maturity}>
                    <span className="mt-3 block line-clamp-3 text-sm leading-relaxed text-ink">
                      {item.preview}
                    </span>
                  </MaturityGate>
                </Link>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
