# Infrastructure

> Living document — update when deploy targets change, new env vars
> are added, or CI/CD pipelines are modified.

---

## Deploy Targets

This template supports two paths. Choose one per project.

### Cloudflare Pages

Zero-ops static + edge functions. Push to `main` deploys automatically via GitHub Actions.

Config: [`/infra/wrangler.toml`](../infra/wrangler.toml)
Deploy command: `pages deploy dist --project-name=${{ secrets.CLOUDFLARE_PROJECT_NAME }}`

Update `name` in [`infra/wrangler.toml`](../infra/wrangler.toml) before first deploy.

**Runtime note:** Server functions run in the CF Workers runtime — no Node.js APIs. Use `Request`/`Response` web standards. The `handler/fetch/model` pattern applies but the adapter layer differs from Node. See [CF Pages Functions docs](https://developers.cloudflare.com/pages/functions/).

### AWS ECS (Terraform)

Containerised Node.js. Full Node runtime — all handler/fetch/model patterns work as-is.

- Write Terraform in `/infra/` to define ECS task, service, ALB, and ECB repository
- Update [`deploy.yml`](../.github/workflows/deploy.yml) to build and push the Docker image and trigger a deployment
- Use [`infra/Dockerfile`](../infra/Dockerfile) as the container definition

---

## CI/CD

| Trigger      | Pipeline                                        | What runs                                   |
| ------------ | ----------------------------------------------- | ------------------------------------------- |
| Pull request | [`ci.yml`](../.github/workflows/ci.yml)         | format, lint, audit, unit tests, build, e2e |
| Push to main | [`deploy.yml`](../.github/workflows/deploy.yml) | build + deploy (target-specific)            |

Merge is blocked if CI fails or if `npm audit` finds high severity vulnerabilities.

---

## Dependency Management

Dependabot runs monthly and opens PRs for outdated npm packages.
Review and merge these PRs to keep the dependency tree healthy.

`npm audit --audit-level=high` runs on every PR and blocks merge on high severity vulnerabilities.

---

## Environment Variables

### Rules

1. `VITE_` prefix = exposed to browser bundle. Public values only.
2. No prefix = server/build only. Safe for secrets.
3. Never commit `.env` or `.env.production`
4. Always document new vars in [`.env.example`](../.env.example) with a description

### Adding a New Variable

1. Add to `.env` locally with real value
2. Add to [`.env.example`](../.env.example) with description and empty value
3. Add to GitHub repository secrets if needed in CI
4. Update [`deploy.yml`](../.github/workflows/deploy.yml) env block if needed at build time

### GitHub Secrets Required for Deploy

Add these to your GitHub repo under `Settings → Secrets → Actions` before the first push.

| Secret                    | Description                                 |
| ------------------------- | ------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`    | Cloudflare API token with Pages permissions |
| `CLOUDFLARE_ACCOUNT_ID`   | Your Cloudflare account ID                  |
| `CLOUDFLARE_PROJECT_NAME` | Name of your Cloudflare Pages project       |
| `VITE_APP_NAME`           | App name passed at build time               |
| `VITE_API_URL`            | API base URL passed at build time           |
| `VITE_STRIPE_PUBLIC_KEY`  | Stripe public key passed at build time      |

---

## Node Version

Node 24 is pinned across the project:

- [`.nvmrc`](../.nvmrc) — run `nvm use` to switch automatically
- [`package.json`](../package.json) engines field — documents the requirement
- [`.github/workflows`](../.github/workflows) — both pipelines use `node-version: 24`
