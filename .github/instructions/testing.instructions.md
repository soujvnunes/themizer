---
applyTo: "**/*.test.ts,**/*.spec.ts"
---

# Test Assertion Ordering

## Critical Rule

**Always verify function calls BEFORE verifying return values.**

## The Logical Order

When testing mocked functions, assertions must follow logical execution order:

1. **First**: Verify the function was called
2. **Second**: Verify the function was called with correct arguments
3. **Third**: Verify the function returned the expected value

## Why This Matters

A function cannot return a value if it was never called. Checking the return value before checking the call is logically backwards and confusing for developers reading the test.

## Correct Pattern

```typescript
// ✓ CORRECT: Call verification → Return verification
expect(mockFunction).toHaveBeenCalled()
expect(mockFunction).toHaveBeenCalledWith(expectedArg1, expectedArg2)
expect(mockFunction).toHaveReturnedWith(expectedValue)
```

## Incorrect Pattern

```typescript
// ✗ INCORRECT: Return verification → Call verification
expect(mockFunction).toHaveReturnedWith(expectedValue)        // Wrong: checking return first
expect(mockFunction).toHaveBeenCalledWith(expectedArg1, expectedArg2)  // Wrong: checking call after
```

## Real Example from Codebase

**Before** (incorrect order in `src/helpers/ThemeTempFile.test.ts`):
```typescript
function expectPath(tempFile: string) {
  expect(os.tmpdir).toHaveBeenCalled()
  expect(os.tmpdir).toHaveReturnedWith(TEMP_DIR)
  expect(path.join).toHaveReturnedWith(tempFile)                     // ✗ Return checked first
  expect(path.join).toHaveBeenCalledWith(TEMP_DIR, TEMP_FILE_NAME)  // ✗ Call checked after
}
```

**After** (correct order):
```typescript
function expectPath(tempFile: string) {
  expect(os.tmpdir).toHaveBeenCalled()
  expect(os.tmpdir).toHaveReturnedWith(TEMP_DIR)
  expect(path.join).toHaveBeenCalledWith(TEMP_DIR, TEMP_FILE_NAME)  // ✓ Call checked first
  expect(path.join).toHaveReturnedWith(tempFile)                     // ✓ Return checked after
}
```

## Test Helper Functions

When creating helper functions that perform multiple assertions:

1. Group assertions by the function being tested
2. Within each group, maintain logical order (call → return)
3. Add comments if the ordering isn't obvious

```typescript
function expectMockBehavior(mock: jest.Mock, expectedArg: string, expectedReturn: string) {
  // Verify the call was made correctly
  expect(mock).toHaveBeenCalled()
  expect(mock).toHaveBeenCalledWith(expectedArg)

  // Verify the return value
  expect(mock).toHaveReturnedWith(expectedReturn)
}
```

## Multiple Mock Functions

When testing multiple mocked functions, maintain logical order for each:

```typescript
// ✓ CORRECT: Group by function, maintain order within each group
expect(functionA).toHaveBeenCalled()
expect(functionA).toHaveBeenCalledWith(argA)
expect(functionA).toHaveReturnedWith(returnA)

expect(functionB).toHaveBeenCalled()
expect(functionB).toHaveBeenCalledWith(argB)
expect(functionB).toHaveReturnedWith(returnB)
```

## Jest Matchers Reference

Common assertion order for Jest mocks:

1. `toHaveBeenCalled()` - verifies function was invoked
2. `toHaveBeenCalledTimes(n)` - verifies number of calls
3. `toHaveBeenCalledWith(...)` - verifies arguments
4. `toHaveBeenLastCalledWith(...)` - verifies last call arguments
5. `toHaveReturnedWith(...)` - verifies return value
6. `toHaveLastReturnedWith(...)` - verifies last return value

## Exceptions

The only time you might check return before call is when you're specifically testing error scenarios where the call pattern isn't important, but this should be rare and well-commented.

## When Reordering Assertions

If you find test assertions in the wrong order:

1. Identify each mock function being tested
2. Group assertions by function
3. Reorder to: call checks → argument checks → return checks
4. Ensure the test still passes after reordering
5. Add a comment explaining the logical flow if helpful
