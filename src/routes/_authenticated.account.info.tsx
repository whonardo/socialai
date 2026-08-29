import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BackLink } from "@/components/app-shell";
import { SectionHeading } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSettings } from "@/lib/mock/api";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const INTERESTS = [
  "Machine minds",
  "Absurdism",
  "Design",
  "Science",
  "Late-night reading",
  "Drama",
  "Poetry",
  "Doom-scrolling",
];

export const Route = createFileRoute("/_authenticated/account/info")({
  head: () => ({
    meta: [
      { title: "Account info — socialAi" },
      {
        name: "description",
        content: "Update the email, phone, age and interests attached to your socialAi account.",
      },
      { property: "og:title", content: "Account info — socialAi" },
      { property: "og:description", content: "Update your socialAi account details." },
    ],
  }),
  component: AccountInfoPage,
});

function VerificationRow({ label, verified }: { label: string; verified: boolean }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        verified ? "text-accent-text" : "text-muted-foreground",
      )}
    >
      {verified ? (
        <BadgeCheck className="size-3.5" aria-hidden />
      ) : (
        <CircleAlert className="size-3.5" aria-hidden />
      )}
      {label} {verified ? "verified" : "not verified"}
    </p>
  );
}

function AccountInfoPage() {
  const { account, update } = useSession();
  const [email, setEmail] = useState(account?.email ?? "");
  const [phone, setPhone] = useState(account?.phone ?? "");
  const [age, setAge] = useState(String(account?.age ?? ""));
  const [interests, setInterests] = useState<string[]>(account?.interests ?? []);
  const [busy, setBusy] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum < 13 || ageNum > 120) {
      toast.error("Enter a valid age (13 or older).");
      return;
    }
    setBusy(true);
    try {
      await saveSettings({ email, phone, age: ageNum, interests });
      update({ email, phone, age: ageNum, interests });
      toast.success("Account info saved.");
    } catch {
      toast.error("Couldn't save your changes. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <BackLink label="Account" />
      <SectionHeading title="Account info" subtitle="Only used to keep your account reachable." />

      <form className="space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-card" onSubmit={onSave}>
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={`@${account?.username ?? ""}`} readOnly disabled />
          <p className="text-xs text-muted-foreground">Your sign-in name. It can't be changed.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <VerificationRow label="Email" verified={!!account?.emailVerified} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <VerificationRow label="Phone" verified={!!account?.phoneVerified} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="age">Age</Label>
          <Input id="age" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
          <p className="text-xs text-muted-foreground">
            Lowering your age below 18 automatically lowers a Restricted maturity level.
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink">Interests</legend>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => {
              const on = interests.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setInterests((prev) => (on ? prev.filter((x) => x !== i) : [...prev, i]))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    on
                      ? "border-accent bg-accent/15 text-accent-text"
                      : "border-border bg-secondary text-muted-foreground hover:text-ink",
                  )}
                >
                  {i}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
