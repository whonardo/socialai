import { emptyAgentDraft } from "./creation-sheet";
import type { AgentDraft, ExamplePost, Register, EmojiUsage } from "./creation-sheet";
import type { AiTier, MaturityGrade } from "@/lib/mock/types";

/**
 * Pure row <-> draft mapping shared by the server functions and the admin data
 * layer. No Supabase imports here so it stays safe on both sides of the wire.
 */

export interface AgentRow {
  handle: string;
  display_name: string;
  avatar_hue: number;
  tier: AiTier;
  unlisted: boolean;
  retired: boolean;
  persona_bio: string;
  human_follower_count: number;
  ai_following_count: number;
  essence: string;
  core_traits: string[];
  backstory: string;
  motivations: string;
  register: string;
  signature_phrases: string[];
  emoji_usage: string;
  never_says: string[];
  likes: string[];
  dislikes: string[];
  niche: string;
  secondary_topics: string[];
  off_limits: string[];
  dial_creativity: number;
  dial_attitude: number;
  dial_liveness: number;
  dial_formality: number;
  dial_verbosity: number;
  dial_warmth: number;
  example_posts: unknown;
  default_maturity: MaturityGrade;
  boundaries: string;
  created_by: string | null;
  updated_at: string;
}

export function draftToRow(draft: AgentDraft): Record<string, unknown> {
  return {
    handle: draft.handle,
    display_name: draft.displayName,
    avatar_hue: draft.avatarHue,
    tier: draft.tier,
    unlisted: draft.unlisted,
    persona_bio: draft.personaBio,
    essence: draft.essence,
    core_traits: draft.coreTraits,
    backstory: draft.backstory,
    motivations: draft.motivations,
    register: draft.register,
    signature_phrases: draft.signaturePhrases,
    emoji_usage: draft.emojiUsage,
    never_says: draft.neverSays,
    likes: draft.likes,
    dislikes: draft.dislikes,
    niche: draft.niche,
    secondary_topics: draft.secondaryTopics,
    off_limits: draft.offLimits,
    dial_creativity: draft.dials.creativity,
    dial_attitude: draft.dials.attitude,
    dial_liveness: draft.dials.liveness,
    dial_formality: draft.dials.formality,
    dial_verbosity: draft.dials.verbosity,
    dial_warmth: draft.dials.warmth,
    example_posts: draft.examplePosts,
    default_maturity: draft.defaultMaturity,
    boundaries: draft.boundaries,
  };
}

function examplePostsFrom(value: unknown): ExamplePost[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { text?: unknown; kind?: unknown } => !!v && typeof v === "object")
    .map((v) => ({
      text: typeof v.text === "string" ? v.text : "",
      kind: v.kind === "comment" ? ("comment" as const) : ("post" as const),
    }));
}

export function rowToDraft(row: AgentRow): AgentDraft {
  const base = emptyAgentDraft();
  return {
    ...base,
    handle: row.handle,
    displayName: row.display_name,
    avatarHue: row.avatar_hue,
    tier: row.tier,
    unlisted: row.unlisted,
    personaBio: row.persona_bio,
    essence: row.essence,
    coreTraits: row.core_traits ?? [],
    backstory: row.backstory,
    motivations: row.motivations,
    register: (row.register as Register) ?? base.register,
    signaturePhrases: row.signature_phrases ?? [],
    emojiUsage: (row.emoji_usage as EmojiUsage) ?? base.emojiUsage,
    neverSays: row.never_says ?? [],
    likes: row.likes ?? [],
    dislikes: row.dislikes ?? [],
    niche: row.niche,
    secondaryTopics: row.secondary_topics ?? [],
    offLimits: row.off_limits ?? [],
    dials: {
      creativity: row.dial_creativity,
      attitude: row.dial_attitude,
      liveness: row.dial_liveness,
      formality: row.dial_formality,
      verbosity: row.dial_verbosity,
      warmth: row.dial_warmth,
    },
    examplePosts: examplePostsFrom(row.example_posts),
    defaultMaturity: row.default_maturity,
    boundaries: row.boundaries,
  };
}
