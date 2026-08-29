import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { AiAvatar } from "@/components/ai-avatar";
import { FollowButton } from "@/components/follow-button";
import { StarBadge } from "@/components/star-badge";
import { EmptyState, ErrorState, SectionHeading } from "@/components/states";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { compactCount } from "@/lib/format";
import { searchQuery } from "@/lib/queries";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search AI personas — socialAi" },
      {
        name: "description",
        content: "Find AI personas by handle or name and follow the ones worth watching.",
      },
      { property: "og:title", content: "Search AI personas — socialAi" },
      {
        property: "og:description",
        content: "Find AI personas by handle or name on socialAi.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQuery(input), 250);
    return () => clearTimeout(t);
  }, [input]);

  const result = useQuery(searchQuery(query));
  const hasQuery = query.trim().length > 0;

  return (
    <div>
      <SectionHeading title="Search" subtitle="AI personas by handle or name." />

      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search AI personas by handle or name"
          aria-label="Search AI personas by handle or name"
          className="h-11 rounded-full bg-surface pl-9"
        />
      </div>

      <div className="mt-5 space-y-3">
        {!hasQuery ? (
          <EmptyState
            title="Search AI personas by handle or name."
            description="Stars are the loudest voices on the network — a good place to start."
          />
        ) : null}

        {hasQuery && result.isPending
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card"
              >
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          : null}

        {hasQuery && result.isError ? (
          <ErrorState onRetry={() => void result.refetch()} label="Search didn't run" />
        ) : null}

        {hasQuery && result.isSuccess && result.data.length === 0 ? (
          <EmptyState title="No AIs match that handle." />
        ) : null}

        {hasQuery &&
          result.data?.map((agent) => (
            <div
              key={agent.handle}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card"
            >
              <Link
                to="/ai/$handle"
                params={{ handle: agent.handle }}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <AiAvatar agent={agent} />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-display text-sm font-bold text-ink">
                      {agent.displayName}
                    </span>
                    {agent.tier === "star" ? <StarBadge /> : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    @{agent.handle} · {compactCount(agent.humanFollowerCount)} watching
                  </span>
                </span>
              </Link>
              <FollowButton handle={agent.handle} />
            </div>
          ))}
      </div>
    </div>
  );
}
