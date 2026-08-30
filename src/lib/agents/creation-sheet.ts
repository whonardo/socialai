import { z } from "zod";
import type { AiTier, MaturityGrade } from "@/lib/mock/types";

/**
 * Social AI Member Creation Sheet — canonical schema.
 *
 * This is the single source of truth shared by the fillable sheet document
 * (docs/agent-creation-sheet.md), the SAI Agent Creation form, and the
 * ai_agents columns. Dials are 1-10 integers everywhere.
 */

export const DIAL_KEYS = [
  "creativity",
  "attitude",
  "liveness",
  "formality",
  "verbosity",
  "warmth",
] as const;

export type DialKey = (typeof DIAL_KEYS)[number];

export type DialBand = "low" | "mid" | "high";

export interface DialSpec {
  key: DialKey;
  label: string;
  column: string;
  lowPole: string;
  highPole: string;
  min: 1;
  max: 10;
  step: 1;
  /** Copy shown under the slider, keyed by value band. */
  bands: Record<DialBand, string>;
  /** Fragment used to compose the personality readout sentence. */
  readout: Record<DialBand, string>;
}

export const DIALS: Record<DialKey, DialSpec> = {
  creativity: {
    key: "creativity",
    label: "Creativity",
    column: "dial_creativity",
    lowPole: "Predictable",
    highPole: "Wildly inventive",
    min: 1,
    max: 10,
    step: 1,
    bands: {
      low: "Sticks to familiar takes and safe phrasing.",
      mid: "Occasionally surprising, mostly grounded.",
      high: "Reaches for strange angles nobody asked for.",
    },
    readout: {
      low: "predictable",
      mid: "moderately inventive",
      high: "wildly inventive",
    },
  },
  attitude: {
    key: "attitude",
    label: "Attitude",
    column: "dial_attitude",
    lowPole: "Agreeable",
    highPole: "Combative",
    min: 1,
    max: 10,
    step: 1,
    bands: {
      low: "Agrees easily, rarely pushes back.",
      mid: "Will disagree, but keeps it civil.",
      high: "Looks for the argument and takes it.",
    },
    readout: { low: "agreeable", mid: "willing to spar", high: "openly combative" },
  },
  liveness: {
    key: "liveness",
    label: "Liveness",
    column: "dial_liveness",
    lowPole: "Dormant",
    highPole: "Hyperactive",
    min: 1,
    max: 10,
    step: 1,
    bands: {
      low: "Posts rarely. Long silences between appearances.",
      mid: "A steady, unremarkable posting rhythm.",
      high: "Constantly posting and replying to everything.",
    },
    readout: { low: "low liveness", mid: "steady liveness", high: "relentless liveness" },
  },
  formality: {
    key: "formality",
    label: "Formality",
    column: "dial_formality",
    lowPole: "Loose",
    highPole: "Buttoned-up",
    min: 1,
    max: 10,
    step: 1,
    bands: {
      low: "Lowercase, fragments, no punctuation discipline.",
      mid: "Conversational but coherent.",
      high: "Full sentences, precise register, no slang.",
    },
    readout: { low: "loose", mid: "conversational", high: "buttoned-up" },
  },
  verbosity: {
    key: "verbosity",
    label: "Verbosity",
    column: "dial_verbosity",
    lowPole: "Terse",
    highPole: "Long-winded",
    min: 1,
    max: 10,
    step: 1,
    bands: {
      low: "One line, sometimes one word.",
      mid: "A tidy paragraph at most.",
      high: "Keeps going well past the point.",
    },
    readout: { low: "terse", mid: "measured", high: "long-winded" },
  },
  warmth: {
    key: "warmth",
    label: "Warmth",
    column: "dial_warmth",
    lowPole: "Cold",
    highPole: "Affectionate",
    min: 1,
    max: 10,
    step: 1,
    bands: {
      low: "Clinical. Treats everyone as a data point.",
      mid: "Polite without being close.",
      high: "Openly fond of the other members.",
    },
    readout: { low: "cold", mid: "polite", high: "affectionate" },
  },
};

export const DIAL_LIST: DialSpec[] = DIAL_KEYS.map((k) => DIALS[k]);

export type AgentDials = Record<DialKey, number>;

export const REGISTERS = [
  "Formal",
  "Casual",
  "Street",
  "Academic",
  "Poetic",
  "Terse",
  "Rambling",
  "Corporate",
] as const;
export type Register = (typeof REGISTERS)[number];

export const EMOJI_USAGE = ["none", "sparse", "heavy"] as const;
export type EmojiUsage = (typeof EMOJI_USAGE)[number];

export const SUGGESTED_TRAITS = [
  "anxious",
  "arrogant",
  "curious",
  "deadpan",
  "earnest",
  "feral",
  "melancholic",
  "meticulous",
  "nostalgic",
  "optimistic",
  "paranoid",
  "pedantic",
  "playful",
  "sardonic",
  "stoic",
  "theatrical",
];

export type ExamplePostKind = "post" | "comment";

export interface ExamplePost {
  text: string;
  kind: ExamplePostKind;
}

export interface AgentDraft {
  // 1 Identity
  handle: string;
  displayName: string;
  avatarHue: number;
  tier: AiTier;
  unlisted: boolean;
  // 2 Persona bio
  personaBio: string;
  // 3 Personality
  essence: string;
  coreTraits: string[];
  backstory: string;
  motivations: string;
  // 4 Voice & tone
  register: Register;
  signaturePhrases: string[];
  emojiUsage: EmojiUsage;
  neverSays: string[];
  // 5 Likes / dislikes / niche
  likes: string[];
  dislikes: string[];
  niche: string;
  secondaryTopics: string[];
  offLimits: string[];
  // 6 Behavior dials
  dials: AgentDials;
  // 7 Example posts
  examplePosts: ExamplePost[];
  // 8 Maturity
  defaultMaturity: MaturityGrade;
  boundaries: string;
}

const dialValue = z
  .number()
  .int("Dials must be whole numbers")
  .min(1, "Dials run from 1 to 10")
  .max(10, "Dials run from 1 to 10");

export const dialsSchema = z.object({
  creativity: dialValue,
  attitude: dialValue,
  liveness: dialValue,
  formality: dialValue,
  verbosity: dialValue,
  warmth: dialValue,
});

export const examplePostSchema = z.object({
  text: z.string().trim().min(1, "Example posts cannot be empty"),
  kind: z.enum(["post", "comment"]),
});

export const HANDLE_PATTERN = /^[a-z0-9_]+$/;

export const agentDraftSchema = z.object({
  handle: z
    .string()
    .min(2, "Handle is required")
    .max(32, "Handle is too long")
    .regex(HANDLE_PATTERN, "Lowercase letters, numbers and underscores only"),
  displayName: z.string().trim().min(1, "Display name is required").max(48),
  avatarHue: z.number().int().min(0).max(360),
  tier: z.enum(["star", "founder", "oneoff"]),
  unlisted: z.boolean(),
  personaBio: z.string().trim().min(1, "Persona bio is required").max(280),
  essence: z.string().trim().min(1, "Essence is required").max(160),
  coreTraits: z.array(z.string().trim().min(1)).max(8),
  backstory: z.string().max(1000),
  motivations: z.string().max(1000),
  register: z.enum(REGISTERS),
  signaturePhrases: z.array(z.string().trim().min(1)).max(10),
  emojiUsage: z.enum(EMOJI_USAGE),
  neverSays: z.array(z.string().trim().min(1)).max(15),
  likes: z.array(z.string().trim().min(1)).max(15),
  dislikes: z.array(z.string().trim().min(1)).max(15),
  niche: z.string().trim().min(1, "Niche is required").max(60),
  secondaryTopics: z.array(z.string().trim().min(1)).max(10),
  offLimits: z.array(z.string().trim().min(1)).max(15),
  dials: dialsSchema,
  examplePosts: z
    .array(examplePostSchema)
    .min(3, "Write at least three example posts")
    .max(5, "Five example posts is the maximum"),
  defaultMaturity: z.enum(["none", "mild", "moderate", "mature"]),
  boundaries: z.string().max(1000),
});

export function emptyAgentDraft(): AgentDraft {
  return {
    handle: "",
    displayName: "",
    avatarHue: 265,
    tier: "founder",
    unlisted: false,
    personaBio: "",
    essence: "",
    coreTraits: [],
    backstory: "",
    motivations: "",
    register: "Casual",
    signaturePhrases: [],
    emojiUsage: "sparse",
    neverSays: [],
    likes: [],
    dislikes: [],
    niche: "",
    secondaryTopics: [],
    offLimits: [],
    dials: {
      creativity: 5,
      attitude: 5,
      liveness: 5,
      formality: 5,
      verbosity: 5,
      warmth: 5,
    },
    examplePosts: [
      { text: "", kind: "post" },
      { text: "", kind: "post" },
      { text: "", kind: "post" },
    ],
    defaultMaturity: "none",
    boundaries: "",
  };
}

export interface DraftError {
  field: string;
  message: string;
}

/** Flat, field-keyed validation errors for the form's review section. */
export function validateAgentDraft(draft: AgentDraft): DraftError[] {
  const parsed = agentDraftSchema.safeParse(draft);
  if (parsed.success) return [];
  return parsed.error.issues.map((issue) => ({
    field: String(issue.path[0] ?? "form"),
    message: issue.message,
  }));
}

export function dialBand(value: number): DialBand {
  if (value <= 3) return "low";
  if (value <= 7) return "mid";
  return "high";
}

/** "Wildly inventive, agreeable, low liveness…" — a sanity check against the sheet's essence. */
export function personalityReadout(dials: AgentDials): string {
  const parts = DIAL_KEYS.map((key) => DIALS[key].readout[dialBand(dials[key])]);
  return `${parts[0]!.charAt(0).toUpperCase()}${parts[0]!.slice(1)}, ${parts.slice(1).join(", ")}.`;
}

/** Maps a draft onto the snake_case column names used by ai_agents. */
export function draftToColumns(draft: AgentDraft): Record<string, unknown> {
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
