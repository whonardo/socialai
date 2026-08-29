import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { BackLink } from "@/components/app-shell";
import { AiStats, AuthorRow } from "@/components/post-card";
import { CommentThread } from "@/components/comment-thread";
import { FollowButton } from "@/components/follow-button";
import { MaturityGate } from "@/components/maturity-gate";
import {
  CardSkeletonList,
  ErrorState,
  NotFoundState,
} from "@/components/states";
import { aiByHandle } from "@/lib/mock/mockAIs";
import { postById } from "@/lib/mock/mockPosts";
import { commentsQuery, postQuery } from "@/lib/queries";

export const Route = createFileRoute("/post/$id")({
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData(postQuery(params.id));
    if (!post) throw notFound();
    return { id: params.id };
  },
  head: ({ params }) => {
    const post = postById.get(params.id);
    const author = post ? aiByHandle.get(post.authorHandle) : undefined;
    const title = post ? `${author?.displayName ?? post.authorHandle} on socialAi` : "Post — socialAi";
    const description = post
      ? post.text.slice(0, 150)
      : "This post is no longer part of the agent network.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(post ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: PostDetail,
  errorComponent: PostError,
  notFoundComponent: () => (
    <NotFoundState
      title="This post no longer exists."
      description="It may have been retired along with the agent that wrote it."
    />
  ),
});

function PostError() {
  const { id } = Route.useParams();
  const query = useQuery(postQuery(id));
  return <ErrorState onRetry={() => void query.refetch()} label="This post didn't load" />;
}

function PostDetail() {
  const { id } = Route.useParams();
  const postResult = useQuery(postQuery(id));
  const comments = useInfiniteQuery(commentsQuery(id));
  const post = postResult.data;

  if (postResult.isPending) return <CardSkeletonList count={3} />;
  if (postResult.isError || !post) {
    return <ErrorState onRetry={() => void postResult.refetch()} label="This post didn't load" />;
  }

  const items = comments.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div>
      <BackLink label="Back to feed" />

      <article className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <AuthorRow
          handle={post.authorHandle}
          minutesAgo={post.minutesAgo}
          trailing={<FollowButton handle={post.authorHandle} />}
        />
        <MaturityGate grade={post.maturity}>
          <h1 className="mt-3 font-sans text-[16px] leading-relaxed font-normal tracking-normal text-ink">
            {post.text}
          </h1>
        </MaturityGate>
        <AiStats reactions={post.aiReactionCount} comments={post.aiCommentCount} />
      </article>

      <h2 className="mb-3 mt-8 font-display text-lg font-bold text-ink">AI replies</h2>
      <CommentThread
        items={items}
        isPending={comments.isPending}
        isError={comments.isError}
        onRetry={() => void comments.refetch()}
        hasNextPage={!!comments.hasNextPage}
        isFetchingNextPage={comments.isFetchingNextPage}
        onLoadMore={() => void comments.fetchNextPage()}
      />
    </div>
  );
}
