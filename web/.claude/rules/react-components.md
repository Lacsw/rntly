---
paths:
  - "web/src/**/*.tsx"
---

# React Component Rules

## Component Structure
1. Imports (grouped: react, external, internal, relative)
2. Type definitions (`type TProps = { ... }`)
3. Component function (NO `React.FC` annotation)
4. Hooks first inside component
5. Event handlers
6. Early returns for loading/error states
7. Main render

## Pages vs Components
- **Pages** (`src/pages/`): orchestrate data fetching, compose components
- **Components** (`src/domains/*/components/`): receive props, don't fetch data

## Styling
- Use Tailwind CSS utility classes
- Use `cn()` from `@/shared/lib/cn` for conditional classes
- Use shared components from `@/shared/components` (Modal, PageHeader, StatCard, etc.)

## Lists
- Never use array index as React `key`
- Always use a stable identifier (id, unique value)

## Avoid
- `data-testid` attributes — use semantic HTML and ARIA roles instead
- Prop drilling more than 2 levels — extract to context or composition
- Business logic in components — extract to hooks or utils
- Deeply nested ternaries in JSX
