# FollowSweep – follower tools for Twitch

Search, filter and sort your Twitch followers, then remove the ones you choose in bulk.
TH / EN, Twitch-style dark UI, secure server-side login.

> Not affiliated with or endorsed by Twitch Interactive, Inc.

## Setup

1. **Register a Twitch app** at <https://dev.twitch.tv/console> → *Register Your Application*
   - OAuth Redirect URL: `http://localhost:3000/api/auth/callback`
   - Category: *Application Integration* · Client Type: *Confidential*
2. **Fill in `.env.local`** (copy from `.env.example`): `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`.
   `SESSION_SECRET` must be 32+ random characters:
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
3. `npm install` then `npm run dev` → <http://localhost:3000>

For production, set the same variables on your host (e.g. Vercel), set `APP_URL` to your
domain, and add `https://your-domain/api/auth/callback` as a redirect URL in the Twitch console.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm test` | Unit tests (filters, sorting, account age) |
| `npm run typecheck` · `npm run lint` | Type check · lint |

## How removal works

Twitch has no "remove follower" API. Blocking a user forces them to unfollow, so each
selected account is **blocked, then immediately unblocked** (`PUT` + `DELETE /helix/users/blocks`).
Any follower can be selected. Roles (Sub, Mod, VIP, Banned, Partner/Affiliate, Staff) are shown as
tags, and the confirmation dialog warns if the selection includes subscribers, moderators or VIPs.

## Filters & sorting

Filters (on top of the table): broadcaster type, account type, username search, subscriber, banned,
profile picture. Sort by clicking the **Account**, **Followed** or **Account created** column headers.

## Project structure

```
src/
├─ app/                      Routes only — thin, no business logic
│  ├─ [lang]/                Locale root (en | th): landing, privacy
│  │  └─ (app)/              Logged-in area: dashboard, followers
│  └─ api/                   auth/login, auth/callback, auth/logout, followers, followers/remove
├─ features/                 One folder per feature
│  ├─ auth/components/       Login button, login error, user menu
│  └─ followers/
│     ├─ components/         FollowersView, FilterBar, FollowerList (virtualized, sortable), dialogs
│     ├─ hooks/              useFollowers, useFollowerFilters, useRemoveQueue
│     └─ lib/                prepare, filters (+ sort), age — pure + unit-tested
├─ components/               Shared UI: ui/ primitives, layout/ (nav, logo, language switch)
├─ server/                   Server-only (import "server-only")
│  ├─ auth/                  session (iron-session), oauth, scopes, guard (withAuth / requireUser)
│  ├─ twitch/                Helix client (retry + rate limit) and typed endpoints
│  ├─ followers/             load + remove services
│  └─ security/              random/state helpers, rate limiter
├─ i18n/                     Locale config, en/th dictionaries, provider
├─ lib/                      env (zod-validated), constants, helpers
├─ types/                    Twitch + API types
└─ proxy.ts                  Locale redirect + optimistic login redirect
tests/                       Vitest unit tests
```

**Adding a feature:** create `src/features/<name>/`, a page under `src/app/[lang]/(app)/<name>/`,
API routes under `src/app/api/<name>/` wrapped in `withAuth`, add strings to both dictionaries,
and a link in `components/layout/app-nav.tsx`.

## Security

- OAuth authorization-code flow on the server; the client secret never reaches the browser.
- Tokens live only in an encrypted, `httpOnly`, `SameSite=Lax` (and `Secure` in production) cookie.
- OAuth `state` is random, time-limited and compared in constant time; `returnTo` only allows local paths.
- Every API route re-checks the session (`withAuth`); the channel id always comes from the session.
- Non-GET requests must come from our own origin (CSRF); logout is POST-only and revokes the token on Twitch.
- Per-user rate limits; Twitch rate-limit headers are respected with automatic back-off.
- Strict security headers (CSP, `frame-ancestors 'none'`, nosniff, HSTS in production).
- No database — follower data is never stored on the server.
