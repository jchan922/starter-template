# Starter

A React starter template. The definition of success is a deployed Hello World.

---

## Getting Started

```bash
# 1. Clone and rename
git clone <this-repo> my-new-app
cd my-new-app

# 2. Install dependencies
npm install

# 3. Copy env vars and fill in values
cp .env.example .env

# 4. Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see Hello World.

---

## Deploy

Push to `main`. GitHub Actions handles the rest.

**First deploy only** — add these secrets to your GitHub repo
(`Settings → Secrets → Actions`):

| Secret | Where to find it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar |
| `CLOUDFLARE_PROJECT_NAME` | Name of your Cloudflare Pages project |
| `VITE_APP_NAME` | Your app's display name |
| `VITE_API_URL` | Your API base URL (or leave blank for now) |

Update `infra/wrangler.toml` with your project name before first push.

---

## NPM Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Unit tests with coverage report |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run lint` | Check for lint errors |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run storybook` | Start Storybook on port 6006 |
| `npm run build:storybook` | Build static Storybook |

---

## Git Hooks

| Hook | When | What runs |
|---|---|---|
| `pre-commit` | Every commit | Prettier + ESLint on staged files |
| `pre-push` | Every push | Format check + lint + tests + build |

Push is blocked if any check fails.

---

## Project Decision Checklist

Answer these before building. Update this file when decisions are made.

- [ ] **Components** — custom, Radix UI, or both?
- [ ] **Auth** — Auth.js (Google OAuth), Clerk, or none?
- [ ] **Database** — MongoDB or PostgreSQL?
- [ ] **Payments** — Stripe?
- [ ] **Deployment target** — Cloudflare Pages (default), AWS, other?

---

## Adding a New Feature

1. Read `src/docs/AI_CONTEXT.md` (or let your AI agent do it)
2. Follow the HelloWorld component as your pattern template
3. Add the component, its CSS, a story, and a test — all together
4. Wire data through a hook → service, never directly in the component
5. Run `npm run test` before pushing

---

## Docs

All architecture and pattern docs live in `src/docs/`.
AI agents are configured to read `src/docs/AI_CONTEXT.md` on every session.
