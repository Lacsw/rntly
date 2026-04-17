---
name: unit-test
description: Create unit tests using Vitest and Testing Library. Use when writing tests for utilities, hooks, or components. Tests go co-located next to the code being tested.
---

# Unit Testing with Vitest

## Test Location

Place tests co-located next to the source file:

```
domain/
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts
├── hooks/
│   ├── useResource.ts
│   └── useResource.test.ts
```

## Running Tests

```bash
npm test                     # Run all tests
npm run test:watch           # Watch mode
npm test path/to/file.test   # Specific file
```

## Utility Function Test

```tsx
// utils/helpers.test.ts
import { describe, it, expect } from "vitest";

import { formatCurrency, calculateTotal } from "./helpers";

describe("formatCurrency", () => {
  it("should format number as EUR currency", () => {
    expect(formatCurrency(1234.56)).toBe("1.234,56 €");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("0,00 €");
  });

  it("should handle negative numbers", () => {
    expect(formatCurrency(-100)).toBe("-100,00 €");
  });
});

describe("calculateTotal", () => {
  it("should sum array of numbers", () => {
    const items = [{ value: 10 }, { value: 20 }, { value: 30 }];

    expect(calculateTotal(items)).toBe(60);
  });

  it("should return 0 for empty array", () => {
    expect(calculateTotal([])).toBe(0);
  });
});
```

## Hook Test (MSW)

Hook tests that touch `axios` use MSW handlers — never `vi.mock('../api', ...)`. MSW intercepts at the network layer so axios code paths (interceptors, error shape, status branches) run for real. Default handlers live in `web/src/tests/msw/handlers.ts`; override per test via `server.use(...)`.

```tsx
// web/src/domains/properties/hooks/useProperties.test.ts
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/msw/server';
import { createMockProperty } from '@/tests/msw/factories/property';
import { useProperties } from './useProperties';

const API = 'http://localhost:8080';

describe('useProperties', () => {
  it('fetches on mount', async () => {
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.properties).toEqual([createMockProperty()]);
  });

  it('sets error when fetch fails', async () => {
    server.use(
      http.get(`${API}/properties`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch properties');
  });
});
```

**Conventions:**
- Setup runs `server.listen({ onUnhandledRequest: 'error' })` in `src/tests/setup.ts` — any endpoint the hook hits must be declared in a handler or the test fails loudly.
- Reset between tests is automatic via `afterEach(() => server.resetHandlers())`.
- Use `http.get(..., resolver, { once: true })` when you need a transient error handler to fall back to the default on the next call.
- Factories live at `web/src/tests/msw/factories/{property,tenant,lease}.ts` — import with `@/tests/msw/factories/<name>`.

## Component Test

```tsx
// components/ResourceCard.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ResourceCard } from "./ResourceCard";

describe("ResourceCard", () => {
  const defaultProps = {
    id: "1",
    name: "Test Resource",
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("should render resource name", () => {
    render(<ResourceCard {...defaultProps} />);

    expect(screen.getByText("Test Resource")).toBeInTheDocument();
  });

  it("should call onEdit when edit button clicked", async () => {
    const user = userEvent.setup();
    render(<ResourceCard {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(defaultProps.onEdit).toHaveBeenCalledWith("1");
  });

  it("should call onDelete when delete button clicked", async () => {
    const user = userEvent.setup();
    render(<ResourceCard {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(defaultProps.onDelete).toHaveBeenCalledWith("1");
  });
});
```

## Mock Factory Pattern

Mock factories live at `web/src/tests/msw/factories/` — one per domain entity. Each accepts `Partial<T>` overrides via spread:

```tsx
// web/src/tests/msw/factories/property.ts
import type { TProperty } from '@/domains/properties';

export const createMockProperty = (overrides: Partial<TProperty> = {}): TProperty => ({
  id: 'p1',
  address: '123 Main St',
  type: 'apartment',
  bedrooms: 2,
  rent_amount: 1500,
  status: 'available',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});
```

Usage:

```tsx
import { createMockProperty } from '@/tests/msw/factories/property';

const property = createMockProperty({ address: '456 Oak Ave' });
render(<PropertyCard property={property} />);
expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
```

New domain? Add `web/src/tests/msw/factories/<entity>.ts` and wire it into the default handlers in `web/src/tests/msw/handlers.ts`.

## Common Mocks

### React Router

```tsx
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: "123" }),
  };
});
```

## Common Assertions

```tsx
// Element presence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Text
expect(element).toHaveText("Expected text");
expect(element).toContainText("partial");

// Classes
expect(element).toHaveClass("class-name");

// Attributes
expect(element).toHaveAttribute("href", "/path");
expect(element).toBeDisabled();

// Function calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg);
expect(mockFn).toHaveBeenCalledTimes(1);

// Values
expect(array).toHaveLength(3);
expect(object).toEqual({ key: "value" });
expect(value).toBeTruthy();
expect(value).toBeFalsy();
```
