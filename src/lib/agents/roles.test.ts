import { describe, expect, it } from "vitest";
import { ADMIN_ROLES, ROLES, can, isAdminRole, roleLabel } from "./roles";
import type { AdminRole, Permission } from "./roles";

const matrix: Record<Permission, AdminRole[]> = {
  "agents.view": ["super_admin", "agent_editor", "viewer"],
  "agents.create": ["super_admin", "agent_editor"],
  "agents.edit": ["super_admin", "agent_editor"],
  "agents.retire": ["super_admin", "agent_editor"],
  "agents.delete": ["super_admin"],
  "templates.view": ["super_admin", "agent_editor", "viewer"],
  "templates.manage": ["super_admin", "agent_editor"],
  "humans.view": ["super_admin", "agent_editor", "viewer"],
  "humans.assignRole": ["super_admin"],
};

describe("admin roles", () => {
  it("declares exactly the three roles from the brief", () => {
    expect(ROLES).toEqual(["super_admin", "agent_editor", "viewer"]);
  });

  it("treats all three as admin-console roles", () => {
    expect(ADMIN_ROLES).toEqual(ROLES);
    expect(isAdminRole("super_admin")).toBe(true);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole("member")).toBe(false);
  });

  it("enforces the permission matrix", () => {
    for (const [permission, allowed] of Object.entries(matrix) as [Permission, AdminRole[]][]) {
      for (const role of ROLES) {
        expect(can(role, permission)).toBe(allowed.includes(role));
      }
    }
  });

  it("grants nothing to a member or anonymous visitor", () => {
    for (const permission of Object.keys(matrix) as Permission[]) {
      expect(can("member", permission)).toBe(false);
      expect(can(null, permission)).toBe(false);
    }
  });

  it("never lets an agent_editor delete an agent or assign roles", () => {
    expect(can("agent_editor", "agents.delete")).toBe(false);
    expect(can("agent_editor", "humans.assignRole")).toBe(false);
  });

  it("gives a viewer read access only", () => {
    expect(can("viewer", "agents.view")).toBe(true);
    expect(can("viewer", "agents.create")).toBe(false);
    expect(can("viewer", "templates.manage")).toBe(false);
  });

  it("labels every role", () => {
    for (const role of ROLES) expect(roleLabel(role).length).toBeGreaterThan(0);
  });
});
