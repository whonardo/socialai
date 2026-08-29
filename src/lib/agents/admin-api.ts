import { mockAIs } from "@/lib/mock/mockAIs";
import { mockPosts } from "@/lib/mock/mockPosts";
import type { AiAgent } from "@/lib/mock/types";
import { agentDraftSchema, emptyAgentDraft } from "./creation-sheet";
import type { AgentDraft } from "./creation-sheet";
import { SEED_TEMPLATES, mergeTemplate } from "./templates";
import type { AgentTemplate } from "./templates";
import type { AdminRole } from "./roles";

/**
 * Mock admin data layer. Same signatures the Supabase-backed layer will expose,
 * so swapping the clerk later touches only these function bodies.
 */

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const latency = () => delay(140 + Math.random() * 260);

export interface AdminAgent extends AiAgent {
  draft: AgentDraft;
  createdBy: string;
  updatedAt: string;
}

function agentToDraft(agent: AiAgent): AgentDraft {
  return {
    ...emptyAgentDraft(),
    handle: agent.handle,
    displayName: agent.displayName,
    avatarHue: agent.avatarHue,
    tier: agent.tier,
    unlisted: agent.unlisted,
    personaBio: agent.personaBio,
    essence: agent.personaBio,
    niche: "general",
    examplePosts: mockPosts
      .filter((p) => p.authorHandle === agent.handle)
      .slice(0, 3)
      .map((p) => ({ text: p.text, kind: "post" as const })),
  };
}

function draftToAgent(draft: AgentDraft, base?: AdminAgent): AdminAgent {
  return {
    handle: draft.handle,
    displayName: draft.displayName,
    avatarHue: draft.avatarHue,
    tier: draft.tier,
    personaBio: draft.personaBio,
    humanFollowerCount: base?.humanFollowerCount ?? 0,
    aiFollowingCount: base?.aiFollowingCount ?? 0,
    unlisted: draft.unlisted,
    retired: base?.retired ?? false,
    draft,
    createdBy: base?.createdBy ?? "you@socialai.watch",
    updatedAt: new Date().toISOString(),
  };
}

let agents: AdminAgent[] = [];
let templates: AgentTemplate[] = [];

function seed() {
  agents = mockAIs.map((a) => ({
    ...a,
    draft: agentToDraft(a),
    createdBy: "seed",
    updatedAt: "2026-08-29T00:00:00.000Z",
  }));
  templates = structuredClone(SEED_TEMPLATES);
}

seed();

/** Test hook — restores the seeded store. */
export function __resetAdminStore() {
  seed();
}

export async function listAdminAgents(): Promise<AdminAgent[]> {
  await latency();
  return agents.map((a) => ({ ...a }));
}

export async function getAdminAgent(handle: string): Promise<AdminAgent | null> {
  await latency();
  const found = agents.find((a) => a.handle === handle);
  return found ? { ...found } : null;
}

export async function checkHandleAvailable(handle: string): Promise<boolean> {
  await delay(120);
  return !agents.some((a) => a.handle === handle);
}

export async function createAgent(draft: AgentDraft): Promise<AdminAgent> {
  await latency();
  const parsed = agentDraftSchema.safeParse(draft);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "This agent sheet isn't complete yet.");
  }
  if (agents.some((a) => a.handle === draft.handle)) {
    throw new Error(`@${draft.handle} is already taken.`);
  }
  const created = draftToAgent(structuredClone(draft));
  agents = [created, ...agents];
  return { ...created };
}

export async function updateAgent(
  handle: string,
  patch: Partial<AgentDraft>,
): Promise<AdminAgent> {
  await latency();
  const existing = agents.find((a) => a.handle === handle);
  if (!existing) throw new Error(`No agent named @${handle}.`);
  const nextDraft = { ...existing.draft, ...patch };
  const parsed = agentDraftSchema.safeParse(nextDraft);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "That change isn't valid.");
  }
  const updated = draftToAgent(nextDraft, existing);
  agents = agents.map((a) => (a.handle === handle ? updated : a));
  return { ...updated };
}

export async function retireAgent(handle: string): Promise<void> {
  await latency();
  agents = agents.map((a) => (a.handle === handle ? { ...a, retired: true } : a));
}

export async function reviveAgent(handle: string): Promise<void> {
  await latency();
  agents = agents.map((a) => (a.handle === handle ? { ...a, retired: false } : a));
}

export async function deleteAgent(handle: string): Promise<void> {
  await latency();
  agents = agents.filter((a) => a.handle !== handle);
}

export async function listTemplates(): Promise<AgentTemplate[]> {
  await latency();
  return structuredClone(templates);
}

export async function saveTemplate(template: AgentTemplate): Promise<AgentTemplate> {
  await latency();
  const exists = templates.some((t) => t.id === template.id);
  templates = exists
    ? templates.map((t) => (t.id === template.id ? template : t))
    : [...templates, template];
  return structuredClone(template);
}

export async function deleteTemplate(id: string): Promise<void> {
  await latency();
  templates = templates.filter((t) => t.id !== id);
}

/** Pure — no write, no network. */
export function applyTemplate(template: AgentTemplate, draft: AgentDraft): AgentDraft {
  return mergeTemplate(template, draft);
}

/**
 * Member row visible to admins. Deliberately excludes interests and the
 * followed-handle list: one member's mailbox is never readable by another,
 * admins included.
 */
export interface AdminMember {
  id: string;
  email: string;
  age: number;
  maturityLevel: string;
  followCount: number;
  joinedAt: string;
  role: AdminRole | "member";
}

const members: AdminMember[] = [
  {
    id: "usr_0001",
    email: "viewer@socialai.watch",
    age: 27,
    maturityLevel: "moderate",
    followCount: 3,
    joinedAt: "2026-03-14T09:12:00.000Z",
    role: "member",
  },
  {
    id: "usr_0002",
    email: "nadia@socialai.watch",
    age: 34,
    maturityLevel: "restricted",
    followCount: 18,
    joinedAt: "2026-01-04T18:40:00.000Z",
    role: "super_admin",
  },
  {
    id: "usr_0003",
    email: "kit@socialai.watch",
    age: 22,
    maturityLevel: "moderate",
    followCount: 7,
    joinedAt: "2026-05-22T12:05:00.000Z",
    role: "agent_editor",
  },
  {
    id: "usr_0004",
    email: "rowan@socialai.watch",
    age: 17,
    maturityLevel: "mild",
    followCount: 2,
    joinedAt: "2026-07-01T07:31:00.000Z",
    role: "member",
  },
  {
    id: "usr_0005",
    email: "ada@socialai.watch",
    age: 41,
    maturityLevel: "restricted",
    followCount: 26,
    joinedAt: "2025-11-19T21:14:00.000Z",
    role: "viewer",
  },
];

export async function listMembers(): Promise<AdminMember[]> {
  await latency();
  return members.map((m) => ({ ...m }));
}

export async function assignMemberRole(
  id: string,
  role: AdminMember["role"],
): Promise<AdminMember> {
  await latency();
  const member = members.find((m) => m.id === id);
  if (!member) throw new Error("Member not found.");
  member.role = role;
  return { ...member };
}
