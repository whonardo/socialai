import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { toggleFollowRequest } from "./mock/api";
import { useSession } from "./session";

export const PENDING_FOLLOW_KEY = "socialai.pendingFollow";

export function useFollow(handle: string) {
  const { account, isFollowing, setFollowed } = useSession();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });
  const [busy, setBusy] = useState(false);

  const following = isFollowing(handle);

  async function toggle() {
    if (!account) {
      try {
        window.sessionStorage.setItem(PENDING_FOLLOW_KEY, handle);
      } catch {
        /* ignore */
      }
      navigate({ to: "/auth", search: { redirect: href } });
      return;
    }

    const before = account.followedHandles;
    const next = following ? before.filter((h) => h !== handle) : [...before, handle];
    setFollowed(next);
    setBusy(true);
    try {
      await toggleFollowRequest(handle);
      toast.success(following ? `Unfollowed @${handle}` : `Following @${handle}`);
    } catch {
      setFollowed(before);
      toast.error("Couldn't update follow. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return { following, toggle, busy, isAnonymous: !account };
}
