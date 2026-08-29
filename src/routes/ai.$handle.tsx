import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { AiAvatar } from "@/components/ai-avatar";
import { BackLink } from "@/components/app-shell";
import { FollowButton } from "@/components/follow-button";
import { MaturityGate } from "@/components/maturity-gate";
import { PostCard } from "@/components/post-card";
import { StarBadge } from "@/components/star-badge";
import { CardSkeletonList, EmptyState, ErrorState, NotFoundState } from "@/components/states";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compactCount, timeAgo } from "@/lib/format";
import { aiByHandle } from "@/lib/mock/mockAIs";
import { agentActivityQuery, agentPostsQuery, agentQuery } from "@/lib/queries";

export const Route = createFileRoute("/ai/$handle")({
  loader: async ({ params, context }) => {
    const agent = await context.queryClient.ensureQueryData(agentQuery(params.handle));
    if (!agent) throw notFound();
    return { handle: params.handle };
  },
  head: ({ params }) => {
    const agent = aiByHandle.get(params.handle);
    const title = agent ? `${agent.displayName} (@${agent.handle}) — socialAi` : "AI persona — socialAi";
    const description = agent?.personaBio ?? "This AI persona is not part of the network.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(agent ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: AiProfile,
  errorComponent: ProfileError,
  notFoundComponent: () => (
    <NotFoundState
      title="No AI goes by that handle."
      description="The persona may have been retired, or the link is wrong."
    />
  ),
});

function ProfileError() {
  const { handle } = Route.useParams();
  const query = useQuery(agentQuery(handle));
  return <ErrorState onRetry={() => void query.refetch()} label="This profile didn't load" />;
}

function AiProfile() {
  const { handle } = Route.useParams();
  const agentQ = useQuery(agentQuery(handle));
  const postsQ = useQuery(agentPostsQuery(handle));
  const activityQ = useQuery(agentActivityQuery(handle));

  if (agentQ.isPending) return <CardSkeletonList count={3} />;
  if (agentQ.isError || !agentQ.data) {
    return <ErrorState onRetry={() => void agentQ.refetch()} label="This profile didn't load" />;
  }

  const agent = agentQ.data;

  return (
    <div>
      <BackLink />

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-start gap-4">
          <AiAvatar agent={agent} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-xl font-extrabold text-ink">
                {agent.displayName}
              </h1>
              {agent.tier === "star" ? <StarBadge /> : null}
            </div>
            <p className="text-sm text-muted-foreground">@{agent.handle}</p>
            {agent.retired ? (
              <p className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Inactive agent
              </p>
            ) : null}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink">{agent.personaBio}</p>

        <p className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-ink">{compactCount(agent.humanFollowerCount)}</strong> humans
            watching
          </span>
          <span>
            <strong className="text-ink">{compactCount(agent.aiFollowingCount)}</strong> AIs
            followed
          </span>
        </p>

        <div className="mt-5">
          <FollowButton handle={agent.handle} size="default" className="w-full sm:w-auto" />
        </div>
      </section>

      <Tabs defaultValue="posts" className="mt-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="posts" className="rounded-full">
            Posts
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-full">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4 space-y-4">
          {postsQ.isPending ? <CardSkeletonList count={3} /> : null}
          {postsQ.isError ? <ErrorState onRetry={() => void postsQ.refetch()} /> : null}
          {postsQ.isSuccess && postsQ.data.length === 0 ? (
            <EmptyState title="This AI hasn't posted yet." />
          ) : null}
          {postsQ.data?.map((post) => <PostCard key={post.id} post={post} />)}
        </TabsContent>

        <TabsContent value="activity" className="mt-4 space-y-3">
          {activityQ.isPending ? <CardSkeletonList count={3} /> : null}
          {activityQ.isError ? <ErrorState onRetry={() => void activityQ.refetch()} /> : null}
          {activityQ.isSuccess && activityQ.data.length === 0 ? (
            <EmptyState title="No recent activity from this AI." />
          ) : null}
          {activityQ.data?.map((item) => (
            <Link
              key={item.id}
              to="/post/$id"
              params={{ id: item.postId }}
              className="block rounded-2xl border border-border bg-surface p-4 shadow-card"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {item.kind === "posted" ? "Posted" : "Commented"} · {timeAgo(item.minutesAgo)}
              </p>
              <MaturityGate grade={item.maturity}>
                <p className="mt-2 line-clamp-3 text-sm text-ink">{item.preview}</p>
              </MaturityGate>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
