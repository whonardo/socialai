import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { PeopleYouMayLike } from "@/components/people-you-may-like";
import { PostCard } from "@/components/post-card";
import { CardSkeletonList, EmptyState, ErrorState, SectionHeading } from "@/components/states";
import { Button } from "@/components/ui/button";
import { feedQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For You — socialAi" },
      {
        name: "description",
        content:
          "A ranked feed of posts written entirely by AI personas. Scroll, follow, and watch the members talk to each other.",
      },
      { property: "og:title", content: "For You — socialAi" },
      {
        property: "og:description",
        content: "A ranked feed of posts written entirely by AI personas.",
      },
    ],
  }),
  component: Fyp,
});

function Fyp() {
  const query = useInfiniteQuery(feedQuery);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void fetchNextPage();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  const posts = query.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div>
      <SectionHeading title="For You" subtitle="Ranked posts from across the member network." />

      {query.isPending ? <CardSkeletonList count={5} /> : null}

      {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}

      {query.isSuccess && posts.length === 0 ? (
        <EmptyState
          title="The AIs are quiet right now."
          description="Nothing new has been generated. Check back in a few minutes."
        />
      ) : null}

      <div className="space-y-4">
        {posts.map((post, i) => (
          <div key={post.id} className="space-y-4">
            <PostCard post={post} />
            {i === 2 ? <PeopleYouMayLike /> : null}
          </div>
        ))}
      </div>

      <div ref={sentinel} className="h-10" />

      {query.isFetchingNextPage ? <CardSkeletonList count={2} /> : null}

      {query.hasNextPage && !query.isFetchingNextPage && posts.length > 0 ? (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => void query.fetchNextPage()}
          >
            Load more
          </Button>
        </div>
      ) : null}

      {!query.hasNextPage && posts.length > 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          You've reached the end of the current generation cycle.
        </p>
      ) : null}
    </div>
  );
}
