# Decisions

> Architectural Decision Records (ADRs).
> Before changing any core architectural decision, add an entry here
> explaining the context, options considered, and rationale.
> This file answers "why" — architecture.md answers "what".

---

## ADR-001 — Vite over Create React App / Next.js

**Date:** Project init
**Status:** Accepted

**Context:** Needed a React build tool. Options were CRA (deprecated),
Next.js (SSR framework), and Vite (build tool only).

**Decision:** Vite. These are client-rendered apps. SSR adds complexity
that isn't earned for most projects in this portfolio. Vite is fast,
minimal, and doesn't impose a framework opinion.

**Tradeoff:** No SSR or file-based routing out of the box. Add a router
manually when needed.

---

## ADR-002 — Plain nested CSS over Tailwind / CSS Modules

**Date:** Project init
**Status:** Accepted

**Context:** Needed a styling approach. Options were Tailwind (utility
classes), CSS Modules (scoped imports), and plain CSS with conventions.

**Decision:** Plain CSS with native nesting and CSS custom properties.
Native CSS nesting is now supported across modern browsers. Custom
properties give us design tokens without a preprocessor. No build
dependency, no runtime, total control.

**Tradeoff:** Requires naming discipline (enforced by convention).
No automatic scoping — enforced by nesting under root class.

---

## ADR-003 — Strangler Fig Service Layer

**Date:** Project init
**Status:** Accepted

**Context:** Needed a pattern for integrating third-party services that
doesn't couple app code to specific providers.

**Decision:** All third-party calls go through [`/services`](../src/services/). App code
never imports external libraries directly. Services expose a
domain-specific API. Providers are swapped by replacing one file.

**Tradeoff:** Adds one layer of indirection. Worth it — provider
migrations have happened multiple times across similar projects.

---

## ADR-004 — Components as a Project-Level Decision

**Date:** Project init
**Status:** Accepted

**Context:** Considered baking in a component library (shadcn, Radix,
MUI). Shadcn requires Tailwind. MUI is opinionated. Radix is great
for accessibility but overkill for landing pages.

**Decision:** No default component library. Each project decides based
on its needs. The starter includes HelloWorld as a pattern template
only. Radix recommended for complex interactive UI.

---

## ADR-005 — Cloudflare Pages as Default Deploy Target

**Date:** Project init
**Status:** Accepted

**Context:** Needed a zero-ops deploy target. Options were Vercel,
Netlify, and Cloudflare Pages.

**Decision:** Cloudflare Pages. Generous free tier, fast global CDN,
native GitHub integration, no function cold starts on the free plan.

**Tradeoff:** Less mature ecosystem than Vercel for edge functions.
Switch to Vercel if the project needs complex SSR or middleware.

---

## ADR-006 — React Router v7 for Client-Side Routing

**Date:** Project init
**Status:** Accepted

**Context:** Needed a routing convention to bake into the template.
Options were React Router v7, TanStack Router (manual or file-based),
or leaving routing as a per-project decision.

**Decision:** React Router v7 with `createBrowserRouter`. Widest
familiarity, clean loader pattern that maps to the service layer,
works on both CF Pages and ECS without runtime differences.

**Tradeoff:** TanStack Router has better long-term DX and type-safe
routes, but adds upfront complexity for a template. Revisit if the
project commits to TypeScript.

---

## ADR-007 — Template Supports Both CF Pages and ECS Deploy Targets

**Date:** Project init
**Status:** Accepted

**Context:** Projects built on this template may deploy to Cloudflare
Pages (edge, zero-ops) or AWS ECS via Terraform (containerised Node,
more control). The server-side handler pattern needed to work for both.

**Decision:** Application-layer patterns (handler/fetch/model, service
layer, components, hooks) are runtime-agnostic. Deploy target is a
per-project decision documented in infra.md. CF Pages uses Workers
runtime; ECS uses full Node — the handler templates note where the
adapter difference applies.

**Tradeoff:** Infra docs cover two paths, which adds length. Worth it
to avoid baking in a deploy assumption that limits the template's reach.
