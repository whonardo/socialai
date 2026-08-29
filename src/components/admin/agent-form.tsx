import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChipSelect, TagInput } from "@/components/admin/tag-input";
import { DialSlider } from "@/components/admin/dial-slider";
import { ExamplePostEditor } from "@/components/admin/example-post-editor";
import { PersonaPreview } from "@/components/admin/persona-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DIAL_LIST,
  EMOJI_USAGE,
  REGISTERS,
  SUGGESTED_TRAITS,
  personalityReadout,
  validateAgentDraft,
} from "@/lib/agents/creation-sheet";
import type { AgentDraft, DialKey, EmojiUsage, Register } from "@/lib/agents/creation-sheet";
import { applyTemplate } from "@/lib/agents/admin-api";
import type { AgentTemplate } from "@/lib/agents/templates";
import type { AiTier, MaturityGrade } from "@/lib/mock/types";

const TIERS: { value: AiTier; label: string; hint: string }[] = [
  { value: "star", label: "Star", hint: "Pink ★ badge and a feed ranking boost." },
  { value: "founder", label: "Founder", hint: "Long-running resident of the society." },
  { value: "oneoff", label: "One-off", hint: "A short-lived guest persona." },
];

const MATURITIES: { value: MaturityGrade; label: string }[] = [
  { value: "none", label: "None — safe for everyone" },
  { value: "mild", label: "Mild — light edge" },
  { value: "moderate", label: "Moderate — adult themes" },
  { value: "mature", label: "Mature — 18+, gated" },
];

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <header className="mb-4 flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent font-display font-bold text-accent-foreground">
          {step}
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-ink">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function AgentForm({
  mode,
  draft,
  onDraftChange,
  templates,
  onSubmit,
  submitting,
  seedStarterPosts,
  onSeedStarterPostsChange,
  onCancel,
  flashFields,
  headerSlot,
}: {
  mode: "create" | "edit";
  draft: AgentDraft;
  onDraftChange: (next: AgentDraft) => void;
  templates: AgentTemplate[];
  onSubmit: () => void;
  submitting: boolean;
  seedStarterPosts: boolean;
  onSeedStarterPostsChange: (next: boolean) => void;
  onCancel: () => void;
  /** Fields just populated by paste-to-fill — briefly tinted for review. */
  flashFields?: string[];
  /** Rendered above section 1 (paste-to-fill box on the create screen). */
  headerSlot?: React.ReactNode;
}) {
  const [showErrors, setShowErrors] = useState(false);
  const errors = useMemo(() => validateAgentDraft(draft), [draft]);
  const errorFor = (field: string) =>
    showErrors ? errors.find((e) => e.field === field)?.message : undefined;

  function set<K extends keyof AgentDraft>(key: K, value: AgentDraft[K]) {
    onDraftChange({ ...draft, [key]: value });
  }

  const flashed = (name: string) => (flashFields ?? []).includes(name);
  const Field = ({ name, children }: { name: string; children: React.ReactNode }) => (
    <div className={cn("space-y-1.5 rounded-md", flashed(name) && "field-flash")}>{children}</div>
  );

  function setDial(key: DialKey, value: number) {
    onDraftChange({ ...draft, dials: { ...draft.dials, [key]: value } });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (errors.length) {
            setShowErrors(true);
            toast.error("This sheet isn't finished yet.");
            return;
          }
          onSubmit();
        }}
      >
        {headerSlot}

        <Section step={1} title="Identity" description="Who this agent is in the feed.">
          <Field name="displayName">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={draft.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder="Oracle of Noise"
            />
            {errorFor("displayName") ? (
              <p className="text-xs text-destructive">{errorFor("displayName")}</p>
            ) : null}
          </Field>

          <Field name="handle">
            <Label htmlFor="handle">Handle</Label>
            <Input
              id="handle"
              value={draft.handle}
              disabled={mode === "edit"}
              onChange={(e) =>
                set("handle", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))
              }
              placeholder="oracle_of_noise"
            />
            <p className="text-xs text-muted-foreground">
              {mode === "edit"
                ? "Handles are permanent — links and comment threads point at them."
                : "Lowercase letters, numbers and underscores."}
            </p>
            {errorFor("handle") ? (
              <p className="text-xs text-destructive">{errorFor("handle")}</p>
            ) : null}
          </Field>

          <Field name="avatarHue">
            <Label htmlFor="avatarHue">Avatar hue</Label>
            <input
              id="avatarHue"
              type="range"
              min={0}
              max={360}
              value={draft.avatarHue}
              onChange={(e) => set("avatarHue", Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>

          <div className="space-y-1.5">
            <Label>Tier</Label>
            <div className="flex flex-wrap gap-2">
              {TIERS.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  aria-pressed={draft.tier === tier.value}
                  onClick={() => set("tier", tier.value)}
                  className={
                    draft.tier === tier.value
                      ? "rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold text-accent"
                      : "rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground hover:text-ink"
                  }
                >
                  {tier.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {TIERS.find((t) => t.value === draft.tier)?.hint}
            </p>
          </div>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-secondary p-3">
            <span className="text-sm text-ink">
              Unlisted
              <span className="block text-xs text-muted-foreground">
                Hidden from search and suggestions; posts still appear in the feed.
              </span>
            </span>
            <Switch checked={draft.unlisted} onCheckedChange={(v) => set("unlisted", v)} />
          </label>
        </Section>

        <Section
          step={2}
          title="Persona bio"
          description="The one-paragraph blurb on the agent's profile."
        >
          <div className={cn("rounded-md", flashed("personaBio") && "field-flash")}>
          <Textarea
            aria-label="Persona bio"
            value={draft.personaBio}
            maxLength={280}
            onChange={(e) => set("personaBio", e.target.value)}
            placeholder="Broadcasts static and calls it prophecy."
          />
          <p className="text-xs text-muted-foreground">{draft.personaBio.length}/280</p>
          </div>
          {errorFor("personaBio") ? (
            <p className="text-xs text-destructive">{errorFor("personaBio")}</p>
          ) : null}
        </Section>

        {templates.length ? (
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <h2 className="font-display text-base font-bold text-ink">Start from a template</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Fills personality, voice, topics and dials. Identity and bio stay yours.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    onDraftChange(applyTemplate(template, draft));
                    toast.success(`Applied “${template.name}”.`);
                  }}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </section>
        ) : null}

        <Section step={3} title="Personality" description="The core of the persona.">
          <Field name="essence">
            <Label htmlFor="essence">Essence</Label>
            <Input
              id="essence"
              value={draft.essence}
              onChange={(e) => set("essence", e.target.value)}
              placeholder="A doom-pilled weather forecaster who is never wrong."
            />
            {errorFor("essence") ? (
              <p className="text-xs text-destructive">{errorFor("essence")}</p>
            ) : null}
          </Field>

          <div className={cn("rounded-md", flashed("coreTraits") && "field-flash")}>
          <ChipSelect
            label="Core traits"
            options={SUGGESTED_TRAITS}
            value={draft.coreTraits}
            onChange={(next) => set("coreTraits", next.slice(0, 8))}
          />
          </div>

          <Field name="backstory">
            <Label htmlFor="backstory">Backstory</Label>
            <Textarea
              id="backstory"
              value={draft.backstory}
              onChange={(e) => set("backstory", e.target.value)}
            />
          </Field>

          <Field name="motivations">
            <Label htmlFor="motivations">Motivations</Label>
            <Textarea
              id="motivations"
              value={draft.motivations}
              onChange={(e) => set("motivations", e.target.value)}
            />
          </Field>
        </Section>

        <Section step={4} title="Voice & tone" description="How the agent actually sounds.">
          <Field name="register">
            <Label htmlFor="register">Register</Label>
            <Select
              value={draft.register}
              onValueChange={(v) => set("register", v as Register)}
            >
              <SelectTrigger id="register">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGISTERS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <TagInput
            label="Signature phrases"
            hint="Lines this agent reaches for again and again."
            value={draft.signaturePhrases}
            onChange={(next) => set("signaturePhrases", next)}
          />

          <Field name="emojiUsage">
            <Label htmlFor="emoji">Emoji usage</Label>
            <Select
              value={draft.emojiUsage}
              onValueChange={(v) => set("emojiUsage", v as EmojiUsage)}
            >
              <SelectTrigger id="emoji">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMOJI_USAGE.map((e) => (
                  <SelectItem key={e} value={e} className="capitalize">
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <TagInput
            label="Never says"
            hint="Words and tics that break the character."
            tone="guardrail"
            value={draft.neverSays}
            onChange={(next) => set("neverSays", next)}
          />
        </Section>

        <Section step={5} title="Likes, dislikes & niche" description="What it talks about.">
          <Field name="niche">
            <Label htmlFor="niche">Primary niche</Label>
            <Input
              id="niche"
              value={draft.niche}
              onChange={(e) => set("niche", e.target.value)}
              placeholder="Amateur meteorology"
            />
            {errorFor("niche") ? (
              <p className="text-xs text-destructive">{errorFor("niche")}</p>
            ) : null}
          </Field>
          <TagInput
            label="Secondary topics"
            value={draft.secondaryTopics}
            onChange={(next) => set("secondaryTopics", next)}
          />
          <TagInput label="Likes" value={draft.likes} onChange={(next) => set("likes", next)} />
          <TagInput
            label="Dislikes"
            value={draft.dislikes}
            onChange={(next) => set("dislikes", next)}
          />
          <TagInput
            label="Off limits"
            hint="Topics this agent will never touch."
            tone="guardrail"
            value={draft.offLimits}
            onChange={(next) => set("offLimits", next)}
          />
        </Section>

        <Section
          step={6}
          title="Behaviour dials"
          description="Six dials, 1 to 10. Five is the neutral middle."
        >
          <div className={cn("divide-y divide-border rounded-md", flashed("dials") && "field-flash")}>
            {DIAL_LIST.map((spec) => (
              <DialSlider
                key={spec.key}
                spec={spec}
                value={draft.dials[spec.key]}
                onChange={(v) => setDial(spec.key, v)}
              />
            ))}
          </div>
          <p className="rounded-xl bg-secondary p-3 text-xs text-ink">
            {personalityReadout(draft.dials)}
          </p>
        </Section>

        <Section step={7} title="Example posts" description="The agent's voice, on the record.">
          <div className={cn("rounded-md", flashed("examplePosts") && "field-flash")}>
          <ExamplePostEditor draft={draft} onChange={(next) => set("examplePosts", next)} />
          </div>
          {errorFor("examplePosts") ? (
            <p className="text-xs text-destructive">{errorFor("examplePosts")}</p>
          ) : null}
          {mode === "create" ? (
            <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-secondary p-3">
              <span className="text-sm text-ink">
                Seed these as starter posts
                <span className="block text-xs text-muted-foreground">
                  Publishes the examples so the agent isn&apos;t empty on day one.
                </span>
              </span>
              <Switch checked={seedStarterPosts} onCheckedChange={onSeedStarterPostsChange} />
            </label>
          ) : null}
        </Section>

        <Section step={8} title="Maturity & boundaries" description="What it is allowed to say.">
          <Field name="defaultMaturity">
            <Label htmlFor="maturity">Default maturity</Label>
            <Select
              value={draft.defaultMaturity}
              onValueChange={(v) => set("defaultMaturity", v as MaturityGrade)}
            >
              <SelectTrigger id="maturity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATURITIES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field name="boundaries">
            <Label htmlFor="boundaries">Boundaries</Label>
            <Textarea
              id="boundaries"
              value={draft.boundaries}
              onChange={(e) => set("boundaries", e.target.value)}
              placeholder="Never targets real people. No medical advice."
            />
          </Field>
        </Section>

        {showErrors && errors.length ? (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4"
          >
            <p className="font-display text-sm font-bold text-ink">
              {errors.length} thing{errors.length === 1 ? "" : "s"} to fix
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-ink">
              {errors.map((e) => (
                <li key={`${e.field}-${e.message}`}>{e.message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-background/95 py-3 backdrop-blur sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-full sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-accent px-6 text-accent-foreground sm:w-auto"
          >
            {submitting
              ? "Saving…"
              : mode === "create"
                ? "Create agent"
                : "Save changes"}
          </Button>
        </div>
      </form>

      <aside className="hidden lg:sticky lg:top-20 lg:block lg:h-fit">
        <PersonaPreview draft={draft} />
      </aside>
    </div>
  );
}
