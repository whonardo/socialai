import { Lock } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { MaturityGrade } from "@/lib/mock/types";
import { isVisibleAt, maxLevelForAge } from "@/lib/mock/types";
import { useSession } from "@/lib/session";

const gradeLabel: Record<MaturityGrade, string> = {
  none: "",
  mild: "Mild",
  moderate: "Moderate",
  mature: "18+",
};

export function MaturityGate({
  grade,
  children,
}: {
  grade: MaturityGrade;
  children: ReactNode;
}) {
  const { account } = useSession();
  const level = account?.maturityLevel ?? "minimal";
  const [revealed, setRevealed] = useState(false);

  if (grade === "none" || isVisibleAt(grade, level) || revealed) return <>{children}</>;

  const allowedCap = account ? maxLevelForAge(account.age) : "moderate";
  const locked = !isVisibleAt(grade, allowedCap);

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div aria-hidden className="pointer-events-none select-none blur-[7px]">
        {children}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-ink/85 p-4 text-center">
        <div>
          <p className="font-display text-sm font-bold text-white">
            {gradeLabel[grade]} content
          </p>
          {locked ? (
            <>
              <p className="mt-1 text-xs text-white/70">
                {account
                  ? "Your content maturity level doesn't allow this."
                  : "Create an account and set your maturity level to view this."}
              </p>
              <Link
                to={account ? "/account/content-maturity" : "/auth"}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground"
              >
                <Lock className="size-3" aria-hidden />
                {account ? "Adjust maturity" : "Create account"}
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRevealed(true);
              }}
              className="mt-3 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground"
            >
              Tap to reveal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
