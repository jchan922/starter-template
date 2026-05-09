# Design System

> Living document — update when tokens change, naming conventions
> evolve, or new component patterns are introduced.

---

## Principles

- All visual values come from tokens — never hardcode colors, spacing, or font sizes
- One CSS file per component, co-located with the JSX
- Native CSS nesting for scoping — no preprocessor, no CSS Modules
- Every component scoped under a single root class
- **No BEM.** Do not use `__element` or `--modifier` syntax. Child classes use `component-name-child` kebab-case (e.g. `.card-title`) to prevent style leakage across nested components.

---

## Token Reference

Tokens are defined in [`/src/styles/tokens.css`](../src/styles/tokens.css).
Always use the token. Never use the raw value.

| Category   | Example Token            | Use                          |
| ---------- | ------------------------ | ---------------------------- |
| Color      | `var(--color-primary)`   | Brand, interactive elements  |
| Color      | `var(--color-muted)`     | Secondary text, placeholders |
| Color      | `var(--color-danger)`    | Errors, destructive actions  |
| Spacing    | `var(--space-md)`        | Standard padding/margin      |
| Font size  | `var(--font-lg)`         | Body emphasis                |
| Radius     | `var(--radius-md)`       | Cards, inputs                |
| Shadow     | `var(--shadow-md)`       | Elevated surfaces            |
| Transition | `var(--transition-base)` | Hover states                 |

---

## CSS Scoping Pattern

Child classes are prefixed with the component name to prevent style leakage across nested components. CSS nesting is used for organisation, not scoping — descendant selectors (`.parent .child`) still bleed into nested components.

```css
/* MyComponent.css */
.my-component {
  /* component root styles */

  .my-component-header {
    /* unique name prevents leakage into child components */
  }

  .my-component-body {
    padding: var(--space-md);

    &:hover {
      background: var(--color-surface);
    }
  }
}
```

Rules:

- Root class matches component name in kebab-case
- Child classes: `component-name-child` — single hyphen, no `__` or `--`
- No global selectors inside component files
- No `!important`

---

## Storybook

Every component gets a `.stories.jsx` file.
Stories use design tokens automatically via `preview.js`.

Story naming convention:

- `Default` — component with default props
- Descriptive names for variants — `WithError`, `Loading`, `CustomMessage`

Run Storybook: `npm run storybook`
