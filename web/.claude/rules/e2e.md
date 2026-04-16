---
paths:
  - "web/e2e/**/*"
  - "web/e2e/**/*.spec.ts"
---

# E2E Testing Rules

## Playwright Conventions
- Tests live in `web/e2e/tests/`, `.spec.ts` extension
- Use Page Object Model pattern with `BasePage` base class
- Page objects live in `web/e2e/pages/`

## Selectors (Priority Order)
1. `getByRole` — buttons, links, headings, textboxes
2. `getByText` / `getByLabel` — visible text and labels
3. `getByPlaceholder` — form inputs
4. **DO NOT use `getByTestId`** — prefer semantic locators

## API Responses
- Use `page.waitForResponse` for API-dependent assertions
- Mock API responses when testing UI behavior in isolation

## Test Independence
- Each test must be self-contained
- No test should depend on another test's state
- Use fixtures for shared setup
