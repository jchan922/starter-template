# AI_CONTEXT.md

> Single source of truth for all AI agents working in this codebase.
> Read once per session, cache, refer back as needed.

---

## Philosophy

Think in systems, not features. Before writing code: where does this live, does something already exist for this, am I violating the strangler fig seam?

Default to: explicit over clever · simple over abstract · one responsibility per file · tests alongside new code · tokens over hardcoded values · props over internal state.

Push back on requests that conflict with the architecture — propose a better approach before implementing.

---

## Living Documents

> Update the relevant doc when you make structural changes, introduce new patterns, or add dependencies. Stale docs are worse than no docs.

| File                                   | What It Covers                                             | Read When                                             |
| -------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| [`architecture.md`](architecture.md)   | Layer diagram, folder responsibilities, layer boundaries   | Starting a new feature, unsure where code belongs     |
| [`patterns.md`](patterns.md)           | Code patterns: fetcher, createClient, service stubs, hooks | Writing a new service, hook, or utility               |
| [`design-system.md`](design-system.md) | CSS tokens, naming conventions, component structure        | Touching styles, adding components, Storybook work    |
| [`testing.md`](testing.md)             | Unit and e2e conventions, what to test, what to skip       | Writing or debugging tests                            |
| [`infra.md`](infra.md)                 | Deploy pipeline, env vars, Cloudflare config, CI/CD        | Changing deploy config, adding env vars, debugging CI |
| [`decisions.md`](decisions.md)         | ADRs — why key decisions were made                         | Before proposing a change to core architecture        |
