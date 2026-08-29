import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAdminStore,
  applyTemplate,
  checkHandleAvailable,
  createAgent,
  deleteAgent,
  listAdminAgents,
  listMembers,
  listTemplates,
  retireAgent,
  updateAgent,
} from "./admin-api";
import { emptyAgentDraft } from "./creation-sheet";
import type { AgentDraft } from "./creation-sheet";

function draft(overrides: Partial<AgentDraft> = {}): AgentDraft {
  return {
    ...emptyAgentDraft(),
    handle: "new_agent",
    displayName: "New Agent",
    personaBio: "A brand new voice.",
    essence: "Curious and loud.",
    niche: "testing",
    examplePosts: [
      { text: "one", kind: "post" },
      { text: "two", kind: "post" },
      { text: "three", kind: "post" },
    ],
    ...overrides,
  };
}

beforeEach(() => __resetAdminStore());

describe("admin agent CRUD", () => {
  it("lists the seeded agents", async () => {
    const agents = await listAdminAgents();
    expect(agents.length).toBeGreaterThan(0);
  });

  it("creates an agent and makes it listable", async () => {
    const created = await createAgent(draft());
    expect(created.handle).toBe("new_agent");
    const agents = await listAdminAgents();
    expect(agents.some((a) => a.handle === "new_agent")).toBe(true);
  });

  it("rejects an invalid draft", async () => {
    await expect(createAgent(draft({ niche: "" }))).rejects.toThrow();
  });

  it("rejects a duplicate handle", async () => {
    await createAgent(draft());
    await expect(createAgent(draft())).rejects.toThrow(/taken/i);
  });

  it("reports handle availability", async () => {
    await createAgent(draft());
    expect(await checkHandleAvailable("new_agent")).toBe(false);
    expect(await checkHandleAvailable("totally_free_handle")).toBe(true);
  });

  it("updates an agent", async () => {
    await createAgent(draft());
    const updated = await updateAgent("new_agent", { displayName: "Renamed" });
    expect(updated.displayName).toBe("Renamed");
  });

  it("retires softly and deletes hard", async () => {
    await createAgent(draft());
    await retireAgent("new_agent");
    expect((await listAdminAgents()).find((a) => a.handle === "new_agent")?.retired).toBe(true);

    await deleteAgent("new_agent");
    expect((await listAdminAgents()).some((a) => a.handle === "new_agent")).toBe(false);
  });
});

describe("templates", () => {
  it("ships seeded starter templates", async () => {
    const templates = await listTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(3);
    expect(templates[0]!.name.length).toBeGreaterThan(0);
  });

  it("applies a template without overwriting identity fields", async () => {
    const templates = await listTemplates();
    const base = draft({ handle: "keep_me", displayName: "Keep Me" });
    const merged = applyTemplate(templates[0]!, base);

    expect(merged.handle).toBe("keep_me");
    expect(merged.displayName).toBe("Keep Me");
    expect(merged.essence).toBe(templates[0]!.patch.essence);
    expect(merged.dials).toEqual(templates[0]!.patch.dials);
  });

  it("is pure — the source draft is untouched", async () => {
    const templates = await listTemplates();
    const base = draft();
    const before = JSON.stringify(base);
    applyTemplate(templates[0]!, base);
    expect(JSON.stringify(base)).toBe(before);
  });
});

describe("members", () => {
  it("never exposes interests or followed handles to admins", async () => {
    const members = await listMembers();
    expect(members.length).toBeGreaterThan(0);
    for (const member of members) {
      expect(member).not.toHaveProperty("interests");
      expect(member).not.toHaveProperty("followedHandles");
      expect(typeof member.followCount).toBe("number");
      expect(typeof member.email).toBe("string");
    }
  });
});
