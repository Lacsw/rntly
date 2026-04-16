---
name: documentation
description: Create documentation beside code. Use when adding docs for utilities, hooks, domain features, or any new code that needs documentation.
---

# Documentation

## Principle

Documentation lives **beside the code**, not centralized. The root `/docs` folder is a **content list** that links to docs scattered across the codebase.

## File Placement

Place documentation in a `docs/` folder adjacent to the code:

```plaintext
web/src/shared/utils/
├── format.ts
├── format.test.ts
└── docs/
    └── format.md
```

For domain documentation:

```plaintext
web/src/domains/properties/
├── api/
├── hooks/
├── components/
├── utils/
└── docs/
    └── README.md   (optional — domain overview)
```

## Template

### Shared Utils

```markdown
# [Utility Name]

## Functions

| Function               | Description                        |
| ---------------------- | ---------------------------------- |
| `functionName(params)` | Short description of what it does. |
```

## Content List

After creating a doc file beside code, add a link to the appropriate content list in the root `/docs` folder (optional — create on first need; rntly has no `docs/index.md` yet):

| Doc location                        | Content list to update (optional)      |
| ----------------------------------- | -------------------------------------- |
| `web/src/shared/utils/docs/*.md`    | `docs/utilities/index.md`              |
| `web/src/shared/hooks/docs/*.md`    | `docs/index.md` (Shared section)       |
| `web/src/domains/*/docs/*.md`       | `docs/index.md` (Domains section)      |

## Checklist

- [ ] Create `.md` file in a `docs/` folder beside the code
- [ ] Use the documentation template matching the code type
- [ ] Add a link to the content list in `/docs` (optional — create list on first need)
- [ ] Ensure markdown table columns are aligned (all `|` pipes line up vertically)

## DO

- Place docs beside the code they describe
- Update docs when code changes

## DON'T

- Don't create code-specific docs directly in `/docs`
- Don't duplicate documentation content
- Don't create docs without considering whether they add value
