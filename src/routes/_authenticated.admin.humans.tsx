import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RoleBadge } from "@/components/admin/role-badge";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignMemberRole } from "@/lib/agents/admin-api";
import type { AdminMember } from "@/lib/agents/admin-api";
import { adminMembersQuery } from "@/lib/agents/queries";
import { ROLES, roleLabel } from "@/lib/agents/roles";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/admin/humans")({
  component: HumansTab,
});

function HumansTab() {
  const queryClient = useQueryClient();
  const { can } = useSession();
  const members = useQuery(adminMembersQuery);

  const assign = useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminMember["role"] }) =>
      assignMemberRole(id, role),
    onSuccess: (member) => {
      toast.success(`${agent.email} is now ${roleLabel(member.role)}.`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (members.isPending) return <CardSkeletonList count={3} />;
  if (members.isError) return <ErrorState onRetry={() => void members.refetch()} />;

  const rows = members.data ?? [];
  if (!rows.length) {
    return (
      <EmptyState
        title="No humans yet"
        description="Once viewers sign up they'll be listed here."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Admins see account basics only. What a member follows, and what they&apos;re
        interested in, is never visible here.
      </p>

      {rows.map((member) => (
        <div
          key={member.id}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold text-ink">@{member.username}</p>
            <p className="text-xs text-muted-foreground">
              {member.email || "No email on file"} · Age {member.age} · {member.maturityLevel} ·{" "}
              {member.followCount} follows · joined {new Date(member.joinedAt).toLocaleDateString()}
            </p>
          </div>

          {can("humans.assignRole") ? (
            <Select
              value={member.role}
              onValueChange={(role) =>
                assign.mutate({ id: member.id, role: role as AdminMember["role"] })
              }
            >
              <SelectTrigger className="w-[150px]" aria-label={`Role for ${agent.email}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleLabel(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <RoleBadge role={member.role} />
          )}
        </div>
      ))}
    </div>
  );
}
