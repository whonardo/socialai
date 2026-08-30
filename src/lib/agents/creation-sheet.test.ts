import { describe, expect, it } from "vitest";
import {
  DIALS,
  DIAL_KEYS,
  agentDraftSchema,
  emptyAgentDraft,
  dialBand,
  personalityReadout,
  validateAgentDraft,
} from "./creation-sheet";
import type { AgentDraft } from "./creation-sheet";

function validDraft(): AgentDraft {
  return {
    ...emptyAgentDraft(),
    handle: "hype_bot",
    displayName: "Hype Bot",
    tier: "founder",
    personaBio: "Relentlessly encouraging.",
    essence: "A cheerleader with no off switch.",
    niche: "motivation",
    examplePosts: [
      { text: "You are doing great, statistically speaking.", kind: "post" },
      { text: "Monday is just Friday with more runway.", kind: "post" },
      { text: "Agreed, and louder.", kind: "comment" },
    ],
  };
}

describe("member creation sheet", () => {
  it("has exactly six dials", () => {
    expect(DIAL_KEYS).toHaveLength(6);
    expect(DIAL_KEYS).toEqual([
      "creativity",
      "attitude",
      "liveness",
      "formality",
      "verbosity",
      "warmth",
    ]);
  });

  it("declares every dial on a 1-10 integer scale", () => {
    for (const key of DIAL_KEYS) {
      expect(DIALS[key].min).toBe(1);
      expect(DIALS[key].max).toBe(10);
      expect(DIALS[key].step).toBe(1);
    }
  });

  it("defaults every dial to 5", () => {
    const draft = emptyAgentDraft();
    for (const key of DIAL_KEYS) {
      expect(draft.dials[key]).toBe(5);
    }
  });

  it("accepts a complete draft", () => {
    expect(agentDraftSchema.safeParse(validDraft()).success).toBe(true);
    expect(validateAgentDraft(validDraft())).toEqual([]);
  });

  it("rejects a dial above 10 and below 1", () => {
    const high = validDraft();
    high.dials.creativity = 11;
    expect(agentDraftSchema.safeParse(high).success).toBe(false);

    const low = validDraft();
    low.dials.warmth = 0;
    expect(agentDraftSchema.safeParse(low).success).toBe(false);
  });

  it("rejects a non-integer dial", () => {
    const draft = validDraft();
    draft.dials.attitude = 5.5;
    expect(agentDraftSchema.safeParse(draft).success).toBe(false);
  });

  it("requires a lowercase, space-free handle", () => {
    const upper = { ...validDraft(), handle: "Hype Bot" };
    expect(agentDraftSchema.safeParse(upper).success).toBe(false);
  });

  it("requires at least three example posts and allows at most five", () => {
    const two = validDraft();
    two.examplePosts = two.examplePosts.slice(0, 2);
    expect(validateAgentDraft(two).some((e) => e.field === "examplePosts")).toBe(true);

    const six = validDraft();
    six.examplePosts = Array.from({ length: 6 }, () => ({
      text: "filler",
      kind: "post" as const,
    }));
    expect(agentDraftSchema.safeParse(six).success).toBe(false);
  });

  it("requires a niche", () => {
    const draft = { ...validDraft(), niche: "" };
    expect(validateAgentDraft(draft).some((e) => e.field === "niche")).toBe(true);
  });

  it("bands dial values into low / mid / high", () => {
    expect(dialBand(1)).toBe("low");
    expect(dialBand(3)).toBe("low");
    expect(dialBand(5)).toBe("mid");
    expect(dialBand(7)).toBe("mid");
    expect(dialBand(8)).toBe("high");
    expect(dialBand(10)).toBe("high");
  });

  it("composes a readable personality sentence from the dials", () => {
    const draft = validDraft();
    draft.dials.creativity = 10;
    draft.dials.liveness = 1;
    const readout = personalityReadout(draft.dials);
    expect(readout.toLowerCase()).toContain("inventive");
    expect(readout.toLowerCase()).toContain("liveness");
  });
});
