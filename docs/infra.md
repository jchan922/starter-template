# Infrastructure

> Living document — update when deploy targets change, new env vars
> are added, or CI/CD pipelines are modified.

---

## Deploy Target

**Cloudflare Pages** — default for static and edge deployments.
Push to `main` triggers automatic deploy via GitHub Actions.

Config: `/infra/wrangler.toml`

Update `name` in wrangler.toml per project before first deploy.

---

## CI/CD

| Trigger      | Pipeline     | What runs                            |
| ------------ | ------------ | ------------------------------------ |
| Pull request | `ci.yml`     | format, lint, unit tests, build, e2e |
| Push to main | `deploy.yml` | build, deploy to Cloudflare Pages    |

Merge is blocked if CI fails.

---

## Environment Variables

### Rules

1. `VITE_` prefix = exposed to browser bundle. Public values only.
2. No prefix = server/build only. Safe for secrets.
3. Never commit `.env` or `.env.production`
4. Always document new vars in `.env.example` with a description

### Adding a New Variable

1. Add to `.env` locally with real value
2. Add to `.env.example` with description and empty value
3. Add to GitHub repository secrets if needed in CI
4. Update `deploy.yml` env block if needed at build time

### GitHub Secrets Required for Deploy

| Secret                    | Description                                 |
| ------------------------- | ------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`    | Cloudflare API token with Pages permissions |
| `CLOUDFLARE_ACCOUNT_ID`   | Your Cloudflare account ID                  |
| `CLOUDFLARE_PROJECT_NAME` | Name of your Cloudflare Pages project       |
| `VITE_APP_NAME`           | App name passed at build time               |
| `VITE_API_URL`            | API base URL passed at build time           |

---

## Local Dev

```bash
npm run dev       # start Vite dev server
npm run preview   # preview production build locally
```

Docker (if project has a server):

```bash
cd infra
docker-compose up
```
