---
"themizer": minor
---

Improve type inference for units expansion with literal types

## Enhanced Type Inference

Added literal type inference for standard unit configurations, providing IntelliSense autocomplete for common scales.

### Features

- **Literal types for standard configs**: Common unit configurations now provide exact value autocomplete
- **Fallback for custom configs**: Non-standard configurations still work with generic number types
- **Better IntelliSense display**: Units now show actual object structure instead of `Record<>` notation

### Standard Configurations

```ts
// Standard rem scale [0, 0.25, 4] - shows available values in IntelliSense
theme.tokens.units.rem[0.5]  // ✅ Valid - IntelliSense shows: 0, 0.25, 0.5, 0.75, 1, ...

// Standard px scales
[0, 4, 16]   // Small scale: 0, 4, 8, 12, 16
[0, 4, 64]   // Default scale: 0, 4, 8, 12, 16, 20, 24, ...
[0, 8, 128]  // Large scale: 0, 8, 16, 24, 32, ...
```

### Type Helpers

New helper types in `src/types/helpers.ts`:

```ts
// Extract available unit keys
type Keys = ExtractUnitKeys<{ rem: [0, 0.25, 4] }>
// Keys['rem'] = 0 | 0.25 | 0.5 | ... | 4

// Type-safe unit values
type RemValue = UnitValue<Config, 'rem'>

// Infer complete theme structure
type Theme = InferTokens<ConfigType>
```

### TypeScript Support

- Added scale types: `RemScale`, `PxScale`, `PercentageScale`, etc.
- `ConfigToScale` type mapping for automatic inference
- `ExpandedUnits` type improved to show object structure