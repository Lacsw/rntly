# Verification Loop

Run this checklist after completing any implementation work to catch issues before committing.

## Phases

Execute each phase in order. Stop and fix issues before proceeding to the next.

### Phase 1: Build

```bash
npm run build
```

Must complete with zero errors. Warnings are acceptable but should be reviewed.

### Phase 2: Type Check

```bash
npx tsc --noEmit
```

Must produce zero errors. Fix all type issues before proceeding.

### Phase 3: Lint

```bash
npm run lint
```

Must pass cleanly. Fix lint errors — do not disable rules without justification.

### Phase 4: Security Scan

Check for common security issues:

- **No hardcoded secrets**: grep for API keys, tokens, passwords in source files.
- **No `console.log`** left in production code (temporary debug logs must be removed).
- **No `dangerouslySetInnerHTML`** without explicit sanitization.
- **No `eval()`** or `new Function()`.

### Phase 5: Diff Review

```bash
git diff
```

Review the full diff before committing:

- Are all changes intentional?
- Any files accidentally modified?
- Any debugging artifacts left behind?
- Do import paths follow the barrel export convention?

## Report Format

After running all phases, report results as:

```
Verification:
  Build:    PASS | FAIL (details)
  Types:    PASS | FAIL (details)
  Lint:     PASS | FAIL (details)
  Security: PASS | FAIL (details)
  Diff:     PASS | FAIL (details)
```

Only proceed with committing when all phases PASS.
