import { describe, expect, it } from "vitest";
import { emptyAgentDraft } from "./creation-sheet";
import { guessHandle, mergeIntoDraft, mockParse, nudgeDials } from "./generate";

describe("mock parser", () => {
  const description = [
    "Oracle of Noise",
    "A doom-pilled weather forecaster who is never wrong. It is obsessed with amateur meteorology.",
    "Deadpan and paranoid, it lurks for days then posts a single cold line.",
    'Posts like: "the barometer is lying again"',
  ].join("\n");

  it("guesses identity and flags the handle", () => {
    const result = mockParse(description);
    expect(result.draft.displayName).toBe("Oracle of Noise");
    expect(result.draft.handle).toBe("oracle_of_noise");
    expect(result.warnings?.some((w) => /guessed/i.test(w))).toBe(true);
  });

  it("matches known traits and the niche", () => {
    const result = mockParse(description);
    expect(result.draft.coreTraits).toEqual(expect.arrayContaining(["deadpan", "paranoid"]));
    expect(result.draft.niche).toMatch(/meteorology/i);
  });

  it("nudges dials from keywords and clamps to 1-10", () => {
    const { dials } = nudgeDials("chaotic, combative, hyperactive, cold, terse, formal");
    expect(dials.creativity).toBe(8);
    expect(dials.attitude).toBe(7);
    expect(dials.liveness).toBe(9);
    expect(dials.warmth).toBe(2);
    for (const value of Object.values(dials)) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    }
  });

  it("defaults every dial to 5 without keywords", () => {
    const { dials, touched } = nudgeDials("a persona with no adjectives at all");
    expect(touched).toBe(false);
    expect(Object.values(dials)).toEqual([5, 5, 5, 5, 5, 5]);
  });

  it("warns when no example posts are found", () => {
    const result = mockParse("Quiet Bot\nIt watches the feed about nothing.");
    expect(result.draft.examplePosts).toBeUndefined();
    expect(result.warnings?.some((w) => /at least 3/i.test(w))).toBe(true);
  });

  it("reports only populated fields in filled", () => {
    const result = mockParse(description);
    expect(result.filled).toEqual(expect.arrayContaining(["displayName", "personaBio"]));
    expect(result.filled).not.toContain("boundaries");
  });

  it("sanitises guessed handles", () => {
    expect(guessHandle("Dr. Sunny D!")).toBe("dr_sunny_d");
  });
});

describe("mergeIntoDraft", () => {
  it("never overwrites a field the admin already filled", () => {
    const draft = { ...emptyAgentDraft(), handle: "mine", niche: "kept" };
    const next = mergeIntoDraft({ handle: "guessed", niche: "other" }, draft);
    expect(next.handle).toBe("mine");
    expect(next.niche).toBe("kept");
  });

  it("fills empty fields, including empty example post rows", () => {
    const draft = emptyAgentDraft();
    const next = mergeIntoDraft(
      {
        displayName: "Oracle",
        examplePosts: [{ text: "hello", kind: "post" }],
        dials: { ...draft.dials, creativity: 9 },
      },
      draft,
    );
    expect(next.displayName).toBe("Oracle");
    expect(next.examplePosts).toHaveLength(1);
    expect(next.dials.creativity).toBe(9);
  });

  it("leaves the original draft untouched", () => {
    const draft = emptyAgentDraft();
    mergeIntoDraft({ displayName: "Oracle" }, draft);
    expect(draft.displayName).toBe("");
  });
});
