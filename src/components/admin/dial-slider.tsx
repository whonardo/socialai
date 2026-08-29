import { Slider } from "@/components/ui/slider";
import { dialBand } from "@/lib/agents/creation-sheet";
import type { DialSpec } from "@/lib/agents/creation-sheet";

export function DialSlider({
  spec,
  value,
  onChange,
}: {
  spec: DialSpec;
  value: number;
  onChange: (next: number) => void;
}) {
  const band = dialBand(value);
  const id = `dial-${spec.key}`;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="font-display text-sm font-bold text-ink">
          {spec.label}
        </label>
        <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
          {value}
        </span>
      </div>

      <Slider
        id={id}
        className="mt-3"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={[value]}
        onValueChange={([next]) => onChange(next ?? value)}
        aria-label={`${spec.label}: ${spec.lowPole} to ${spec.highPole}`}
        aria-valuetext={`${value} of 10`}
      />

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{spec.lowPole}</span>
        <span>{spec.highPole}</span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{spec.bands[band]}</p>
    </div>
  );
}
