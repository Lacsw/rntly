---
description: Run comprehensive checks (lint, types, tests) before commit or PR
argument-hint: [quick|pre-commit|full]
disable-model-invocation: true
---

# /verify - Codebase Verification

Run comprehensive checks before commit or PR.

## Modes

- `/verify` or `/verify full` - All checks
- `/verify quick` - Lint and types only
- `/verify pre-commit` - Essential checks

## Checks Performed

### 1. Type Checking
```bash
npx tsc --noEmit
```
Report any TypeScript errors with file:line

### 2. Linting
```bash
npm run lint
```
Report any ESLint violations

### 3. Tests
```bash
npm test
```
Report failures and coverage summary

### 4. Code Audit
Search for:
- `console.log(`, `console.debug(` - Debug statements
- `debugger` - Debugger breakpoints
- `// TODO`, `// FIXME` - Unfinished work
- `any` type usage in changed files
- `.only` in test files (focused tests)
- Uncommitted changes: `git status`

## Output Format

```markdown
## Verification Report

### Overall: PASS | FAIL

### Type Check: PASS | FAIL
[Details if failed]

### Lint: PASS | FAIL
[Details if failed]

### Tests: PASS | FAIL
- Passed: X
- Failed: Y

### Code Audit: PASS | FAIL
- Debug statements: [list]
- TODOs: [list]
- Focused tests: [list]

### Ready for: commit | PR | needs fixes
```

## Related Commands

- `/commit` - After verification passes, commit your changes
- `/submit-pr` - After verification passes, submit a PR

## Quick Reference

| Mode | Types | Lint | Tests | Audit |
|------|-------|------|-------|-------|
| quick | yes | yes | - | - |
| pre-commit | yes | yes | yes | yes |
| full | yes | yes | yes | yes |
