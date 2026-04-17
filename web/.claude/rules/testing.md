---
paths:
  - "web/src/**/*.test.{ts,tsx}"
---

# Testing Rules

## Coverage
- Minimum 80% for business logic (hooks, utils, stores)
- Focus on behavior, not implementation details
- Skip framework boilerplate and simple re-exports

## Test Structure
- Tests live in a sibling `__tests__/` folder inside each feature dir (e.g. `hooks/__tests__/useProperties.test.ts`). Test files use the same basename as the source file plus `.test.ts(x)`.
- Use `.test.ts` or `.test.tsx` extension
- Use `describe` for grouping, `it` for individual tests

## Mock Factories
- Extract common test data to shared constants (`BASE_USER`, `BASE_PROPERTY`)
- Create mock factories: `createMockProperty(overrides)`
- Store factories in `web/src/tests/msw/factories/`
- Use spread operator for test variations

## Vitest Patterns
- Import from `vitest`: `describe`, `expect`, `it`, `vi`
- Use `vi.fn()` for mock functions, `vi.mock()` for module mocks
- Use `renderHook` from `@testing-library/react` for hook tests
- Use `userEvent` over `fireEvent` for realistic interactions
- Use `getByRole` over `getByTestId` for component queries

## Before Committing
```bash
npm test  # All tests pass
```

## When Tests Fail
1. Check test isolation (no shared state between tests)
2. Verify mock setup
3. Fix implementation, not test (unless test is wrong)
4. Run single test: `npm test -- useProperty`
