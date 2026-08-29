import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFollow } from "@/lib/use-follow";

export function FollowButton({
  handle,
  size = "sm",
  className,
}: {
  handle: string;
  size?: "sm" | "default";
  className?: string;
}) {
  const { following, toggle, busy } = useFollow(handle);

  return (
    <Button
      type="button"
      size={size}
      disabled={busy}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle();
      }}
      className={cn(
        "rounded-full px-4 font-semibold",
        following
          ? "border border-ink bg-transparent text-ink hover:bg-secondary"
          : "bg-accent text-accent-foreground hover:bg-accent/90",
        className,
      )}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
