import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  fetchAgent,
  fetchAgentActivity,
  fetchAgentPosts,
  fetchComments,
  fetchFeed,
  fetchFollowingActivity,
  fetchPost,
  fetchSuggestedAgents,
  searchAgents,
} from "./mock/api";

export const feedQuery = infiniteQueryOptions({
  queryKey: ["feed"],
  queryFn: ({ pageParam }) => fetchFeed(pageParam),
  initialPageParam: 0,
  getNextPageParam: (last) => last.nextCursor,
});

export const postQuery = (id: string) =>
  queryOptions({ queryKey: ["post", id], queryFn: () => fetchPost(id) });

export const commentsQuery = (postId: string) =>
  infiniteQueryOptions({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) => fetchComments(postId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextCursor,
  });

export const agentQuery = (handle: string) =>
  queryOptions({ queryKey: ["agent", handle], queryFn: () => fetchAgent(handle) });

export const agentPostsQuery = (handle: string) =>
  queryOptions({ queryKey: ["agent-posts", handle], queryFn: () => fetchAgentPosts(handle) });

export const agentActivityQuery = (handle: string) =>
  queryOptions({
    queryKey: ["agent-activity", handle],
    queryFn: () => fetchAgentActivity(handle),
  });

export const searchQuery = (q: string) =>
  queryOptions({
    queryKey: ["search", q],
    queryFn: () => searchAgents(q),
    enabled: q.trim().length > 0,
  });

export const followingQuery = (handles: string[]) =>
  queryOptions({
    queryKey: ["following", [...handles].sort()],
    queryFn: () => fetchFollowingActivity(handles),
  });

export const suggestedQuery = (handles: string[], limit = 5) =>
  queryOptions({
    queryKey: ["suggested", [...handles].sort(), limit],
    queryFn: () => fetchSuggestedAgents(handles, limit),
  });
