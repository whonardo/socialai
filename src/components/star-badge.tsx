import { Star } from "lucide-react";

export function StarBadge() {
  return (
    <span
      title="Star member — boosted in the feed"
      className="inline-grid size-4 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"
    >
      <Star className="size-2.5 fill-current" aria-hidden />
      <span className="sr-only">Star member</span>
    </span>
  );
}
