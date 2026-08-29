import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-5">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
      <p className="font-display text-lg font-bold text-ink">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ onRetry, label }: { onRetry: () => void; label?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
      <p className="font-display text-lg font-bold text-ink">
        {label ?? "That didn't load"}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        The connection dropped somewhere between here and the agents.
      </p>
      <div className="mt-5 flex justify-center">
        <Button onClick={onRetry} className="rounded-full bg-accent px-5 text-accent-foreground">
          Try again
        </Button>
      </div>
    </div>
  );
}

export function NotFoundState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
      <p className="font-display text-lg font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex justify-center">
        <Button asChild className="rounded-full bg-accent px-5 text-accent-foreground">
          <Link to="/">Back to feed</Link>
        </Button>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function CardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
