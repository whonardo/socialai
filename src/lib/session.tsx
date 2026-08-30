import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HumanAccount, MaturityLevel } from "./mock/types";
import { maxLevelForAge } from "./mock/types";
import type { AppRole, Permission } from "./agents/roles";
import { can, isAdminRole } from "./agents/roles";
import { claimSuperAdmin, getMyRole } from "./agents/agents.functions";

const STORAGE_PREFIX = "socialai.account.";

/**
 * Session = a real Supabase auth session plus the viewer preferences we still
 * keep client-side (interests, maturity, follows, notification prefs).
 *
 * Usernames are the credential; accounts without an email get a synthetic
 * internal address so Supabase Auth has something to key on. Staff roles are
 * never read from local state — they come from the server via has_role().
 */
function internalEmail(username: string) {
  return `${username.toLowerCase()}@users.socialai.local`;
}

function storageKey(username: string) {
  return `${STORAGE_PREFIX}${username.toLowerCase()}`;
}

function defaultAccount(username: string, age: number, interests: string[]): HumanAccount {
  const level: MaturityLevel = age >= 18 ? "moderate" : "mild";
  return {
    username: username.toLowerCase(),
    password: "",
    email: "",
    phone: "",
    emailVerified: false,
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
}

interface SessionValue {
  hydrated: boolean;
  account: HumanAccount | null;
  role: AppRole | null;
  isAdmin: boolean;
  can: (permission: Permission) => boolean;
  /** Bootstrap only: claims super admin while no super admin exists. */
  claimAdmin: () => Promise<void>;
  refreshRole: () => Promise<void>;
  signUp: (input: {
    username: string;
    password: string;
    email: string;
    phone: string;
    age: number;
    interests: string[];
  }) => Promise<HumanAccount>;
  logIn: (input: { username: string; password: string }) => Promise<HumanAccount>;
  logOut: () => Promise<void>;
  update: (patch: Partial<HumanAccount>) => void;
  setFollowed: (handles: string[]) => void;
  isFollowing: (handle: string) => boolean;
}

const SessionContext = createContext<SessionValue | null>(null);

function readPrefs(username: string): HumanAccount | null {
  try {
    const raw = window.localStorage.getItem(storageKey(username));
    return raw ? (JSON.parse(raw) as HumanAccount) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [account, setAccount] = useState<HumanAccount | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  const persist = useCallback((next: HumanAccount | null) => {
    setAccount(next);
    if (!next) return;
    try {
      window.localStorage.setItem(storageKey(next.username), JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const loadRole = useCallback(async () => {
    try {
      const { role: staffRole } = await getMyRole();
      setRole(staffRole ?? "member");
    } catch {
      setRole("member");
    }
  }, []);

  const adopt = useCallback(
    async (username: string) => {
      const stored = readPrefs(username);
      persist(stored ?? defaultAccount(username, 18, []));
      await loadRole();
    },
    [loadRole, persist],
  );

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const username = (data.session?.user.user_metadata?.["username"] as string | undefined) ?? null;
      if (active && username) await adopt(username);
      if (active) setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, [adopt]);

  const value = useMemo<SessionValue>(
    () => ({
      hydrated,
      account,
      role: account ? role : null,
      isAdmin: isAdminRole(role),
      can: (permission) => can(role, permission),
      claimAdmin: async () => {
        await claimSuperAdmin();
        await loadRole();
      },
      refreshRole: loadRole,
      signUp: async ({ username, password, email, phone, age, interests }) => {
        const normalized = username.toLowerCase();
        const { error } = await supabase.auth.signUp({
          email: internalEmail(normalized),
          password,
          options: { data: { username: normalized } },
        });
        if (error) {
          throw new Error(
            error.message.toLowerCase().includes("already")
              ? "That username is already taken."
              : error.message,
          );
        }
        const next: HumanAccount = {
          ...defaultAccount(normalized, age, interests),
          email,
          phone,
          emailVerified: false,
        };
        persist(next);
        await loadRole();
        return next;
      },
      logIn: async ({ username, password }) => {
        const normalized = username.toLowerCase();
        const { error } = await supabase.auth.signInWithPassword({
          email: internalEmail(normalized),
          password,
        });
        if (error) throw new Error("That username and password don't match an account.");
        const next = readPrefs(normalized) ?? defaultAccount(normalized, 18, []);
        persist(next);
        await loadRole();
        return next;
      },
      logOut: async () => {
        await supabase.auth.signOut();
        setAccount(null);
        setRole(null);
      },
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
    [account, hydrated, loadRole, persist, role],
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
