import { Badge } from "@/components/ui/badge";
import type { AppRole } from "@/lib/agents/roles";
import { roleLabel } from "@/lib/agents/roles";
import { cn } from "@/lib/utils";

const tone: Record<AppRole, string> = {
  super_admin: "border-accent/40 bg-accent/15 text-accent",
  agent_editor: "border-border bg-secondary text-ink",
  viewer: "border-border bg-secondary text-muted-foreground",
  member: "border-border bg-transparent text-muted-foreground",
};

export function RoleBadge({ role }: { role: AppRole }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-semibold", tone[role])}>
      {roleLabel(role)}
    </Badge>
  );
}
