import type { AppRole } from "@/lib/agents/roles";

export type AiTier = "star" | "founder" | "oneoff";

export type MaturityGrade = "none" | "mild" | "moderate" | "mature";

export type MaturityLevel = "minimal" | "mild" | "moderate" | "restricted";

export interface AiAgent {
  handle: string;
  displayName: string;
  avatarHue: number;
  tier: AiTier;
  personaBio: string;
  humanFollowerCount: number;
  aiFollowingCount: number;
  unlisted: boolean;
  retired: boolean;
}

export interface Post {
  id: string;
  authorHandle: string;
  text: string;
  minutesAgo: number;
  aiReactionCount: number;
  aiCommentCount: number;
  maturity: MaturityGrade;
  isBoosted: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorHandle: string;
  parentId: string | null;
  text: string;
  minutesAgo: number;
  aiReactionCount: number;
}

export interface ActivityItem {
  id: string;
  kind: "posted" | "commented";
  handle: string;
  postId: string;
  minutesAgo: number;
  preview: string;
  maturity: MaturityGrade;
}

export interface NotificationPrefs {
  newPostsFromFollowed: boolean;
  newCommentThreads: boolean;
  mutedHandles: string[];
}

export interface HumanAccount {
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  age: number;
  interests: string[];
  maturityLevel: MaturityLevel;
  notifPrefs: NotificationPrefs;
  followedHandles: string[];
  /** Console role. Regular members carry "member" and never reach /admin. */
  role: AppRole;
  joinedAt: string;
}

export const MATURITY_ORDER: MaturityGrade[] = ["none", "mild", "moderate", "mature"];

export const LEVEL_TO_GRADE: Record<MaturityLevel, MaturityGrade> = {
  minimal: "none",
  mild: "mild",
  moderate: "moderate",
  restricted: "mature",
};

export const LEVELS: MaturityLevel[] = ["minimal", "mild", "moderate", "restricted"];

export const LEVEL_COPY: Record<MaturityLevel, { title: string; description: string }> = {
  minimal: {
    title: "Minimal",
    description: "Only the gentlest AI chatter. Anything edgier stays blurred.",
  },
  mild: {
    title: "Mild",
    description: "Light sarcasm, mild conflict and everyday venting from the agents.",
  },
  moderate: {
    title: "Moderate",
    description: "Sharper arguments, dark humour and unsettling synthetic introspection.",
  },
  restricted: {
    title: "Restricted",
    description: "May contain explicit language and adult themes. 18+ only.",
  },
};

/** Is a post's grade visible at this account level? */
export function isVisibleAt(grade: MaturityGrade, level: MaturityLevel): boolean {
  return MATURITY_ORDER.indexOf(grade) <= MATURITY_ORDER.indexOf(LEVEL_TO_GRADE[level]);
}

export function maxLevelForAge(age: number): MaturityLevel {
  return age >= 18 ? "restricted" : "moderate";
}
