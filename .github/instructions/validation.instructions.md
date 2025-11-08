---
applyTo: "src/lib/validators.ts,**/*.ts"
---

# Validation Function Patterns

## Critical Rule

**Always use the established validation pattern: separate predicate functions from assertion functions.**

## The Pattern

This project uses a two-function pattern for validation:

### 1. Predicate Functions (Type Guards)

**Naming**: `is[Something]()`
**Returns**: `boolean`
**Purpose**: Type guard for conditional checks

```typescript
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
```

**Usage**:
```typescript
if (isPlainObject(data)) {
  // TypeScript now knows data is Record<string, unknown>
  const keys = Object.keys(data)
}
```

### 2. Assertion Functions

**Naming**: `validate[Something]()`
**Returns**: `void` (or throws)
**Purpose**: Assertion for required validation with type narrowing

```typescript
export function validatePlainObject(value: unknown): asserts value is Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new Error('Value must be a plain object (not null, array, or primitive)')
  }
}
```

**Usage**:
```typescript
const data = JSON.parse(jsonString)
validatePlainObject(data)
// TypeScript now knows data is Record<string, unknown>
// Code continues with validated type
```

## Key Differences

| Aspect | `is*()` Predicate | `validate*()` Assertion |
|--------|------------------|------------------------|
| Returns | `boolean` | `void` (throws on error) |
| Type annotation | `value is Type` | `asserts value is Type` |
| Use case | Conditional checks | Required validation |
| Error handling | Caller decides | Throws immediately |

## TypeScript Keywords

### Type Guard: `value is Type`

Used in predicates to narrow types in conditional blocks:

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string'
}
```

### Assertion Function: `asserts value is Type`

Used in validation functions to narrow types after the call:

```typescript
function validateString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Expected string')
  }
}
```

## When to Use Each

### Use `is*()` when:
- You need conditional logic
- Multiple outcomes are valid
- The caller will handle the false case

```typescript
if (isPlainObject(packageJson.dependencies)) {
  dependencies = packageJson.dependencies
} else {
  dependencies = {}
}
```

### Use `validate*()` when:
- Validation failure should stop execution
- The value MUST pass validation to continue
- Clear error messages are needed

```typescript
validatePlainObject(packageJson)
// If we reach here, packageJson is guaranteed to be a plain object
```

## Examples from Codebase

See `src/lib/validators.ts`:
- `isValidCSSIdentifier()` (line 24) - predicate
- `validatePrefix()` (line 46) - assertion
- `isValidMediaQuery()` (line 153) - predicate
- `validateMediaQuery()` (line 204) - assertion
- `isPlainObject()` (line 73) - predicate with type guard
- `validatePlainObject()` (line 91) - assertion with type narrowing

## Do Not Mix Patterns

**INCORRECT**: Having only validation functions that throw, with no predicate alternative
**INCORRECT**: Having predicates that throw errors instead of returning false
**CORRECT**: Provide both predicate and assertion when validation is needed in different contexts

## Related TypeScript Features

- Type guards: `value is Type`
- Assertion functions: `asserts value is Type`
- Type narrowing after assertions
- Control flow analysis
