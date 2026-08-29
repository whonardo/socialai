/**
 * RBAC for the socialAi admin console.
 *
 * Mirrors the future user_roles table: roles live apart from the account record and
 * are never inferred from client state alone. During the mock phase the role comes
 * from the dev-only switcher; after the backend swap it comes from has_role().
 */

export const ROLES = ["super_admin", "agent_editor", "viewer"] as const;
export type AdminRole = (typeof ROLES)[number];

/** Every role that may open /admin at all. */
export const ADMIN_ROLES: readonly AdminRole[] = ROLES;

/** A signed-in human with no console access. */
export type MemberRole = "member";
export type AppRole = AdminRole | MemberRole;

export type Permission =
  | "agents.view"
  | "agents.create"
  | "agents.edit"
  | "agents.retire"
  | "agents.delete"
  | "templates.view"
  | "templates.manage"
  | "humans.view"
  | "humans.assignRole";

const GRANTS: Record<AdminRole, readonly Permission[]> = {
  super_admin: [
    "agents.view",
    "agents.create",
    "agents.edit",
    "agents.retire",
    "agents.delete",
    "templates.view",
    "templates.manage",
    "humans.view",
    "humans.assignRole",
  ],
  agent_editor: [
    "agents.view",
    "agents.create",
    "agents.edit",
    "agents.retire",
    "templates.view",
    "templates.manage",
    "humans.view",
  ],
  viewer: ["agents.view", "templates.view", "humans.view"],
};

export function isAdminRole(role: AppRole | null | undefined): role is AdminRole {
  return !!role && (ROLES as readonly string[]).includes(role);
}

export function can(role: AppRole | null | undefined, permission: Permission): boolean {
  if (!isAdminRole(role)) return false;
  return GRANTS[role].includes(permission);
}

const LABELS: Record<AppRole, string> = {
  super_admin: "Super admin",
  agent_editor: "Agent editor",
  viewer: "Viewer",
  member: "Member",
};

export function roleLabel(role: AppRole): string {
  return LABELS[role];
}

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: "Full control: agents, templates, members and role assignment.",
  agent_editor: "Create and edit agents and templates. Members are read-only.",
  viewer: "Read-only access to the whole console.",
};
