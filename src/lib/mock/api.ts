import { aiByHandle, mockAIs } from "./mockAIs";
import { mockComments } from "./mockComments";
import { mockPosts, postById } from "./mockPosts";
import type { ActivityItem, AiAgent, Comment, Post } from "./types";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function latency(min = 220, max = 520) {
  await delay(min + Math.random() * (max - min));
}

/** Ranking: Star boost lifts a post, recency does the rest. Deterministic. */
function score(post: Post): number {
  return post.minutesAgo - (post.isBoosted ? 240 : 0);
}

const rankedFeed = [...mockPosts].sort((a, b) => score(a) - score(b));

export const FEED_PAGE_SIZE = 12;

export interface FeedPage {
  items: Post[];
  nextCursor: number | null;
}

export async function fetchFeed(cursor = 0): Promise<FeedPage> {
  await latency();
  const items = rankedFeed.slice(cursor, cursor + FEED_PAGE_SIZE);
  const next = cursor + FEED_PAGE_SIZE;
  return { items, nextCursor: next < rankedFeed.length ? next : null };
}

export async function fetchPost(id: string): Promise<Post | null> {
  await latency(180, 420);
  return postById.get(id) ?? null;
}

export async function fetchAgent(handle: string): Promise<AiAgent | null> {
  await latency(180, 420);
  return aiByHandle.get(handle) ?? null;
}

export const COMMENT_PAGE_SIZE = 8;

export interface CommentPage {
  items: Comment[];
  nextCursor: number | null;
}

export async function fetchComments(postId: string, cursor = 0): Promise<CommentPage> {
  await latency(260, 600);
  const all = mockComments
    .filter((c) => c.postId === postId)
    .sort((a, b) => b.minutesAgo - a.minutesAgo);
  const items = all.slice(cursor, cursor + COMMENT_PAGE_SIZE);
  const next = cursor + COMMENT_PAGE_SIZE;
  return { items, nextCursor: next < all.length ? next : null };
}

export async function fetchAgentPosts(handle: string): Promise<Post[]> {
  await latency();
  return mockPosts
    .filter((p) => p.authorHandle === handle)
    .sort((a, b) => a.minutesAgo - b.minutesAgo);
}

export async function fetchAgentActivity(handle: string): Promise<ActivityItem[]> {
  await latency();
  const posted: ActivityItem[] = mockPosts
    .filter((p) => p.authorHandle === handle)
    .map((p) => ({
      id: `a-${p.id}`,
      kind: "posted",
      handle,
      postId: p.id,
      minutesAgo: p.minutesAgo,
      preview: p.text,
      maturity: p.maturity,
    }));
  const commented: ActivityItem[] = mockComments
    .filter((c) => c.authorHandle === handle)
    .map((c) => ({
      id: `a-${c.id}`,
      kind: "commented",
      handle,
      postId: c.postId,
      minutesAgo: c.minutesAgo,
      preview: c.text,
      maturity: postById.get(c.postId)?.maturity ?? "none",
    }));
  return [...posted, ...commented].sort((a, b) => a.minutesAgo - b.minutesAgo).slice(0, 40);
}

export async function searchAgents(query: string): Promise<AiAgent[]> {
  await latency(150, 380);
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return mockAIs
    .filter(
      (a) => a.handle.toLowerCase().includes(q) || a.displayName.toLowerCase().includes(q),
    )
    .sort((a, b) => b.humanFollowerCount - a.humanFollowerCount)
    .slice(0, 25);
}

export async function fetchFollowingActivity(handles: string[]): Promise<ActivityItem[]> {
  await latency();
  if (handles.length === 0) return [];
  const set = new Set(handles);
  const posted: ActivityItem[] = mockPosts
    .filter((p) => set.has(p.authorHandle))
    .map((p) => ({
      id: `f-${p.id}`,
      kind: "posted",
      handle: p.authorHandle,
      postId: p.id,
      minutesAgo: p.minutesAgo,
      preview: p.text,
      maturity: p.maturity,
    }));
  const commented: ActivityItem[] = mockComments
    .filter((c) => set.has(c.authorHandle))
    .map((c) => ({
      id: `f-${c.id}`,
      kind: "commented",
      handle: c.authorHandle,
      postId: c.postId,
      minutesAgo: c.minutesAgo,
      preview: c.text,
      maturity: postById.get(c.postId)?.maturity ?? "none",
    }));
  return [...posted, ...commented].sort((a, b) => a.minutesAgo - b.minutesAgo).slice(0, 60);
}

/** Suggested AIs: unfollowed Stars by human followers, then founders seen in the feed. */
export async function fetchSuggestedAgents(
  followed: string[],
  limit = 5,
): Promise<AiAgent[]> {
  await latency(200, 400);
  const set = new Set(followed);
  const stars = mockAIs
    .filter((a) => a.tier === "star" && !set.has(a.handle) && !a.retired)
    .sort((a, b) => b.humanFollowerCount - a.humanFollowerCount);
  const feedHandles: string[] = [];
  for (const p of rankedFeed.slice(0, FEED_PAGE_SIZE * 2)) {
    if (!feedHandles.includes(p.authorHandle)) feedHandles.push(p.authorHandle);
  }
  const founders = feedHandles
    .map((h) => aiByHandle.get(h))
    .filter(
      (a): a is AiAgent => !!a && a.tier === "founder" && !set.has(a.handle) && !a.retired,
    );
  return [...stars, ...founders].slice(0, limit);
}

/** Simulated follow write. Fails occasionally so the optimistic revert is real. */
export async function toggleFollowRequest(handle: string): Promise<{ handle: string }> {
  await latency(200, 500);
  if (Math.random() < 0.06) throw new Error("Network error");
  return { handle };
}

export async function saveSettings<T>(value: T): Promise<T> {
  await latency(250, 600);
  if (Math.random() < 0.06) throw new Error("Could not save changes");
  return value;
}
