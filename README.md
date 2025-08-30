# GetCommits — GitHub Repository Explorer

A small, responsive web app to browse repository info, branches and commits from GitHub (public + private). Designed as a polished glass-morphism UI demo and a small production-friendly pattern using a server-side proxy for private PAT handling.

This repository contains:
- Frontend (Vite + ES modules) in `src/`
- Minimal demo server (Node + Express) in `server/` for proxying requests using a short-lived session token
- Tests: Jest (unit) and Cypress (E2E)
- Dockerfiles for static site and server
- CI workflow to build and test

Important security note:
- Do NOT store Personal Access Tokens (PATs) in localStorage or commit them. For production, always use a server-side proxy to keep tokens on the server and return a short-lived session identifier to the client.

Quickstart (frontend only)
1. Install:
   npm install

2. Dev:
   npm run dev
   Open http://localhost:5173

3. Build:
   npm run build
   Preview:
   npm run preview

Using the app
- Public tab: enter owner and repo (e.g. `octocat/Hello-World`) and click Search.
- Private tab (demo): paste a PAT (scope: `repo` for private repos), owner and repo, click Search. THIS DEMO STORES THE TOKEN IN sessionStorage — only for local testing!

Recommended production setup
- Use the included minimal server at `server/`:
  - POST /api/session  { token } -> returns short-lived session id
  - Proxy endpoints under /api/ for repo/branches/commits which use the server-stored token
- Client sends token only to server once; server stores in-memory or in a secure store for TTL and performs GitHub API requests.
- Use HTTPS, set strict Content-Security-Policy, and never log tokens.

Server demo
- Start server:
  cd server
  npm install
  NODE_ENV=development node index.js
- By default it listens on port 3000.
- Update `src/js/store/state.js` -> `config.proxyBase = 'http://localhost:3000/api'` to use proxy for private requests.

Docker
- Static site Dockerfile: builds Vite and serves with nginx. See `Dockerfile` at root.
- Server Dockerfile in `server/Dockerfile`.

Testing
- Unit tests (Jest):
  npm run test
- E2E (Cypress):
  npm run cypress:open

Accessibility & Security
- Escape all external strings before inserting into the DOM.
- Loading and error states are shown.
- Rate-limit handling: the client reads GitHub rate limit headers and presents friendly messages (see service code).
- CSP header is included in `index.html` as a baseline.

Migration / Future work
- Provide an Angular + TypeScript migration plan (recommended in docs).
- Add caching with ETag handling, dark/light theme, commit expand/collapse and search suggestions.

Files of interest
- src/index.html — entry HTML
- src/styles/style.css — design (glass-morphism)
- src/js/app.js — wiring & UI interactions
- src/js/services/githubService.js — GitHub API wrapper with error handling
- src/js/ui/uiRenderer.js — safe rendering helpers
- src/js/auth/tokenManager.js — sessionStorage demo token manager
- server/index.js — minimal proxy example

If you'd like, I can:
- Wire the proxy config into the UI so you can toggle proxy without editing code.
- Provide a full Angular+TS migration scaffold.
- Add CI deployment to S3/CloudFront or ECS example.

License: MIT