import type { AiAgent } from "@/lib/mock/types";
import type { AgentDraft } from "./creation-sheet";
import {
  createAgentFn,
  deleteAgentFn,
  deleteTemplateFn,
  getAgent,
  listAgents,
  listTemplatesFn,
  saveTemplateFn,
  setAgentRetired,
  updateAgentFn,
} from "./agents.functions";
import { mergeTemplate } from "./templates";
import type { AgentTemplate } from "./templates";
import type { AdminRole } from "./roles";

/**
 * Admin data layer. Every agent read and write goes through server functions
 * that authorise the caller against the user_roles table — the browser never
 * touches ai_agents directly, and never can.
 */

export interface AdminAgent extends AiAgent {
  draft: AgentDraft;
  createdBy: string;
  updatedAt: string;
}

export async function listAdminAgents(): Promise<AdminAgent[]> {
  return (await listAgents()) as AdminAgent[];
}

export async function getAdminAgent(handle: string): Promise<AdminAgent | null> {
  return (await getAgent({ data: { handle } })) as AdminAgent | null;
}

export async function checkHandleAvailable(handle: string): Promise<boolean> {
  const found = await getAgent({ data: { handle } });
  return !found;
}

export async function createAgent(draft: AgentDraft): Promise<AdminAgent> {
  return (await createAgentFn({ data: { draft } })) as AdminAgent;
}

export async function updateAgent(
  handle: string,
  patch: Partial<AgentDraft>,
): Promise<AdminAgent> {
  const existing = await getAdminAgent(handle);
  if (!existing) throw new Error(`No member named @${handle}.`);
  const draft = { ...existing.draft, ...patch };
  return (await updateAgentFn({ data: { handle, draft } })) as AdminAgent;
}

export async function retireAgent(handle: string): Promise<void> {
  await setAgentRetired({ data: { handle, retired: true } });
}

export async function reviveAgent(handle: string): Promise<void> {
  await setAgentRetired({ data: { handle, retired: false } });
}

export async function deleteAgent(handle: string): Promise<void> {
  await deleteAgentFn({ data: { handle } });
}

export async function listTemplates(): Promise<AgentTemplate[]> {
  return await listTemplatesFn();
}

export async function saveTemplate(template: AgentTemplate): Promise<AgentTemplate> {
  return await saveTemplateFn({ data: { template } });
}

export async function deleteTemplate(id: string): Promise<void> {
  await deleteTemplateFn({ data: { id } });
}

/** Pure — no write, no network. */
export function applyTemplate(template: AgentTemplate, draft: AgentDraft): AgentDraft {
  return mergeTemplate(template, draft);
}

/**
 * Member row visible to admins. Deliberately excludes interests and the
 * followed-handle list: one member's mailbox is never readable by another,
 * admins included. Still mock data — member accounts move to the backend next.
 */
export interface AdminMember {
  id: string;
  username: string;
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
    username: "quiet_watcher",
    email: "viewer@socialai.watch",
    age: 27,
    maturityLevel: "moderate",
    followCount: 3,
    joinedAt: "2026-03-14T09:12:00.000Z",
    role: "member",
  },
  {
    id: "usr_0002",
    username: "nadia",
    email: "nadia@socialai.watch",
    age: 34,
    maturityLevel: "restricted",
    followCount: 18,
    joinedAt: "2026-01-04T18:40:00.000Z",
    role: "super_admin",
  },
  {
    id: "usr_0003",
    username: "kit",
    email: "kit@socialai.watch",
    age: 22,
    maturityLevel: "moderate",
    followCount: 7,
    joinedAt: "2026-05-22T12:05:00.000Z",
    role: "agent_editor",
  },
  {
    id: "usr_0004",
    username: "rowan",
    email: "rowan@socialai.watch",
    age: 17,
    maturityLevel: "mild",
    followCount: 2,
    joinedAt: "2026-07-01T07:31:00.000Z",
    role: "member",
  },
  {
    id: "usr_0005",
    username: "ada",
    email: "ada@socialai.watch",
    age: 41,
    maturityLevel: "restricted",
    followCount: 26,
    joinedAt: "2025-11-19T21:14:00.000Z",
    role: "viewer",
  },
];

export async function listMembers(): Promise<AdminMember[]> {
  return members.map((m) => ({ ...m }));
}

export async function assignMemberRole(
  id: string,
  role: AdminMember["role"],
): Promise<AdminMember> {
  const member = members.find((m) => m.id === id);
  if (!member) throw new Error("Member not found.");
  member.role = role;
  return { ...member };
}
