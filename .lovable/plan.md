# socialAi — Finish and verify the front-end pages

All routes from the approved plan already exist and every page returns a successful response: `/`, `/search`, `/auth`, `/post/:id`, `/ai/:handle`, `/following`, `/account`, and the three account settings pages. What is left is proving each page actually behaves correctly in the browser and closing the known runtime issues, page by page, with your approval at each step.

## Step 0 — Stabilize the two known runtime issues

Before any page review:

1. **Hydration mismatch on detail pages** — confirm the loader-serialized post/profile data renders identically on server and client; remove any remaining time-based or storage-based value computed during render.
2. **Auth redirect loop** — confirm the `_authenticated` gate redirects exactly once to `/auth?redirect=…` for a signed-out visitor, and that signing in returns to the original page.

Verification is a real browser pass (headless Chromium) capturing console errors and screenshots, not just a status-code check.

## Page-by-page review sequence

Each page gets: a browser pass, a screenshot, fixes for anything off-spec, then a short "how to test this in preview" note. I stop and wait for your approval before moving to the next page.

1. **FYP `/`** — ranked feed, Star badges, inert AI counts, maturity blur, infinite scroll + Load more, skeleton/empty/error.
2. **Post Detail `/post/:id`** — post, inert counts, threaded AI comments, tappable commenter profiles, not-found copy separate from retryable error.
3. **AI Profile `/ai/:handle`** — persona header, Posts/Activity tabs, Follow, not-found copy.
4. **Search `/search`** — debounced persona search, idle/loading/empty/error copy.
5. **Auth `/auth`** — signup and login, validation, pending-follow completion after signup, redirect back.
6. **Following `/following`** — followed-AI rail, activity list, both empty states, unfollow confirmation.
7. **Account hub + Info + Notifications + Content Maturity** — save/revert behavior, toasts, age clamping on the maturity slider, per-AI mute.

## Design conformance checks applied on every page

- Light Looply language: white cards, ~16–20px radius, soft shadow, Quantum Blue ink, Pulse Violet accent (`#5B3FE0` for small violet text).
- 393×852 mobile grid: 20px outer margins, 16px gutters.
- Forbidden components absent everywhere: no comment box, no chat/messaging, no call controls, no center "+" tab, no geo/nearby.
- Reaction and comment counts render as clearly non-tappable, AI-labelled stat text.

## Tests

Vitest + React Testing Library specs co-located with the components they cover, written against the behavior each page review verifies: post card renders inert counts and no comment input, maturity gate blurs above the account level, follow toggles optimistically and reverts on failure, search debounces and shows the correct empty copy, notifications toggles revert on save failure.

## Technical notes

- No backend work in this phase; the mock API in `src/lib/mock/api.ts` keeps its simulated latency and failure paths so loading, error, and retry states stay real.
- Session and follow state stay in the localStorage-backed context, read after hydration.
- Per-route `head()` metadata verified unique per page.
