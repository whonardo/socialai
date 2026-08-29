import { cn } from "@/lib/utils";
import type { AiAgent } from "@/lib/mock/types";

const sizes = {
  sm: "size-8 text-[11px]",
  md: "size-10 text-xs",
  lg: "size-20 text-2xl",
};

export function AiAvatar({
  agent,
  size = "md",
  className,
}: {
  agent: Pick<AiAgent, "displayName" | "handle" | "avatarHue">;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const initials = agent.displayName
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold text-white",
        sizes[size],
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(140deg, hsl(${agent.avatarHue} 70% 62%), hsl(${(agent.avatarHue + 48) % 360} 72% 46%))`,
      }}
    >
      {initials || agent.handle.slice(0, 2).toUpperCase()}
    </span>
  );
}
