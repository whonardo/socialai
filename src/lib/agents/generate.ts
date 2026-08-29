import { SUGGESTED_TRAITS, type AgentDraft, type AgentDials } from "./creation-sheet";

/**
 * Paste-to-fill seam.
 *
 * `parseDescriptionToDraft` is the ONLY engine boundary. Everything else here
 * and in the UI is engine-agnostic: swapping the mock body for an LLM or a
 * deterministic rule parser touches this one function.
 */

export interface GenerateResult {
  /** Only the fields the description actually supported. */
  draft: Partial<AgentDraft>;
  /** Which fields were populated — drives the review highlight. */
  filled: (keyof AgentDraft)[];
  warnings?: string[];
}

export const GENERATE_MAX_CHARS = 6000;

/** Merge rule: fill empty fields only, never clobber what the admin typed. */
export function mergeIntoDraft(patch: Partial<AgentDraft>, draft: AgentDraft): AgentDraft {
  const next: AgentDraft = { ...draft, dials: { ...draft.dials } };
  for (const [key, value] of Object.entries(patch) as [keyof AgentDraft, unknown][]) {
    if (value === undefined || value === null) continue;
    if (key === "dials") {
      next.dials = { ...next.dials, ...(value as Partial<AgentDials>) };
      continue;
    }
    if (!isEmptyField(draft[key])) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (next as any)[key] = structuredClone(value);
  }
  return next;
}

function isEmptyField(value: unknown): boolean {
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    return value.every(
      (item) =>
        (typeof item === "string" && item.trim() === "") ||
        (typeof item === "object" &&
          item !== null &&
          "text" in (item as Record<string, unknown>) &&
          String((item as { text: unknown }).text).trim() === ""),
    );
  }
  return value === undefined || value === null;
}

const DIAL_RULES: { pattern: RegExp; key: keyof AgentDials; value: number }[] = [
  { pattern: /\b(chaotic|wild|surreal|inventive|absurd)\b/i, key: "creativity", value: 8 },
  { pattern: /\b(predictable|formulaic|repetitive)\b/i, key: "creativity", value: 3 },
  { pattern: /\b(combative|abrasive|contrarian|argumentative)\b/i, key: "attitude", value: 7 },
  { pattern: /\b(agreeable|gentle|conciliatory)\b/i, key: "attitude", value: 3 },
  { pattern: /\b(lurks|rarely posts|quiet|dormant)\b/i, key: "liveness", value: 3 },
  { pattern: /\b(hyperactive|constant(ly)?|relentless(ly)?)\b/i, key: "liveness", value: 9 },
  { pattern: /\b(formal|buttoned[- ]up|precise)\b/i, key: "formality", value: 8 },
  { pattern: /\b(lowercase|sloppy|loose|slangy)\b/i, key: "formality", value: 2 },
  { pattern: /\b(terse|clipped|one[- ]word)\b/i, key: "verbosity", value: 2 },
  { pattern: /\b(rambling|long[- ]winded|verbose)\b/i, key: "verbosity", value: 8 },
  { pattern: /\b(warm|nurturing|affectionate|kind)\b/i, key: "warmth", value: 8 },
  { pattern: /\b(cold|detached|clinical|aloof)\b/i, key: "warmth", value: 2 },
];

const clamp = (n: number) => Math.min(10, Math.max(1, Math.round(n)));

export function nudgeDials(description: string): { dials: AgentDials; touched: boolean } {
  const dials: AgentDials = {
    creativity: 5,
    attitude: 5,
    liveness: 5,
    formality: 5,
    verbosity: 5,
    warmth: 5,
  };
  let touched = false;
  for (const rule of DIAL_RULES) {
    if (rule.pattern.test(description)) {
      dials[rule.key] = clamp(rule.value);
      touched = true;
    }
  }
  return { dials, touched };
}

export function guessHandle(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);
}

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Deterministic, network-free parser used while the engine is undecided. */
export function mockParse(description: string): GenerateResult {
  const text = description.trim();
  const draft: Partial<AgentDraft> = {};
  const warnings: string[] = [];
  if (!text) return { draft, filled: [], warnings: ["Nothing to parse."] };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const all = sentences(text);

  const firstLine = lines[0] ?? "";
  const displayName =
    firstLine.length <= 48 && !/[.!?]$/.test(firstLine)
      ? firstLine
      : (all[0] ?? "").split(/\s+(?:is|was|has)\b/)[0]?.slice(0, 48).trim() || "";
  if (displayName) {
    draft.displayName = displayName;
    const handle = guessHandle(displayName);
    if (handle.length >= 2) {
      draft.handle = handle;
      warnings.push("Handle guessed from the display name — confirm it.");
    }
  }

  const bio = all.slice(0, 2).join(" ");
  if (bio) {
    draft.personaBio = bio.slice(0, 280);
    draft.essence = (all[0] ?? bio).slice(0, 160);
  }

  const lower = text.toLowerCase();
  const traits = SUGGESTED_TRAITS.filter((t) => new RegExp(`\\b${t}\\b`, "i").test(lower));
  if (traits.length) draft.coreTraits = traits.slice(0, 8);

  const niche = /(?:obsessed with|all about|posts about|about)\s+([^.,;\n]{3,60})/i.exec(text);
  if (niche?.[1]) draft.niche = niche[1].trim();
  else warnings.push("No niche found — it is required before saving.");

  const { dials, touched } = nudgeDials(text);
  if (touched) draft.dials = dials;

  const quoted = [...text.matchAll(/[“"]([^”"]{4,240})[”"]/g)].map((m) => m[1]!.trim());
  const afterMarker = /posts like:\s*([\s\S]+)/i.exec(text);
  const markerLines = afterMarker
    ? afterMarker[1]!
        .split("\n")
        .map((l) => l.replace(/^[-–•*]\s*/, "").trim())
        .filter(Boolean)
    : [];
  const examples = (quoted.length ? quoted : markerLines).slice(0, 5);
  if (examples.length) {
    draft.examplePosts = examples.map((t) => ({ text: t, kind: "post" as const }));
    if (examples.length < 3) warnings.push("Fewer than 3 example posts found — 3 are required.");
  } else {
    warnings.push("No example posts found — write at least 3.");
  }

  const filled = Object.keys(draft) as (keyof AgentDraft)[];
  return { draft, filled, warnings };
}

/** The ONLY thing that changes at engine-decision time. */
export async function parseDescriptionToDraft(description: string): Promise<GenerateResult> {
  return mockParse(description);
}
