# E2E tests

Playwright suite for the Scope C golden paths. Runs against the live BE
(`:8080`) and FE (`:5173`); nothing is mocked.

## Running

Start the stack first:

```bash
# repo root — Go API + Postgres
make dev

# web — FE on 5173
cd web && npm run dev -- --port 5173 --strictPort
```

Then:

```bash
cd web
npm run test:e2e          # headless, list + html reporter
npm run test:e2e:ui       # Playwright UI mode
```

HTML report lands at `web/playwright-report/` (gitignored).

## Layout

| Path          | Role                                               |
| ------------- | -------------------------------------------------- |
| `pages/`      | Page object models extending `BasePage`            |
| `tests/`      | Spec files — one per surface + cross-cutting flows |
| `fixtures/`   | Axios seed helpers and shared API client           |

## Conventions

- Semantic locators only: `getByRole` → `getByLabel` → `getByText`. No `getByTestId`.
- Tests are responsible for their own cleanup — seed helpers in
  `fixtures/seed.ts` expose matching `deleteProperty/Tenant/Lease`.
- `beforeAll` seeds via the BE API (faster + more deterministic than UI).
- `afterEach` / `afterAll` removes whatever the test created so the DB
  returns to its prior state.
- `workers: 1` in `playwright.config.ts` — tests share a single BE and
  must not collide.

## When tests break

1. `npx playwright show-trace test-results/.../trace.zip` — trace viewer
   usually shows the exact failing step.
2. `test-results/*.png` — manual screenshots written by a spec during
   debugging stick around until the next run.
3. Port mismatch? BE expects `:5173` for CORS — use `--port 5173 --strictPort`.
