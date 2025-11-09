---
"themizer": minor
---

Add CSS @property registration for type validation and browser optimization

This release introduces automatic CSS `@property` registration for all generated custom properties, providing type validation and browser optimization.

**New Features:**

- Automatic type inference for CSS custom properties (colors, lengths, percentages, angles, time values, etc.)
- CSS `@property` at-rule generation with syntax validation
- Comprehensive support for 160+ CSS named colors and all CSS syntax types

**Type Validation Benefits:**

- Browsers now validate that custom property values match their declared syntax types
- Prevents type mismatches (e.g., setting a `<color>` to `16px`)
- Type-safe custom properties with automatic type detection

**Breaking Changes:**

None - This feature is fully backward compatible. Existing configurations will automatically benefit from `@property` registration.

**Example:**

```typescript
export default themizer(
  {
    prefix: 'theme',
    medias: {},
    tokens: {
      colors: { primary: 'oklch(76.9% 0.188 70.08)' },
      spacing: { md: '1rem' }
    }
  },
  ({ colors }) => ({ foreground: colors.primary })
)
```

Generated CSS now includes:

```css
@property --theme-tokens-colors-primary {
  syntax: "<color>";
  inherits: false;
  initial-value: oklch(76.9% 0.188 70.08);
}
```
