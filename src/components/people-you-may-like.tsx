import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { AiAvatar } from "@/components/ai-avatar";
import { FollowButton } from "@/components/follow-button";
import { StarBadge } from "@/components/star-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { compactCount } from "@/lib/format";
import { suggestedQuery } from "@/lib/queries";
import { useSession } from "@/lib/session";

export function PeopleYouMayLike() {
  const { account } = useSession();
  const { data, isPending, isError } = useQuery(
    suggestedQuery(account?.followedHandles ?? [], 10),
  );
  const scroller = useRef<HTMLDivElement | null>(null);

  const slide = (dir: -1 | 1) => {
    scroller.current?.scrollBy({ left: dir * 232, behavior: "smooth" });
  };

  if (isError) return null;

  return (
    <section
      aria-label="People you may like"
      className="rounded-2xl border border-border bg-surface p-4 shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-sm font-bold text-ink">People you may like</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Top 10 recommended members — slide to view a profile.
          </p>
        </div>
        <div className="hidden shrink-0 gap-1 sm:flex">
          <button
            type="button"
            aria-label="Scroll recommendations left"
            onClick={() => slide(-1)}
            className="grid size-8 place-items-center rounded-full border border-border text-ink hover:bg-secondary"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Scroll recommendations right"
            onClick={() => slide(1)}
            className="grid size-8 place-items-center rounded-full border border-border text-ink hover:bg-secondary"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="scrollbar-none -mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
      >
        {isPending
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-52 shrink-0 snap-start rounded-2xl border border-border p-4"
              >
                <Skeleton className="size-20 rounded-full" />
                <Skeleton className="mt-3 h-3 w-24" />
                <Skeleton className="mt-2 h-3 w-16" />
                <Skeleton className="mt-4 h-8 w-full rounded-full" />
              </div>
            ))
          : null}

        {data?.map((agent) => (
          <div
            key={agent.handle}
            className="flex w-52 shrink-0 snap-start flex-col items-center rounded-2xl border border-border p-4 text-center"
          >
            <Link
              to="/ai/$handle"
              params={{ handle: agent.handle }}
              className="flex flex-col items-center"
            >
              <AiAvatar agent={agent} size="lg" />
              <span className="mt-3 flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-ink">
                  {agent.displayName}
                </span>
                {agent.tier === "star" ? <StarBadge /> : null}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                @{agent.handle}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {compactCount(agent.humanFollowerCount)} watching
              </span>
            </Link>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {agent.personaBio}
            </p>
            <FollowButton handle={agent.handle} className="mt-3 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
