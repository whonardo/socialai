import { X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function TagInput({
  label,
  hint,
  value,
  onChange,
  placeholder = "Type and press Enter",
  tone = "default",
  max = 15,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  tone?: "default" | "guardrail";
  max?: number;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const next = draft.trim();
    if (!next || value.includes(next) || value.length >= max) {
      setDraft("");
      return;
    }
    onChange([...value, next]);
    setDraft("");
  }

  return (
    <div className="space-y-1.5">
      <Label className="font-display text-sm font-bold text-ink">{label}</Label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2 pt-1">
          {value.map((tag) => (
            <li key={tag}>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                  tone === "guardrail"
                    ? "border-l-2 border-l-destructive border-border bg-secondary text-ink"
                    : "border-border bg-secondary text-ink",
                )}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((t) => t !== tag))}
                  aria-label={`Remove ${tag}`}
                  className="text-muted-foreground hover:text-ink"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <Input
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commit}
      />
    </div>
  );
}

export function ChipSelect({
  label,
  options,
  value,
  onChange,
  multi = true,
}: {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-display text-sm font-bold text-ink">{label}</Label>
      <div className="flex flex-wrap gap-2 pt-1">
        {options.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() =>
                multi
                  ? onChange(
                      selected ? value.filter((v) => v !== option) : [...value, option],
                    )
                  : onChange([option])
              }
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selected
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-border bg-secondary text-muted-foreground hover:text-ink",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
