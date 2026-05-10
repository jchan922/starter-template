# Infrastructure

> Living document — update when deploy targets change, new env vars
> are added, or CI/CD pipelines are modified.

---

## CI/CD Pipeline

Two workflows. One entry in the Actions tab per PR, one per merge to main.

### On pull request → [`ci.yml`](../.github/workflows/ci.yml)

Runs on every PR targeting `main`. Merge is blocked if any step fails.

| Step         | Command                        |
| ------------ | ------------------------------ |
| Format check | `prettier --check .`           |
| Lint         | `eslint src`                   |
| Audit        | `npm audit --audit-level=high` |
| Unit tests   | `vitest run`                   |
| Build        | `vite build`                   |
| E2E tests    | `playwright test`              |

### On merge to main → [`release.yml`](../.github/workflows/release.yml)

Jobs run in sequence. One Actions tab entry per merge.

```
bump ──────────────────┬── deploy-gh   (always)
                       ├── deploy-cf   (when CF secrets are set)
                       └── deploy-ecs  (when ECS secrets are set)
```

**bump** — always increments patch version in `package.json`, commits as
`chore: release vX.X.X [skip ci]`, pushes the commit and a `vX.X.X` tag.
The `[skip ci]` tag suppresses re-triggering. No commit message conventions
required — every merge is a patch bump regardless of message content.

**deploy-gh** — builds with `VITE_APP_VERSION` set from `package.json` and
deploys to GitHub Pages. Always active.

**deploy-cf** — builds and deploys to Cloudflare Pages. Activates automatically
when `CLOUDFLARE_API_TOKEN` secret is added.

**deploy-ecs** — builds Docker image, pushes to ECR, updates ECS task definition.
Activates automatically when `ECR_REPOSITORY` secret is added.

### Activating a deploy target

No code changes needed. Add the secrets listed below for the target and the
corresponding job in `release.yml` will start running on the next merge.

---

## Deploy Targets

### GitHub Pages (active)

Static frontend only. Zero config — deploy-gh runs on every merge.

The app version is rendered in the bottom-right corner of every page via
`VITE_APP_VERSION`, injected at build time from `package.json`.

### Cloudflare Pages

Static frontend + edge functions via `functions/`. Server routes are thin
adapters in `functions/` that call handlers in `server/handlers/`.

Wire up: add the 3 CF secrets → `deploy-cf` job activates.

Config reference: [`infra/wrangler.toml`](../infra/wrangler.toml)

### AWS ECS

Containerised Node.js via Docker. Full Node runtime — all handler/fetch/model
patterns work as-is. Server routes are registered in [`server/index.js`](../server/index.js).

Wire up: add the 6 ECS secrets → `deploy-ecs` job activates.

Reference: [`Dockerfile`](../Dockerfile), [`docs/templates/adapter.node.js`](templates/adapter.node.js)

---

## Environment Variables

### Rules

1. `VITE_` prefix → exposed to browser bundle. Public values only.
2. No prefix → server/build only. Safe for secrets.
3. Never commit `.env` or `.env.production`.
4. Document new vars in [`.env.example`](../.env.example).

### Adding a Variable

1. Add to `.env` locally with real value
2. Add to [`.env.example`](../.env.example) with description, empty value
3. Add to GitHub repo secrets if needed in CI
4. Add to the relevant `env:` block in [`.github/workflows/release.yml`](../.github/workflows/release.yml)

---

## Secrets Reference

| Secret                    | Required for                          |
| ------------------------- | ------------------------------------- |
| `GH_PAT`                  | Always — bump job pushes back to main |
| `CLOUDFLARE_API_TOKEN`    | CF Pages (activates deploy-cf)        |
| `CLOUDFLARE_ACCOUNT_ID`   | CF Pages                              |
| `CLOUDFLARE_PROJECT_NAME` | CF Pages                              |
| `VITE_APP_NAME`           | CF Pages build                        |
| `VITE_API_URL`            | CF Pages + ECS build                  |
| `VITE_STRIPE_PUBLIC_KEY`  | CF Pages build                        |
| `AWS_ACCESS_KEY_ID`       | ECS (activates deploy-ecs)            |
| `AWS_SECRET_ACCESS_KEY`   | ECS                                   |
| `ECR_REPOSITORY`          | ECS                                   |
| `ECS_CLUSTER`             | ECS                                   |
| `ECS_SERVICE`             | ECS                                   |
| `ECS_TASK_DEFINITION`     | ECS                                   |

---

## Dependency Management

Dependabot runs monthly and opens PRs for outdated npm packages.
`npm audit --audit-level=high` blocks merge on high severity vulnerabilities.

---

## Node Version

Node 24 is pinned across the project:

- [`.nvmrc`](../.nvmrc) — `nvm use` switches automatically
- [`package.json`](../package.json) engines field
- All workflows use `node-version: 24`
