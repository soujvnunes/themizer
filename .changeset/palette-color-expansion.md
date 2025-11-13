---
"themizer": minor
---

Add automatic color palette expansion with new `palette` token property

## New Feature: `palette` Property

Introduce a dedicated `palette` property for automatic OKLCH color expansion. This provides explicit control over which colors are expanded into 7 harmonious shades.

### Usage

```ts
export default themizer(
  {
    tokens: {
      // Auto-expand OKLCH colors into 7 shades
      palette: {
        amber: 'oklch(76.9% 0.188 70.08)',
        // Generates: lightest, lighter, light, base, dark, darker, darkest
      },

      // Manual color definitions (no expansion)
      colors: {
        blue: { 500: '#3b82f6', 700: '#1d4ed8' },
        red: '#ff0000',
      }
    }
  },
  ({ palette, colors }) => ({
    // Semantic aliases from tokens
    brand: {
      base: palette.amber.base,
      light: palette.amber.light,
      accent: colors.blue[500],
    }
  })
)
```

## Features

- **Type-safe**: `palette` only accepts OKLCH format strings - invalid formats throw clear errors
- **Explicit expansion**: Clear distinction between auto-expanding colors (`palette`) and manual definitions (`colors`)
- **Harmonious shades**: Generates 7 perceptually-balanced shades with variable chroma and warm hue shifts
- **Runtime validation**: `validatePaletteConfig` ensures only valid OKLCH strings are provided

## Generated Shades

Each color in `palette` expands to:
- `lightest` (L: 98.92%, low chroma, +3° hue)
- `lighter` (L: 96.2%, reduced chroma)
- `light` (L: 82.8%, half chroma)
- `base` (original color)
- `dark` (L: 66.6%, 80% chroma)
- `darker` (L: 35%, half chroma)
- `darkest` (L: 14.92%, low chroma, +3° hue)

## Error Handling

```ts
palette: {
  // ✅ Valid
  amber: 'oklch(76.9% 0.188 70.08)',

  // ❌ Error: not OKLCH format
  red: '#ff0000',

  // ❌ Error: can't use object notation
  blue: { 500: 'oklch(50% 0.15 240)' },
}
```