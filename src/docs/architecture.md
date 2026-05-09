# Architecture

> Living document — update when folder structure changes, new layers
> are introduced, or responsibilities shift.

---

## Folder Structure

```
/starter
  /.github
    /workflows
      ci.yml                  ← PR gate: tests + build must pass
      deploy.yml              ← push to main auto deploys to Cloudflare
    copilot-instructions.md   ← GitHub Copilot agent pointer

  /infra
    wrangler.toml             ← Cloudflare Pages config, update per project
    Dockerfile                ← only if project needs a server component
    docker-compose.yml        ← local dev services (db, etc)

  /src

    /lib
      /client
        fetcher.js            ← base browser fetch, handles errors/retries/logging
        createClient.js       ← factory: baseUrl + auth headers + error shape per service
      /server
        fetcher.js            ← same pattern, Node context, never runs in browser
        createClient.js       ← same factory, safe to use secret env vars here

    /services
      /client                 ← browser safe, public keys only
        api.js                ← your own API, bearer token from session
        payments.js           ← payment provider, public key only
        auth.js               ← login/logout/getUser, stubbed until needed
      /server                 ← never exposed to browser, secrets live here
        payments.js           ← payment provider, secret key
        db.js                 ← all database access, swap Mongo/Postgres per project
        email.js              ← email provider, stubbed until needed

    /components
      /HelloWorld             ← template pattern, copy for every new component
        HelloWorld.jsx        ← component logic and markup
        HelloWorld.css        ← scoped nested CSS, no leakage outside component
        HelloWorld.stories.jsx← Storybook story
        HelloWorld.test.jsx   ← Vitest unit test

    /pages
      index.jsx               ← route entry points only, composition, no logic

    /hooks
      useFetch.js             ← React wrapper around client fetcher
      useAuth.js              ← stubbed, wires to services/client/auth.js

    /styles
      tokens.css              ← all CSS custom properties, source of design truth
      reset.css               ← browser reset
      global.css              ← imports tokens + reset, imported once in main.jsx

    /utils
      index.js                ← pure stateless helpers, no side effects

    /docs                     ← you are here
      AI_CONTEXT.md           ← agent entry point, session cache target
      architecture.md         ← this file
      patterns.md             ← code patterns reference
      design-system.md        ← CSS and component conventions
      testing.md              ← test conventions
      infra.md                ← deploy and env var guide
      decisions.md            ← architectural decision records

    main.jsx                  ← entry point, imports global.css, mounts app
    app.jsx                   ← root component, router shell

  /storybook
    main.js                   ← points to src/components
    preview.js                ← imports tokens.css for design tokens in stories

  /tests
    /unit                     ← Vitest, mirrors /src structure
    /e2e
      hello-world.spec.js     ← confirms hello world renders post deploy

  CLAUDE.md                   ← Claude Code agent pointer
  agents.md                   ← general agent pointer
  .env                        ← never committed, local values
  .env.example                ← committed, all vars documented, no secrets
  .env.production             ← never committed, production values
  .gitignore
  .eslintrc
  .prettierrc
  .husky
    pre-commit                ← lint-staged: format + lint on staged files
    pre-push                  ← format + lint + test + build must all pass
  vite.config.js              ← @ alias points to /src
  package.json
  README.md
```

---

## Layer Rules

Hard boundaries. Violating these creates debt that requires rewrites.

**Pages** — routing and composition only. No fetch calls, no business
logic. If you find logic in a page, extract it to a hook.

**Components** — rendering only. Accept props, emit events via
callbacks. Never call services directly from a component.

**Hooks** — stateful logic that bridges components and services.
One hook per concern.

**Services** — the strangler fig seam. All external dependencies live
here. App code never imports Stripe, Auth.js, Mongoose, or any
third-party library directly. Always through a service.

**Lib** — pure infrastructure. Fetcher and createClient have zero
knowledge of your domain. They are plumbing, not business logic.

**Utils** — pure functions only. No imports from services, hooks,
or components. If it has a side effect, it doesn't belong here.

---

## Strangler Fig Seam

The services layer is your strangler fig seam. When you outgrow a
provider, you replace one service file. Nothing else changes.

```
Component → Hook → Service → (Stripe | Clerk | Mongoose | etc)
                       ↑
              swap happens here
```
