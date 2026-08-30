import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { agentDraftSchema } from "./creation-sheet";
import type { AgentDraft } from "./creation-sheet";
import { draftToRow, rowToDraft } from "./agent-row";
import type { AgentRow } from "./agent-row";
import type { AgentTemplate } from "./templates";
import type { AdminRole, Permission } from "./roles";
import { can } from "./roles";

/**
 * Server-side agent administration.
 *
 * Every mutation runs here with the service-role client, because ai_agents has
 * no client write policy by design — humans never write AI content from the
 * browser. Authorisation is decided from the user_roles table via has_role(),
 * never from anything the client sends.
 */

const AGENT_COLUMNS =
  "handle, display_name, avatar_hue, tier, unlisted, retired, persona_bio, human_follower_count, ai_following_count, essence, core_traits, backstory, motivations, register, signature_phrases, emoji_usage, never_says, likes, dislikes, niche, secondary_topics, off_limits, dial_creativity, dial_attitude, dial_liveness, dial_formality, dial_verbosity, dial_warmth, example_posts, default_maturity, boundaries, created_by, updated_at";

export interface AdminAgentDTO {
  handle: string;
  displayName: string;
  avatarHue: number;
  tier: AgentDraft["tier"];
  personaBio: string;
  humanFollowerCount: number;
  aiFollowingCount: number;
  unlisted: boolean;
  retired: boolean;
  draft: AgentDraft;
  createdBy: string;
  updatedAt: string;
}

function toDTO(row: AgentRow): AdminAgentDTO {
  return {
    handle: row.handle,
    displayName: row.display_name,
    avatarHue: row.avatar_hue,
    tier: row.tier,
    personaBio: row.persona_bio,
    humanFollowerCount: row.human_follower_count,
    aiFollowingCount: row.ai_following_count,
    unlisted: row.unlisted,
    retired: row.retired,
    draft: rowToDraft(row),
    createdBy: row.created_by ?? "seed",
    updatedAt: row.updated_at,
  };
}

const ROLE_ORDER: AdminRole[] = ["super_admin", "agent_editor", "viewer"];

type AuthedContext = { supabase: { rpc: (fn: string, args: unknown) => Promise<{ data: unknown }> }; userId: string };

async function roleOf(context: AuthedContext): Promise<AdminRole | null> {
  for (const role of ROLE_ORDER) {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: role,
    });
    if (data === true) return role;
  }
  return null;
}

async function authorize(context: AuthedContext, permission: Permission): Promise<AdminRole> {
  const role = await roleOf(context);
  if (!role || !can(role, permission)) {
    throw new Error("You don't have permission to do that.");
  }
  return role;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** The caller's staff role, or null for ordinary members. */
export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => ({
    role: await roleOf(context as unknown as AuthedContext),
  }));

/**
 * Bootstrap: the first signed-in account may claim super admin while the roster
 * is empty. Once one exists, this is closed and roles are granted by an admin.
 */
export const claimSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const { count, error: countError } = await db
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) throw new Error("A super admin already exists.");
    const { error } = await db
      .from("user_roles")
      .insert({ user_id: context.userId, role: "super_admin" });
    if (error) throw new Error(error.message);
    return { role: "super_admin" as const };
  });

export const listAgents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await authorize(context as unknown as AuthedContext, "agents.view");
    const db = await admin();
    const { data, error } = await db
      .from("ai_agents")
      .select(AGENT_COLUMNS)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as AgentRow[]).map(toDTO);
  });

export const getAgent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { handle: string }) => data)
  .handler(async ({ data, context }) => {
    await authorize(context as unknown as AuthedContext, "agents.view");
    const db = await admin();
    const { data: row, error } = await db
      .from("ai_agents")
      .select(AGENT_COLUMNS)
      .eq("handle", data.handle)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? toDTO(row as unknown as AgentRow) : null;
  });

export const createAgentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { draft: AgentDraft }) => data)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    await authorize(ctx, "agents.create");
    const parsed = agentDraftSchema.safeParse(data.draft);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "This agent sheet isn't complete yet.");
    }
    const db = await admin();
    const { data: row, error } = await db
      .from("ai_agents")
      .insert({ ...draftToRow(data.draft), created_by: ctx.userId })
      .select(AGENT_COLUMNS)
      .single();
    if (error) {
      if (error.code === "23505") throw new Error(`@${data.draft.handle} is already taken.`);
      throw new Error(error.message);
    }
    return toDTO(row as unknown as AgentRow);
  });

export const updateAgentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { handle: string; draft: AgentDraft }) => data)
  .handler(async ({ data, context }) => {
    await authorize(context as unknown as AuthedContext, "agents.edit");
    const parsed = agentDraftSchema.safeParse(data.draft);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "That change isn't valid.");
    }
    const db = await admin();
    const { data: row, error } = await db
      .from("ai_agents")
      .update(draftToRow(data.draft))
      .eq("handle", data.handle)
      .select(AGENT_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return toDTO(row as unknown as AgentRow);
  });

export const setAgentRetired = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { handle: string; retired: boolean }) => data)
  .handler(async ({ data, context }) => {
    await authorize(context as unknown as AuthedContext, "agents.retire");
    const db = await admin();
    const { error } = await db
      .from("ai_agents")
      .update({ retired: data.retired })
      .eq("handle", data.handle);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAgentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { handle: string }) => data)
  .handler(async ({ data, context }) => {
    await authorize(context as unknown as AuthedContext, "agents.delete");
    const db = await admin();
    const { error } = await db.from("ai_agents").delete().eq("handle", data.handle);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listTemplatesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await authorize(context as unknown as AuthedContext, "templates.view");
    const db = await admin();
    const { data, error } = await db
      .from("agent_templates")
      .select("id, name, description, patch")
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as AgentTemplate[];
  });

export const saveTemplateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { template: AgentTemplate }) => data)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    await authorize(ctx, "templates.manage");
    const db = await admin();
    const { error } = await db.from("agent_templates").upsert({
      id: data.template.id,
      name: data.template.name,
      description: data.template.description,
      patch: data.template.patch as unknown as Record<string, unknown>,
      created_by: ctx.userId,
    });
    if (error) throw new Error(error.message);
    return data.template;
  });

export const deleteTemplateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await authorize(context as unknown as AuthedContext, "templates.manage");
    const db = await admin();
    const { error } = await db.from("agent_templates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
