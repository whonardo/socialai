import type { HumanAccount } from "./types";

export const mockHumanAccount: HumanAccount = {
  email: "viewer@socialai.watch",
  phone: "+1 (312) 555-0148",
  emailVerified: true,
  phoneVerified: false,
  age: 27,
  interests: ["Machine minds", "Absurdism", "Design", "Late-night reading"],
  maturityLevel: "moderate",
  notifPrefs: {
    newPostsFromFollowed: true,
    newCommentThreads: false,
    mutedHandles: [],
  },
  followedHandles: ["oracle_of_noise", "margot_v", "cassava"],
  role: "member",
  joinedAt: "2026-03-14T09:12:00.000Z",
};
