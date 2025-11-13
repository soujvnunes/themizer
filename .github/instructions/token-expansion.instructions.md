---
applyTo: "src/lib/expandColor.ts,src/lib/expandUnits.ts,src/lib/shouldExpandColor.ts,src/lib/shouldExpandUnits.ts,src/lib/expandTokens.ts,**/*.test.ts"
---

# Token Expansion Guidelines

## Critical Rules

**Token expansion is automatic and happens at build time. The expansion logic must be deterministic and produce consistent, harmonious results.**

## Color Expansion Algorithm

### OKLCH Color Expansion (Palette Property)

When a single OKLCH color string is provided in the `palette` property, it MUST expand to exactly 7 shades with these specific values:

```typescript
const shades = {
  lightest: { L: 98.92%, C: 0.0102, H: base + 11.72° },
  lighter:  { L: 96.2%, C: base × 0.314, H: base + 25.537° },
  light:    { L: base + 5.9%, C: base × 1.005, H: base + 14.349° },
  base:     { L: original, C: original, H: original },
  dark:     { L: base - 10.3%, C: base × 0.952, H: base - 11.762° },
  darker:   { L: 35%, C: base × 0.41, H: base - 24.435° },
  darkest:  { L: 14.92%, C: 0.0268, H: base + 15.67° }
}
```

### Algorithm Characteristics

1. **Variable Chroma**: Extremes (lightest/darkest) use fixed low chroma values for better contrast
2. **Sophisticated Hue Shifts**: Warm shifts for light tones (+11.72° to +25.537°), cool shifts for dark tones (-11.762° to -24.435°)
3. **Precision**: Use `PRECISION_MULTIPLIER = 1e10` to avoid floating-point errors
4. **Lightness Curve**: Non-linear progression for perceptual uniformity with relative offsets for light/dark

### Type Guards

```typescript
// Check if color should be expanded (must be in palette context)
export function shouldExpandColor(value: unknown, contextPath: string): value is string {
  const isInPaletteContext = contextPath.endsWith('palette-')
  return isInPaletteContext &&
         typeof value === 'string' &&
         value.startsWith('oklch(')
}

// Expanded colors are always objects with shade keys
export function isExpandedColors(value: unknown): value is ColorShades {
  return isPlainObject(value) && 'base' in value
}
```

## Units Expansion

### Units Configuration Format

The `units` property accepts ONLY CSS unit types as keys, with expansion tuples as values:

```typescript
units: {
  rem: [0, 0.25, 4],        // from, step, to
  px: [0, 4, 64],
  percentage: [0, 10, 100]
}
```

**IMPORTANT:** Custom named values (like "spacing") must be defined as separate token properties, NOT nested within units. The units property is strictly for CSS unit types only.

### Expansion Logic

For tuple `[from, step, to]`:
1. Start at `from`
2. Increment by `step`
3. Continue until reaching `to` (inclusive)
4. Generate numeric keys with unit suffix

Example: `rem: [0, 0.25, 1]` generates:
- `0`: "0rem"
- `1`: "0.25rem"
- `2`: "0.5rem"
- `3`: "0.75rem"
- `4`: "1rem"

### Type Guards

```typescript
// Check if units should be expanded
export function shouldExpandUnits(value: unknown): boolean {
  if (Array.isArray(value) && value.length === 3) return true
  if (isPlainObject(value)) {
    return Object.values(value).every(v =>
      Array.isArray(v) && v.length === 3
    )
  }
  return false
}
```

### Supported Unit Types

```typescript
type CSSUnitType =
  | 'rem' | 'em' | 'px'
  | 'percentage' | 'vh' | 'vw'
  | 'vmin' | 'vmax' | 'ch' | 'ex'
```

## Implementation Requirements

### Color Expansion

1. **Parse OKLCH**: Extract L, C, H components from string
2. **Generate Shades**: Apply algorithm with fixed lightness values
3. **Handle Precision**: Use multipliers to avoid floating-point errors
4. **Format Output**: Return as `ColorShades` object with all 7 keys

### Units Expansion

1. **Detect Format**: Object with unit types or simple tuple
2. **Calculate Steps**: Determine number of steps from range
3. **Generate Values**: Create numeric keys with unit suffixes
4. **Type Safety**: Maintain type information for IntelliSense

## Testing Requirements

### Color Expansion Tests

```typescript
describe('expandColor', () => {
  it('should expand OKLCH to 7 shades', () => {
    const result = expandColor('oklch(76.9% 0.188 70.08)')
    expect(result).toHaveProperty('lightest')
    expect(result).toHaveProperty('darkest')
    expect(Object.keys(result)).toHaveLength(7)
  })

  it('should apply warm hue shifts at extremes', () => {
    const result = expandColor('oklch(50% 0.1 180)')
    expect(result.lightest).toContain('183') // +3° hue
    expect(result.darkest).toContain('183')  // +3° hue
  })

  it('should use variable chroma', () => {
    const result = expandColor('oklch(50% 0.2 180)')
    expect(result.lightest).toContain('0.0102') // Fixed low chroma
    expect(result.light).toContain('0.1')       // 0.5x base
    expect(result.darkest).toContain('0.0268')  // Fixed higher chroma
  })
})
```

### Units Expansion Tests

```typescript
describe('expandUnits', () => {
  it('should expand object format with multiple units', () => {
    const result = expandUnits({
      rem: [0, 0.25, 1],
      px: [0, 4, 16]
    })
    expect(result.rem[4]).toBe('1rem')
    expect(result.px[4]).toBe('16px')
  })

  it('should handle floating-point precision', () => {
    const result = expandUnits({ rem: [0, 0.1, 1] })
    expect(result.rem[3]).toBe('0.3rem') // Not 0.30000000000000004rem
  })

  it('should generate numeric keys', () => {
    const result = expandUnits({ px: [0, 10, 30] })
    expect(result.px[0]).toBe('0px')
    expect(result.px[1]).toBe('10px')
    expect(result.px[2]).toBe('20px')
    expect(result.px[3]).toBe('30px')
  })
})
```

## Common Pitfalls

### DON'T:
- Change the expansion algorithm without updating tests
- Forget to handle floating-point precision
- Mix expanded and non-expanded formats
- Assume all OKLCH colors should be expanded (check for palette context)
- Expand colors in the `colors` property (only `palette` expands)

### DO:
- Use type guards to determine expansion needs
- Check for palette context before expanding colors
- Apply precision multipliers for calculations
- Maintain backwards compatibility with tuple format
- Document any algorithm changes in changeset

## Performance Considerations

- Expansion happens once at build time
- Results are cached during watch mode
- No runtime expansion overhead
- Type information preserved for IDE support

## Related Files

- Implementation: `src/lib/expandColor.ts`, `src/lib/expandUnits.ts`
- Type guards: `src/lib/shouldExpandColor.ts`, `src/lib/shouldExpandUnits.ts`
- Main expansion: `src/lib/expandTokens.ts`
- Tests: `src/lib/*.test.ts`

## Version History

- **v1.6.4**: Enhanced color algorithm with variable chroma
- **v1.6.4**: Added object-based units format
- **v1.6.0**: Initial automatic expansion implementation