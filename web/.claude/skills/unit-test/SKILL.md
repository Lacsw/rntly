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

## Hook Test

```tsx
// web/src/domains/properties/hooks/useProperties.test.ts
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProperties } from './useProperties';
import { propertiesApi } from '../api';
import type { TProperty } from '../api';

vi.mock('../api', () => ({
  propertiesApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockProperty: TProperty = {
  id: '1',
  address: '123 Main St',
  type: 'apartment',
  bedrooms: 2,
  rent_amount: 1500,
  status: 'vacant',
  created_at: '',
  updated_at: '',
};

describe('useProperties', () => {
  beforeEach(() => {
    vi.mocked(propertiesApi.getAll).mockResolvedValue({ data: [mockProperty] } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches on mount', async () => {
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.properties).toEqual([mockProperty]);
  });

  it('createProperty calls api and refetches', async () => {
    vi.mocked(propertiesApi.create).mockResolvedValue({ data: mockProperty } as never);
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createProperty({ address: '456', type: 'house', bedrooms: 3, rent_amount: 2000 });
    });

    expect(propertiesApi.create).toHaveBeenCalledOnce();
    expect(propertiesApi.getAll).toHaveBeenCalledTimes(2);
  });
});
```

Note: once Sprint 4 lands MSW, replace `vi.mock('../api', ...)` with `server.use(http.get(...))` handlers for realistic HTTP paths including axios error shapes.

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

Use mock factories from `web/src/tests/factories/` for reusable test data. Create factories that accept overrides via the spread operator:

```tsx
// web/src/tests/factories/property.ts
import type { TProperty } from '@/domains/properties';

export const createMockProperty = (overrides: Partial<TProperty> = {}): TProperty => ({
  id: 'p1',
  address: '123 Main St',
  type: 'apartment',
  bedrooms: 2,
  rent_amount: 1500,
  status: 'vacant',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});
```

Usage in tests:

```tsx
import { createMockProperty } from "@/tests/factories";

describe("PropertyCard", () => {
  it("should display property address", () => {
    const property = createMockProperty({ address: "456 Oak Ave" });
    render(<PropertyCard property={property} />);
    expect(screen.getByText("456 Oak Ave")).toBeInTheDocument();
  });

  it("should handle house property type", () => {
    const property = createMockProperty({ type: "house" });
    // ...
  });
});
```

Store new factories in `web/src/tests/factories/` and export them from `tests/factories/index.ts`.

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
