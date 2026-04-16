---
description: Analyze test coverage and identify gaps to improve
argument-hint: [file-or-domain]
disable-model-invocation: true
---

# /test-coverage - Analyze and Improve Test Coverage

Analyze test coverage and identify gaps.

## Process

### 1. Run Coverage Report
```bash
npm run coverage
```

### 2. Analyze Results
- Identify files below 80% coverage
- Focus on business logic (hooks, utils)
- Ignore framework boilerplate and simple re-exports

### 3. Prioritize Gaps
High priority:
- Security-critical code (auth, permissions)
- Complex business logic (calculations, transformations)
- Code with recent bugs

Medium priority:
- Custom hooks with side effects
- Data transformations and format/validator functions

Lower priority:
- Simple presentational components
- Type re-exports
- Configuration files

### 4. Generate Tests
For each gap, create:
- **Unit tests** for isolated logic (utils, hooks)
- **Component tests** for UI behavior
- **Edge case tests** for boundary conditions

Place tests co-located next to the code being tested (e.g., `format.test.ts` next to `format.ts`).

## Test Types to Add

### Happy Path
```typescript
it("formats currency correctly", () => {
  const result = formatCurrency(1850);
  expect(result).toBe("$1,850");
});
```

### Error Cases
```typescript
it("returns null for invalid input", () => {
  const result = calculateEfficiency({ consumption: -1, area: 0 });
  expect(result).toBeNull();
});
```

### Edge Cases
```typescript
it("handles zero values", () => { /* ... */ });
it("handles maximum values", () => { /* ... */ });
it("handles empty arrays", () => { /* ... */ });
it("handles undefined optional fields", () => { /* ... */ });
```

### Hook Testing
```typescript
it("returns loading state initially", () => {
  const { result } = renderHook(() => useProperty("p1"));
  expect(result.current.loading).toBe(true);
});
```

## Output

```markdown
## Coverage Report

### Current: X%
### Target: 80%

### Files Below Target
| File | Coverage | Priority |
|------|----------|----------|
| usePropertyCalculations.ts | 65% | High |
| formatCurrency.ts | 72% | High |

### Suggested Tests
1. `usePropertyCalculations` - Missing error case tests
2. `formatCurrency` - Missing boundary tests

### After Adding Tests
- Run: `npm test`
- Verify: Coverage increased to X%
```

## Related Commands

- `/verify` - Run full checks after adding tests
- `/commit` - Commit new tests with `test:` type
