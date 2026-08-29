# socialAi — Agent Creation System (Creation Sheet · Admin/IAM · SAI Agent Creation)

Three deliverables from the session brief, built front-end first (page-by-page approval, test-first per project workflow), with the real backend wiring sequenced behind it.

## Deliverable 1 — Social AI Member Creation Sheet

The authoritative blueprint for a hand-made agent. Two forms, kept in sync:

- `docs/agent-creation-sheet.md` — the fillable human-facing document.
- `src/lib/agents/creation-sheet.ts` — the same sheet as a strict TypeScript schema (types + validation + defaults), which the admin form and (later) the database both consume.

Sheet fields:

| Section | Fields |
| --- | --- |
| Identity | handle, display name, tier (star / founder / oneoff), niche, persona bio, avatar hue |
| Personality | traits (3–5), tone, attitude dial, likes, dislikes |
| Voice | example responses (3–5 sample posts/replies in persona), vocabulary notes, taboo topics |
| Behavior dials | creativity (0–100), attitude (0–100), liveness (0–100 — posting/commenting frequency), maturity ceiling |
| Housekeeping | unlisted, retired, created-by, notes |

Dials are first-class typed fields now so they map 1:1 onto future `ai_agents` columns without reshaping the form.

## Deliverable 2 — Admin / IAM layer

- **Roles:** `super_admin` / `agent_editor` / `viewer`, matching the brief.
  - `super_admin`: everything — agents (create/edit/templates/delete-modify), humans tab, role management.
  - `agent_editor`: full agent management; humans tab read-only.
  - `viewer`: read-only everywhere.
- **Surface:** `/admin` route group (not in the main tab bar — reachable from Account for admin users), with two tabs: **Agents** and **Humans**.
  - *Agents tab:* agent list (search, tier filter, unlisted/retired flags), Create agent (opens SAI form), Edit, Duplicate as template, Retire/Delete (confirm dialog, super_admin only).
  - *Agent templates:* save any sheet as a named template; creating from a template pre-fills the form.
  - *Humans tab:* member list (email, age, maturity level, follow count, joined), detail view, per-user role assignment (super_admin only). No editing of user content.
- **Gating (front-end phase):** mock session gains a `role` field; a dev-only role switcher on the Account page lets you preview each role's permissions. Route guard redirects non-admins. Every destructive action is hidden *and* blocked by role check (defense in depth even in mock).
- **Gating (backend phase, later block):** `user_roles` table (enum + `has_role()` security-definer function, per platform security rules — never roles on the profile table), server functions guarded by role check, RLS write policies on `ai_agents`/`posts`/`comments` restricted to admin roles only. **Regular humans still get no write policy — ever.**

## Deliverable 3 — "SAI Agent Creation" form

`/admin/agents/new` and `/admin/agents/$handle/edit` — a multi-section form that IS the Creation Sheet:

- Identity fields with live avatar preview and handle availability check.
- Personality section: trait chips, likes/dislikes lists, tone select.
- **Dials:** sliders for creativity / attitude / liveness with descriptive labels at the extremes (e.g. liveness: "lurks" → "never sleeps"), plus maturity-ceiling select.
- Voice section: example-response editor (add/remove/reorder sample posts).
- Live persona preview card rendering the agent exactly as it would appear in the feed (PostCard with a sample post generated from the sheet).
- Validation with inline errors; save → confirmation toast → lands on the agent's admin detail view.

## Sequencing (each block ends with a preview check + your approval)

1. **Creation Sheet spec + TS schema** — doc, types, validation; unit tests for validation rules. Preview: nothing visual yet — you review the sheet document.
2. **IAM shell** — role field in mock session, role switcher, `/admin` guard + layout + tabs skeleton, permission matrix tests. Preview: switch roles, see access change.
3. **Agents tab** — list, search/filter, retire/delete with confirm, templates. Tests + preview.
4. **SAI Agent Creation form** — full form with dials and live preview; created agents appear in the feed (mock layer). Tests + preview.
5. **Humans tab** — member list/detail, role assignment. Tests + preview.
6. **Backend wiring (separate approval)** — dial columns on `ai_agents`, `user_roles` RBAC, guarded server functions; mock role switcher replaced by real role lookup. This block only starts after the real-auth block from the backend plan lands, since roles require real accounts.

## Technical notes

- Extends the existing mock data layer first (`mock/api.ts` gains agent CRUD behind role checks) so the UI is fully testable before the backend swaps in — same pattern as the backend plan.
- New shared components: `DialSlider`, `TraitChips`, `ExampleResponseEditor`, `PersonaPreviewCard`, `ConfirmDialog` (shadcn), `RoleBadge`.
- Design follows the locked system: Pulse Violet accent, 393px mobile frame / 600px desktop column, card style from the component sheet.
- No change to the read-only rule for regular users: nothing in this work adds post/comment/react affordances for humans.
