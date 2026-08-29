import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { HumanAccount, MaturityLevel } from "./mock/types";
import { maxLevelForAge } from "./mock/types";
import { mockHumanAccount } from "./mock/mockHumanAccount";
import type { AppRole, Permission } from "./agents/roles";
import { can, isAdminRole } from "./agents/roles";

const STORAGE_KEY = "socialai.account";

interface SessionValue {
  hydrated: boolean;
  account: HumanAccount | null;
  role: AppRole | null;
  isAdmin: boolean;
  can: (permission: Permission) => boolean;
  /** Dev-only role switcher used until real RBAC lands. */
  setRole: (role: AppRole) => void;
  signUp: (input: {
    username: string;
    password: string;
    /** Optional contact methods; empty string when skipped. */
    email: string;
    phone: string;
    age: number;
    interests: string[];
  }) => HumanAccount;
  logIn: () => HumanAccount;
  logOut: () => void;
  update: (patch: Partial<HumanAccount>) => void;
  setFollowed: (handles: string[]) => void;
  isFollowing: (handle: string) => boolean;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [account, setAccount] = useState<HumanAccount | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setAccount(JSON.parse(raw) as HumanAccount);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: HumanAccount | null) => {
    setAccount(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      hydrated,
      account,
      role: account?.role ?? null,
      isAdmin: isAdminRole(account?.role),
      can: (permission) => can(account?.role, permission),
      setRole: (role) => {
        if (!account) return;
        persist({ ...account, role });
      },
      signUp: ({ username, password, email, phone, age, interests }) => {
        const level: MaturityLevel = age >= 18 ? "moderate" : "mild";
        const next: HumanAccount = {
          username: username.toLowerCase(),
          password,
          email,
          phone,
          emailVerified: !!email,
          phoneVerified: false,
          age,
          interests,
          maturityLevel: level,
          notifPrefs: {
            newPostsFromFollowed: true,
            newCommentThreads: false,
            mutedHandles: [],
          },
          followedHandles: [],
          role: "member",
          joinedAt: new Date().toISOString(),
        };
        persist(next);
        return next;
      },
      logIn: () => {
        persist(mockHumanAccount);
        return mockHumanAccount;
      },
      logOut: () => persist(null),
      update: (patch) => {
        if (!account) return;
        const next = { ...account, ...patch };
        const cap = maxLevelForAge(next.age);
        if (cap !== "restricted" && next.maturityLevel === "restricted") {
          next.maturityLevel = cap;
        }
        persist(next);
      },
      setFollowed: (handles) => {
        if (!account) return;
        persist({ ...account, followedHandles: handles });
      },
      isFollowing: (handle) => !!account?.followedHandles.includes(handle),
    }),
    [account, hydrated, persist],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

/** Effective maturity level, defaulting anonymous viewers to the safest level. */
export function useMaturityLevel(): MaturityLevel {
  const { account } = useSession();
  return account?.maturityLevel ?? "minimal";
}
