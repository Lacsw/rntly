# Git Workflow Rules

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring (no behavior change)
- `test` - Adding/updating tests
- `docs` - Documentation only
- `chore` - Maintenance tasks
- `perf` - Performance improvement
- `ci` - CI/CD changes

### Examples
```
feat: add energy efficiency badge to property card
fix: resolve null handling in portfolio calculations
refactor: extract validation logic to shared utils
test: add coverage for usePropertyCalculations edge cases
```

## Branch Workflow

1. Create feature branch from `main`
2. Make focused, atomic commits
3. Run `npm run lint` before committing
4. Run `npm test` before pushing
5. Create PR with descriptive summary

## Before Committing

```bash
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript
npm test          # Unit tests
git status        # Review changes
git diff          # Verify changes
```

## Protected Operations

These require explicit user request:
- `git push --force`
- `git reset --hard`
- `git checkout .` (discard all changes)
- Force push to `main`

## Do NOT

- Commit `.env` or secrets
- Commit debug code (`console.log`, `debugger`)
- Create empty commits
- Push directly to `main`
- Add `Co-Authored-By` or any AI attribution trailers
