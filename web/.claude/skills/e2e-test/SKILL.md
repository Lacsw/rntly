---
name: e2e-test
description: Create and write Playwright E2E tests using Page Object Model pattern with semantic locators and API response handling. Use when writing integration tests, user flow tests, or full application testing.
---

# E2E Testing with Playwright

## Test Location

All E2E tests: `web/e2e/tests/`

```
e2e/
├── global-setup.ts          # Auth setup (saves storageState.json)
├── pages/                   # Page Object Models (extend BasePage)
├── shared/                  # Fixtures, constants, utils
└── tests/                   # Test specifications
```

## Running Tests

```bash
npm run test:e2e                    # Run all e2e tests
npm run test:e2e tests/properties   # Specific test
npm run test:e2e -- --ui            # UI mode (debugging)
npm run test:e2e -- --headed        # See browser
npm run test:e2e -- --debug         # Debug mode
```

## Key Rules

- **No `getByTestId`** — always use semantic selectors (`getByRole`, `getByLabel`, `getByText`)
- **Wait for API** — setup `waitForResponse()` BEFORE triggering actions
- **Use Page Object Model** — extend `BasePage`, use getters for locators
- **Check console errors** — use `checkForConsoleErrors(page)` utility

## Selector Priority

```tsx
// 1. Role (preferred)
page.getByRole("button", { name: /Add Property/i });
page.getByRole("heading", { name: /Properties/i });
page.getByRole("tab", { name: /Overview/i });

// 2. Label (form inputs)
page.getByLabel(/Address/i);

// 3. Placeholder
page.getByPlaceholder(/Search/i);

// 4. Text (visible content)
page.getByText(/Welcome/i);

// NEVER use:
page.getByTestId("...");     // Not semantic
page.locator(".css-class");  // Fragile
```

## Basic Test

```tsx
// e2e/tests/properties.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Properties", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/properties");
  });

  test("should display page title", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Properties/i })).toBeVisible();
  });

  test("should open the create modal", async ({ page }) => {
    await page.getByRole("button", { name: /Add Property/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
```

## Page Object Model

```tsx
// e2e/pages/properties.page.ts
import { type Page, type Locator } from "@playwright/test";

import { BasePage } from "./basePage";

export class PropertiesPage extends BasePage {
  constructor(page: Page) {
    super(page, "/properties", /Properties/i);
  }

  // Use getters for lazy-evaluated locators
  get heading() {
    return this.page.getByRole("heading", { name: /Properties/i });
  }

  get addButton() {
    return this.page.getByRole("button", { name: /Add Property/i });
  }

  get addressInput() {
    return this.page.getByLabel(/Address/i);
  }

  async openCreateModal() {
    await this.addButton.click();
    await this.page.getByRole("dialog").waitFor({ state: "visible" });
  }
}
```

### Using Page Objects in Tests

```tsx
// e2e/tests/properties.spec.ts
import { test, expect } from "@playwright/test";

import { PropertiesPage } from "../pages/properties.page";

test.describe("Properties Page", () => {
  let propertiesPage: PropertiesPage;

  test.beforeEach(async ({ page }) => {
    propertiesPage = new PropertiesPage(page);
    await propertiesPage.navigate();
  });

  test("should open create modal", async () => {
    await propertiesPage.openCreateModal();
    await expect(propertiesPage.page.getByRole("dialog")).toBeVisible();
  });
});
```

## API Mocking

```tsx
test("should display mocked data", async ({ page }) => {
  await page.route("**/properties", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: "1", address: "Test" }]),
    });
  });

  await page.goto("/properties");
  await expect(page.getByText("Test")).toBeVisible();
});
```

## Waiting for API Responses

```tsx
// Setup waiter BEFORE the action that triggers the request
const responsePromise = page.waitForResponse(
  resp => /\/properties/.test(resp.url()) && resp.status() === 200,
);

await page.getByRole("button", { name: /Save/i }).click();
await responsePromise;

// Now safe to assert
await expect(page.getByText(/Saved/i)).toBeVisible();
```

## Common Actions

```tsx
await page.getByRole("button").click();
await page.getByLabel("Address").fill("123 Main St");
await page.getByLabel("Address").clear();
await page.getByRole("combobox").selectOption("apartment");
await page.getByRole("checkbox").check();
await page.getByRole("button").hover();
await page.waitForURL("**/properties");
```

## Common Assertions

```tsx
await expect(element).toBeVisible();
await expect(element).toBeHidden();
await expect(element).toHaveText("Expected text");
await expect(element).toContainText("partial");
await expect(element).toHaveAttribute("href", "/path");
await expect(element).toBeEnabled();
await expect(element).toBeDisabled();
await expect(page.getByRole("row")).toHaveCount(5);
await expect(page).toHaveURL(/\/properties/);
```

## Checklist for New E2E Tests

- [ ] Page object extends `BasePage` and exported from `e2e/pages/index.ts`
- [ ] Fixture added to `e2e/shared/base.ts` if needed
- [ ] Semantic locators only — no `getByTestId`
- [ ] API responses awaited before assertions
- [ ] Console error checking included
- [ ] Both positive and negative scenarios tested
- [ ] Test passes locally before committing
