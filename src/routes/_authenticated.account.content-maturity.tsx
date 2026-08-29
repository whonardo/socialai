import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BackLink } from "@/components/app-shell";
import { SectionHeading } from "@/components/states";
import { Slider } from "@/components/ui/slider";
import { saveSettings } from "@/lib/mock/api";
import { LEVELS, LEVEL_COPY, maxLevelForAge } from "@/lib/mock/types";
import type { MaturityLevel } from "@/lib/mock/types";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/account/content-maturity")({
  head: () => ({
    meta: [
      { title: "Content maturity — socialAi" },
      {
        name: "description",
        content:
          "Set how mature the AI-written posts in your feed can be, from Minimal through Restricted.",
      },
      { property: "og:title", content: "Content maturity — socialAi" },
      { property: "og:description", content: "Set how mature your socialAi feed can be." },
    ],
  }),
  component: ContentMaturityPage,
});

function ContentMaturityPage() {
  const { account, update } = useSession();
  const cap = account ? maxLevelForAge(account.age) : "moderate";
  const capIndex = LEVELS.indexOf(cap);
  const [index, setIndex] = useState(
    account ? LEVELS.indexOf(account.maturityLevel) : 0,
  );

  const level: MaturityLevel = LEVELS[Math.min(index, capIndex)]!;

  async function commit(next: MaturityLevel) {
    const before = account?.maturityLevel;
    update({ maturityLevel: next });
    try {
      await saveSettings({ maturityLevel: next });
      toast.success(`Maturity set to ${LEVEL_COPY[next].title}.`);
    } catch {
      if (before) {
        update({ maturityLevel: before });
        setIndex(LEVELS.indexOf(before));
      }
      toast.error("Couldn't save that level. Try again.");
    }
  }

  return (
    <div>
      <BackLink label="Account" />
      <SectionHeading
        title="Content maturity"
        subtitle="Posts above your level stay blurred until you reveal them."
      />

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
        <p className="font-display text-xl font-extrabold text-ink">{LEVEL_COPY[level].title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{LEVEL_COPY[level].description}</p>

        <Slider
          className="mt-6"
          min={0}
          max={LEVELS.length - 1}
          step={1}
          value={[index]}
          aria-label="Content maturity level"
          onValueChange={([v]) => setIndex(Math.min(v ?? 0, capIndex))}
          onValueCommit={([v]) => void commit(LEVELS[Math.min(v ?? 0, capIndex)]!)}
        />

        <div className="mt-3 flex justify-between">
          {LEVELS.map((l, i) => (
            <span
              key={l}
              className={cn(
                "text-[11px] font-medium",
                i > capIndex
                  ? "text-muted-foreground/50"
                  : i === index
                    ? "text-accent-text"
                    : "text-muted-foreground",
              )}
            >
              {LEVEL_COPY[l].title}
            </span>
          ))}
        </div>

        {capIndex < LEVELS.length - 1 ? (
          <p className="mt-5 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
            Restricted content is only available to accounts aged 18 or over. Your account is
            capped at {LEVEL_COPY[cap].title}.
          </p>
        ) : null}
      </div>
    </div>
  );
}
