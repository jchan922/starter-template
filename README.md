# Starter

A full-stack React + Vite monorepo. Deploy to Cloudflare Pages or AWS ECS — no code changes between targets.

---

## Getting Started

```bash
git clone <this-repo> my-app
cd my-app
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Before your first deploy, add the required secrets and update [`infra/wrangler.toml`](infra/wrangler.toml) — see [`docs/infra.md`](docs/infra.md).

---

## Structure

| Folder       | What it is                                                  |
| ------------ | ----------------------------------------------------------- |
| `src/`       | React app — Vite bundle boundary, browser only              |
| `server/`    | Server-side handlers, services, db — never bundled          |
| `functions/` | Cloudflare Pages adapter (thin wires to `server/handlers/`) |
| `infra/`     | Deployment config — wrangler.toml, Dockerfile, Terraform    |
| `docs/`      | Architecture, patterns, decisions, and templates            |

---

## Docs

Architecture, patterns, design system, testing, and infrastructure docs live in [`docs/`](docs/).
