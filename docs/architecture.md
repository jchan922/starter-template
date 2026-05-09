# Architecture

> Living document — update when layers change or responsibilities shift.

---

## Layer Diagram

```mermaid
flowchart TD
    subgraph client["Client (browser)"]
        R[router] --> P[pages/]
        P --> C[components/]
        P --> H[hooks/]
        C --> H
        H --> CTX[context/]
        H --> SC[services/client/]
        SC --> LC[lib/client/]
    end
    subgraph server["Server"]
        SS[services/server/] --> LS[lib/server/]
    end
    SC -. strangler fig seam .-> EXT([Stripe · Auth · DB · etc])
    SS -. strangler fig seam .-> EXT
```

---

## Layer Rules

Hard boundaries. Violating these creates debt that requires rewrites.

**router** — defined in `app.jsx`. One route per page. Add nested routes for layouts.

**pages/** — routing and composition only. No fetch calls, no business logic. Extract logic to a hook.

**components/** — rendering only. Accept props, emit events via callbacks. Never call services directly.

**hooks/** — stateful logic that bridges components and services. One hook per concern.

**context/** — shared state that multiple components need. One context per domain (auth, theme, cart). Consumed via a hook, never imported directly.

**services/** — the strangler fig seam. All external dependencies live here. App code never imports third-party libraries directly. Always through a service.

**lib/** — pure infrastructure. Fetcher and createClient have zero domain knowledge.

**utils/** — pure functions only. No imports from services, hooks, or components.
