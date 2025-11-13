# Themizer Development Guidelines

## Project Overview

Themizer is a type-safe CSS theming library that generates CSS custom properties with automatic token expansion, minification, and source maps. It follows atomic design principles: tokens → aliases → components.

## Core Architecture

### Module Organization
- `src/lib/` - Pure utility functions (no side effects)
- `src/cli/` - CLI commands with file I/O and user interaction
- `src/core/` - Core themizer functionality (side-effect free)
- `src/helpers/` - Helper functions for config execution and file writing

### Design Principles
- **Pure Functions**: Library functions have no side effects, return values only
- **Type Safety**: Extensive use of TypeScript generics and type guards
- **Framework Agnostic**: Core library works with any framework
- **Build-Time Processing**: All token expansion happens at build time

## Token Expansion System

### Color Expansion (Palette Property)
When a single OKLCH color string is provided in the `palette` property, it automatically expands to 7 harmonious shades:

```typescript
palette: {
  amber: 'oklch(76.9% 0.188 70.08)' // Generates 7 shades
}
```

**Expansion algorithm:**
- `lightest`: L=98.92%, C=0.0102, H+3° (warm shift)
- `lighter`: L=95%, C=0.05×base
- `light`: L=85%, C=0.5×base
- `base`: Original color
- `dark`: L=65%, C=0.8×base
- `darker`: L=35%, C=0.5×base
- `darkest`: L=14.92%, C=0.0268, H+3° (warm shift)

**Variable chroma at extremes** provides better visual harmony.

### Units Expansion

**Units configuration** (CSS unit types ONLY):
```typescript
units: {
  rem: [0, 0.25, 4],    // 0, 0.25, 0.5, 0.75... 4rem
  px: [0, 4, 64]        // 0, 4, 8, 12... 64px
}
```

**Supported unit types:** rem, em, px, percentage, vh, vw, vmin, vmax, ch, ex

**Type-safe access:**
- `units.rem[4]` → "1rem"
- `units.px[8]` → "32px"

**Important:** Custom named values (like "spacing") must be defined as separate token properties, NOT nested in units.

## CSS Generation Features

### Minification System
- **Always-on** with base-52 encoding (a-z, A-Z)
- Provides 520 single-letter variables before double letters
- **Prefix-aware**: `--ds0` (design system), `--ui0` (UI components)
- **~88% size reduction** with automatic source maps
- Source maps in `theme.css.map.json` for debugging

### CSS @property Registration
All custom properties are registered with `@property` rules:
- **Automatic type inference** (colors, lengths, percentages, angles, time)
- **Browser-enforced validation** prevents type mismatches
- **Support for 160+ CSS named colors**
- Available via `getJSS()` for JavaScript integration

## CLI Commands

### init Command
```bash
themizer init [--out-dir <path>] [--watch]
```

**Features:**
- **Framework auto-detection**: Next.js (App/Pages Router), Remix, Vite, CRA
- **Interactive prompts** for output directory selection
- **Non-interactive mode** with `--out-dir` flag
- **Shell escaping** for paths with spaces in package.json scripts
- **Validation** of output paths and package.json structure

### theme Command
```bash
themizer theme [--watch] [--out-dir <path>]
```

**Features:**
- **Watch mode** with automatic regeneration
- **Cache busting** for configuration changes
- **Graceful shutdown** handlers for cleanup

## Code Patterns and Standards

### TypeScript Patterns
```typescript
// Type guards (predicates)
function isPlainObject(value: unknown): value is Record<string, unknown>

// Assertion functions
function validatePlainObject(value: unknown): asserts value is Record<string, unknown>

// Const generics for inference
function atomizer<const TAtoms extends Atoms>(atoms: TAtoms): ResolveAtoms<TAtoms>
```

### Validation Patterns
- **Two-function pattern**: Predicates (`is*`) and assertions (`validate*`)
- **Media queries**: Support both numeric (`768px`) and keyword (`dark`) values
- **Path validation**: Prevent directory traversal attacks
- **Shell escaping**: Single quotes for paths with spaces

### Testing Requirements
- **Test files**: Alongside source as `*.test.ts`
- **Assertion order**: Call verification → argument verification → return verification
- **Mock patterns**: Dependency injection for testability
- **Coverage**: Both numeric and keyword media queries

## Security Practices

### Path Validation
```typescript
// Always validate user-provided paths
const resolved = path.resolve(userPath)
if (!resolved.startsWith(process.cwd())) {
  throw new Error('Path traversal detected')
}
```

### Shell Escaping
```typescript
// Required for package.json scripts
import { escapeSingleQuotes } from './shellEscape'
const command = `themizer theme --out-dir ${escapeSingleQuotes(outDir)}`
```

### JSON Parsing
```typescript
// Always use try-catch with structure validation
try {
  const data = JSON.parse(input)
  validatePlainObject(data)
} catch (error) {
  // Handle parsing or validation error
}
```

## Configuration Best Practices

### Recommended Structure
```typescript
import themizer from 'themizer'

const alpha = (color: string, percentage: string) =>
  `color-mix(in srgb, ${color} ${percentage}, transparent)`

export default themizer(
  {
    prefix: 'theme',
    medias: {
      dark: '(prefers-color-scheme: dark)',
      tablet: '(min-width: 768px)',
    },
    tokens: {
      // Auto-expand properties
      palette: {
        amber: 'oklch(76.9% 0.188 70.08)', // Generates 7 shades
      },
      units: {
        rem: [0, 0.25, 4],  // Generates numeric scale
        px: [0, 4, 64]
      },

      // Full control properties
      colors: {
        blue: {
          light: 'oklch(70% 0.15 240)',
          base: 'oklch(60% 0.2 240)',
          dark: 'oklch(50% 0.15 240)',
        }
      },
      // Custom named values as separate property
      spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '2rem'
      },
    },
  },
  ({ palette, colors, units, spacing }) => ({
    // Semantic aliases from tokens
    brand: {
      primary: {
        base: palette.amber.base,
        hover: palette.amber.dark,
      },
      accent: colors.blue.base,
    },
    layout: {
      gap: {
        sm: units.px[2],     // 8px
        md: units.rem[1],    // 1rem
        lg: spacing.large,   // Using named spacing
      },
    },
  })
)
```

## Performance Optimizations

### Build-Time Processing
- Token expansion at build time (zero runtime cost)
- Source maps as separate files (no runtime overhead)
- Minification reduces CSS by ~88%

### Runtime Performance
- O(1) lookups with Map structures
- Floating-point precision handling (multiplier: 1e10)
- Efficient file watching with debouncing

## Error Handling Guidelines

### User-Friendly Messages
```typescript
// Provide context and solutions
throw new Error(
  `Invalid OKLCH color format. Expected "oklch(L% C H)" format, got: ${value}\n` +
  `Example: oklch(76.9% 0.188 70.08)`
)
```

### Graceful Degradation
- Fall back to defaults when possible
- Log warnings for recoverable errors
- Preserve partial functionality

## Recent Feature Highlights

### v1.6.4 (Latest)
- Enhanced color expansion with variable chroma
- New object-based units format for multiple unit types
- Improved precision handling in calculations

### v1.6.3
- CSS @property registration for all custom properties
- Support for 160+ CSS named colors
- Type validation at browser level

### v1.6.0
- Always-on minification with base-52 encoding
- Automatic source map generation
- Prefix-aware variable naming

### v1.4.0
- Watch mode support with cache busting
- Framework auto-detection
- Interactive CLI prompts

## Common Abbreviations

- `r8e` - "responsive" (responsive atoms)
- `jss` - JavaScript Style Sheets
- `ds` - Design system prefix
- `ui` - User interface prefix

## When Suggesting Code

### DO:
- Use OKLCH colors for automatic shade generation
- Use object format for units when multiple types needed
- Place semantic aliases in factory function
- Use dedicated file tools (Read, Edit, Write)
- Follow two-function validation pattern
- Include JSDoc with examples

### DON'T:
- Use bash commands for file operations
- Mix predicates and assertions
- Create files without validation
- Skip error handling
- Ignore shell escaping for paths

## Related Documentation

See path-specific instructions in `.github/instructions/`:
- `media-queries.instructions.md` - Media query validation patterns
- `shell-escaping.instructions.md` - Path escaping requirements
- `testing.instructions.md` - Test assertion ordering
- `validation.instructions.md` - Validation function patterns