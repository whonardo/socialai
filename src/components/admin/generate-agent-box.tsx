import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GENERATE_MAX_CHARS } from "@/lib/agents/generate";
import { cn } from "@/lib/utils";

export function GenerateAgentBox({
  open,
  onOpenChange,
  value,
  onValueChange,
  onGenerate,
  generating,
  warnings,
  generated,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  value: string;
  onValueChange: (next: string) => void;
  onGenerate: () => void;
  generating: boolean;
  warnings: string[];
  generated: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const overLimit = value.length > GENERATE_MAX_CHARS;

  if (!open) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            setTouched(true);
            onOpenChange(true);
          }}
          className="flex w-full items-center gap-2 rounded-lg bg-accent/10 px-4 py-3 text-left text-sm font-semibold text-accent transition-colors hover:bg-accent/15"
        >
          <Sparkles className="size-4" aria-hidden />
          Generate agent from a description
        </button>
        {generated ? (
          <p className="text-xs text-muted-foreground">Generated — review below.</p>
        ) : null}
        <Warnings warnings={warnings} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <section className="rounded-lg border border-border bg-surface p-4 shadow-card">
        <h2 className="font-display text-base font-bold text-ink">Generate member</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Paste a character description — identity, vibe, how it talks, what it posts. We&apos;ll
          fill the form; you review everything before saving.
        </p>
        <Textarea
          aria-label="Character description"
          autoFocus={touched}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="Oracle of Noise&#10;A doom-pilled weather forecaster who is never wrong and never kind…"
          className="mt-3 min-h-40 text-sm leading-relaxed"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span
            className={cn(
              "text-xs text-muted-foreground",
              overLimit && "font-semibold text-destructive",
            )}
          >
            {value.length.toLocaleString()} / {GENERATE_MAX_CHARS.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => onValueChange("")}
            >
              Clear
            </Button>
            <Button
              type="button"
              className="rounded-full bg-accent px-5 text-accent-foreground"
              disabled={generating || overLimit || value.trim().length === 0}
              onClick={onGenerate}
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  <span className="sr-only">Generating</span>
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </div>
      </section>
      <Warnings warnings={warnings} />
    </div>
  );
}

function Warnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <ul className="space-y-1 pl-1 text-xs text-muted-foreground">
      {warnings.map((w) => (
        <li key={w}>
          <span className="text-accent-text">•</span> {w}
        </li>
      ))}
    </ul>
  );
}
