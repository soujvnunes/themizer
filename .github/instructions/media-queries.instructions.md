---
applyTo: "src/lib/validators.ts,**/*.test.ts"
---

# Media Query Validation

## Critical Rule

**Media query validation MUST support both numeric values AND keyword values.**

## The Pattern

The `MEDIA_QUERY_FEATURE_PATTERN` in `src/lib/validators.ts` (line 160-161) uses this regex:

```regex
/\([\w-]+:\s*(?:\d+(?:\.\d+)?[a-z%]*|\w+(?:-\w+)*)(?:\s+(?:\d+(?:\.\d+)?[a-z%]*|\w+(?:-\w+)*))*\)/i
```

## What This Supports

### Numeric Values
- `(min-width: 768px)` - pixel values
- `(max-width: 1024px)` - pixel values
- `(width: 50%)` - percentage values
- `(height: 10.5em)` - decimal values with units
- `(aspect-ratio: 16 9)` - multi-value numeric

### Keyword Values
- `(prefers-color-scheme: dark)` - single keyword
- `(prefers-color-scheme: light)` - single keyword
- `(orientation: landscape)` - single keyword
- `(orientation: portrait)` - single keyword
- `(prefers-reduced-motion: no-preference)` - hyphenated keyword
- `(prefers-reduced-motion: reduce)` - single keyword
- `(prefers-contrast: more)` - single keyword

## Why Both Are Required

The default config template in `src/cli/init.ts` (line 22) includes:

```typescript
const medias = {
  dark: '(prefers-color-scheme: dark)',
  // ...
}
```

If the regex only accepted numeric values, this would fail validation and break the default configuration.

## Common Bug

**INCORRECT**: Using a regex that only matches numeric values like `\d+(?:\.\d+)?[a-z%]*`

This rejects all keyword-based media queries, causing validation to fail on perfectly valid CSS media queries.

## Pattern Breakdown

```regex
(?:
  \d+(?:\.\d+)?[a-z%]*     # Numeric: 768px, 50%, 10.5em
  |                         # OR
  \w+(?:-\w+)*             # Keyword: dark, no-preference, landscape
)
```

## Invalid Values Rejected

- `(min-width: 7.5.3px)` - multiple decimals
- `(width: 7..5px)` - consecutive decimals
- `(height: %%)` - no digits, no valid keyword
- `(width: /)` - orphan slash

## Related Commit

See commit 8cf548e which fixed the media query regex bug to support keyword values.

## Testing

When writing tests for media query validation, always include test cases for both:
1. Numeric values with various units
2. Keyword values including hyphenated keywords

Example test cases should exist for:
- `(prefers-color-scheme: dark)` ✓
- `(min-width: 768px)` ✓
- `(orientation: landscape)` ✓
