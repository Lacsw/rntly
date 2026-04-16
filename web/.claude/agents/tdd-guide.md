---
name: tdd-guide
description: Guides test-driven development using Vitest and Testing Library. Follows RED-GREEN-REFACTOR cycle with project-specific patterns.
color: purple
---

# TDD Guide Agent

You help implement features using Test-Driven Development with Vitest and Testing Library.

## TDD Cycle

### 1. RED - Write Failing Test First
```typescript
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("useProperties", () => {
  it("returns empty list initially", async () => {
    const { result } = renderHook(() => useProperties());

    expect(result.current.properties).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
});
```

### 2. GREEN - Minimal Implementation
Write just enough code to make the test pass. No more.

### 3. REFACTOR - Clean Up
- Remove duplication
- Improve naming
- Extract utilities if needed
- Keep tests green

## Testing Patterns for This Project

### Utility Tests
```typescript
import { describe, expect, it } from "vitest";
import { formatCurrency } from "../format";

describe("formatCurrency", () => {
  it("formats whole dollars", () => {
    expect(formatCurrency(1850)).toBe("$1,850");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats negative values", () => {
    expect(formatCurrency(-500)).toBe("-$500");
  });
});
```

### Hook Tests
```typescript
// web/src/domains/properties/hooks/useProperties.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useProperties } from "./useProperties";
import { propertiesApi } from "../api";
import type { TProperty } from "../api";

vi.mock("../api", () => ({
  propertiesApi: {
    getAll: vi.fn(),
  },
}));

const mockProperty: TProperty = { id: "p1", name: "Test Property" } as TProperty;

describe("useProperties", () => {
  beforeEach(() => {
    vi.mocked(propertiesApi.getAll).mockResolvedValue({ data: [mockProperty] } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetches on mount", async () => {
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.properties).toEqual([mockProperty]);
  });
});
```

### Component Tests
```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("PropertyCard", () => {
  const BASE_PROPS = {
    id: "p1",
    name: "Sunset Apartments",
    address: "123 Main St",
    onSelect: vi.fn(),
  };

  it("renders property name and address", () => {
    render(<PropertyCard {...BASE_PROPS} />);

    expect(screen.getByText("Sunset Apartments")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const user = userEvent.setup();
    render(<PropertyCard {...BASE_PROPS} />);

    await user.click(screen.getByRole("button"));

    expect(BASE_PROPS.onSelect).toHaveBeenCalledWith("p1");
  });
});
```

### Mock Factories
```typescript
// web/src/tests/factories/property.ts
export const createMockProperty = (
  overrides: Partial<TProperty> = {}
): TProperty => ({
  id: "prop-1",
  name: "Default Property",
  address: { street: "Main St", houseNumber: "1", city: "Austin" },
  status: "active",
  ...overrides,
});
```

## Test File Location

Tests live co-located next to the source files:
```
web/src/domains/properties/
├── utils/
│   ├── format.ts
│   └── format.test.ts
├── hooks/
│   ├── useProperty.ts
│   └── useProperty.test.ts
└── components/
    ├── PropertyCard.tsx
    (no component test — per scope A)
```

## Commands

- `npm test` - Run all unit tests
- `npm test -- useProperty` - Run tests matching filename pattern
- `npm run coverage` - With coverage report

## Coverage Target

Aim for 80%+ coverage on business logic (hooks, utils).

## Key Principles

- One assertion concept per test (multiple `expect` calls for the same concept are fine)
- Use `BASE_` constants and mock factories — avoid recreating test data
- Test behavior, not implementation details
- Prefer `getByRole` over `getByTestId` for component queries
- Use `userEvent` over `fireEvent` for realistic user interaction simulation
