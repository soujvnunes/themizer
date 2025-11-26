# themizer

> Transform verbose CSS utility classes into semantic, maintainable design tokens

[![npm version](https://img.shields.io/npm/v/themizer.svg)](https://www.npmjs.com/package/themizer)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/themizer.svg)](https://github.com/soujvnunes/themizer/blob/main/LICENSE)

## The Problem

Building maintainable design systems requires design tokens, but most CSS workflows don't support them:

**With utility classes:**

```tsx
// Button.tsx
<button className="bg-amber-500 hover:bg-amber-600 p-6 opacity-80 transition-all duration-200 ease-in-out">
  {/* Hardcoded spacing (p-6 = 1.5rem), opacity (80%), transition values */}
</button>

// Card.tsx
<div className="p-10 md:p-16 opacity-60 bg-amber-950/80 dark:bg-amber-50">
  {/* Same spacing values in pixels/rem scattered everywhere */}
</div>
```

**With CSS-in-JS:**

```tsx
const Button = styled.button`
  background: color-mix(in srgb, oklch(6% 0.02 70) 80%, transparent);
  padding: 1.5rem; /* Repeated in 20 files */
  transition: 200ms cubic-bezier(0.25, 0.1, 0.25, 1); /* Complex easing repeated */

  &:hover {
    background: oklch(66.6% 0.179 58.318);
    opacity: 0.6; /* Magic number */
  }

  @media (width >= 1024px) {
    padding: 2.5rem; /* Desktop spacing hardcoded */
    font-size: 4rem; /* Typography scales repeated */
  }
`
```

Without design tokens, you get:

- Hard-coded values scattered across components
- No single source of truth for your design system
- No way to rebrand without find-and-replace
- Zero type safety

## The Solution

**themizer** generates type-safe design tokens and semantic aliases. Define tokens once, compose them into aliases, build components from aliases.

```ts
// themizer.config.ts
import themizer from 'themizer'

const alpha = (color: string, percentage: string) => `color-mix(in srgb, ${color} ${percentage}, transparent)`

export const theme = themizer(
  {
    prefix: 'theme',
    medias: {
      desktop: '(width >= 1024px)',
      desktopPortrait: '(width >= 1024px) and (orientation: portrait)',
      dark: '(prefers-color-scheme: dark)',
      motion: '(prefers-reduced-motion: no-preference)',
    },
    tokens: {
      // `palette` expands OKLCH colors into 7 shades
      palette: {
        /* palette.amber.lightest // oklch(98.92% 0.0102 81.8)
         * palette.amber.lighter  // oklch(96.2% 0.059 95.617)
         * palette.amber.light    // oklch(82.8% 0.189 84.429)
         * palette.amber.base     // oklch(76.9% 0.188 70.08)
         * palette.amber.dark     // oklch(66.6% 0.179 58.318)
         * palette.amber.darker   // oklch(35% 0.0771 45.635)
         * palette.amber.darkest  // oklch(14.92% 0.0268 85.77)
         */
        amber: 'oklch(76.9% 0.188 70.08)',
      },
      alphas: {
        100: '100%',
        80: '80%',
        60: '60%',
      },
      // `units` generates numeric scales from [start, step, end]
      units: {
        /* units.rem[0]    // '0rem'
         * units.rem[0.25] // '0.25rem'
         * units.rem[0.5]  // '0.5rem'
         * units.rem[0.75] // '0.75rem'
         * units.rem[1]    // '1rem'
         * units.rem[1.25] // '1.25rem'
         * units.rem[1.5]  // '1.5rem'
         * units.rem[1.75] // '1.75rem'
         * units.rem[2]    // '2rem'
         * units.rem[2.25] // '2.25rem'
         * units.rem[2.5]  // '2.5rem'
         * units.rem[2.75] // '2.75rem'
         * units.rem[3]    // '3rem'
         * units.rem[3.25] // '3.25rem'
         * units.rem[3.5]  // '3.5rem'
         * units.rem[3.75] // '3.75rem'
         * units.rem[4]    // '4rem'
         */
        rem: [0, 0.25, 4],
      },
      transitions: {
        bounce: '200ms cubic-bezier(0.5, -0.5, 0.25, 1.5)',
        ease: '200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  ({ palette, alphas, units, transitions }) => ({
    // Semantic aliases composed from tokens
    colors: {
      main: palette.amber.base,
      ground: {
        fore: [{ dark: palette.amber.lightest }, alpha(palette.amber.darkest, alphas[80])],
        back: [{ dark: palette.amber.darkest }, palette.amber.lightest],
      },
    },
    typography: {
      headline: [{ desktop: units.rem[4] }, units.rem[2.5]],
      title: [{ desktop: units.rem[2.5] }, units.rem[1.5]],
      body: units.rem[1],
    },
    spacing: {
      section: [{ desktopPortrait: units.rem[4] }, units.rem[2.5]],
      block: units.rem[1.5],
    },
    animations: {
      bounce: [{ motion: transitions.bounce }],
      ease: [{ motion: transitions.ease }],
    },
  }),
)
```

**Build components with semantic aliases:**

```tsx
// Card with responsive spacing
<div className="bg-ground-back p-spacing-section">
  <h1 className="text-typography-headline text-ground-fore">Title</h1>
  <p className="text-typography-body mt-spacing-block">Content</p>
</div>

// Hero section with animations
import { theme } from './themizer.config'

const Hero = styled.section`
  background: ${theme.aliases.colors.main};
  padding: ${theme.aliases.spacing.section}; /* Responsive: 2.5rem mobile, 4rem desktop portrait */
  transition: ${theme.aliases.animations.bounce}; /* Only applies when motion is preferred */
`

const Button = styled.button`
  background: ${theme.aliases.colors.ground.back};
  color: ${theme.aliases.colors.ground.fore}; /* Color with 80% alpha */
  padding: ${theme.aliases.spacing.block};
  font-size: ${theme.aliases.typography.title}; /* Responsive: 1.5rem mobile, 2.5rem desktop */
  transition: ${theme.aliases.animations.ease};

  &:hover {
    opacity: ${theme.tokens.alphas[60]};
  }
`
```

Single source of truth. Responsive by default. Type-safe tokens.

## Features

### Token Types

**themizer** supports both automatic expansion and manual definition:

#### Automatic Expansion
- **`palette`**: Single OKLCH color → 7 harmonious shades
- **`units`**: `[from, step, to]` tuples → complete numeric scales

#### Manual Definition
Define exact values when you need precise control:

```ts
tokens: {
  // Auto-expand properties
  palette: {
    amber: 'oklch(76.9% 0.188 70.08)',  // → 7 shades
    // blue: '#3b82f6',                 // ❌ Error: must be OKLCH
  },
  units: {
    rem: [0, 0.25, 4],                   // → 17 values (0, 0.25, 0.5... 4rem)
    px: [0, 4, 64],                      // → 17 values (0, 4, 8... 64px)
  },

  // Full control properties
  colors: {
    blue: {
      50: '#eff6ff',
      500: '#3b82f6',
      950: '#172554',
    },
    brand: '#ff0000',
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
  },
  anyPropertyName: {
    // Your custom tokens
  }
}
```

### Atomic Design

Build from atoms (tokens) → molecules (aliases) → organisms (components):

```ts
// Atoms (tokens)
palette.amber.base        // Raw expanded color value
units.rem[1.5]           // Raw spacing value (1.5rem)

// Molecules (aliases)
colors.ground.fore       // Semantic color
spacing.block            // Semantic spacing

// Organisms (components)
<Card className="bg-ground-back p-spacing-block" />
```

### Type-Safe

Full TypeScript support with autocomplete:

```ts
theme.aliases.colors.main  // ✓ Autocomplete
theme.aliases.colors.mian  // ✗ Type error
```

### Multiple Themes

Export multiple themes for complex design systems with multi-brand support. All themes are combined into a single `theme.css` file:

```ts
// themizer.config.ts
import themizer from 'themizer'

// Single theme (most common)
export const theme = themizer({ prefix: 'theme', tokens, medias }, () => ({}))

// Or multiple themes for multi-brand design systems
export const cocaCola = themizer({ prefix: 'coke', tokens: cokeTokens, medias }, () => ({}))
export const nike = themizer({ prefix: 'nike', tokens: nikeTokens, medias }, () => ({}))
```

When you run `pnpm run themizer:theme`, all exported themes are combined:

```bash
themizer: theme.css written to ./src/app (2 themes: cocaCola, nike)
```

Each theme uses its own prefix to avoid naming conflicts, and all CSS custom properties are combined into a single optimized file.

### Responsive by Default

Media queries configured once, applied everywhere:

```ts
// Define once
medias: {
  desktop: '(width >= 1024px)',
  dark: '(prefers-color-scheme: dark)'
}

// Use in aliases
typography: {
  title: [{ desktop: units.rem[2.5] }, units.rem[1.5]]  // 2.5rem on desktop, 1.5rem mobile
}
```

### Production Ready

#### Minification

Base-52 encoding reduces CSS size by ~88%:

```ts
theme.aliases.colors.ground.fore  // generates → --themea2
```

#### Source Maps

Debug with `theme.css.map.json` which maps minified names to their object paths:

```json
{
  "--themea2": "--theme-aliases-colors-ground-fore"
}
```

#### CSS @property Registration

Browser-enforced type validation:

```css
@property --theme0 {
  syntax: "<color>";
  inherits: false;
  initial-value: oklch(98.92% 0.0102 81.8);
}
```

### Framework Agnostic

Works with any CSS framework - see [Framework Integration](#framework-integration).

## Quick Start

```bash
# Install themizer
pnpm add themizer

# Initialize (auto-detects your framework)
npx themizer init

# Generate theme.css
pnpm run themizer:theme
```

The `init` command creates `themizer.config.ts` with example tokens and adds a script to your `package.json`.

## Generate CSS

```bash
pnpm run themizer:theme        # Generate once
pnpm run themizer:theme:watch  # Watch mode (if configured with --watch)
```

Executes your `themizer.config.ts` and generates minified CSS with:

- CSS @property registration for type validation
- Base-52 encoded variable names (`--theme0`, `--themea1`) for smaller bundles
- Media query rules for responsive values and dark mode
- Source map (`theme.css.map.json`) for debugging

```css
:root {
  --theme0: oklch(98.92% 0.0102 81.8);  /* amber.lightest */
  --theme3: oklch(76.9% 0.188 70.08);   /* amber.base */
  --themea0: var(--theme3);              /* palette.main */
  --themea2: color-mix(in srgb, var(--theme6) var(--themea), transparent); /* palette.ground.fore */
}

@media (prefers-color-scheme: dark) {
  :root {
    --themea2: var(--theme0);      /* palette.ground.fore switches */
  }
}
```


## Framework Integration

Import the generated `theme.css` in your app's entry file:

```tsx
// app/layout.tsx, main.tsx, or _app.tsx
import './theme.css';
```

Now integrate with your styling solution.

### Tailwind CSS

Extend Tailwind's config with themizer aliases:

```js
// tailwind.config.js
import { theme } from './themizer.config';

const alpha = (color, percentage) =>
  `color-mix(in srgb, ${color} ${percentage}, transparent)`;

export default {
  theme: {
    extend: {
      spacing: theme.aliases.spacing,
      opacity: theme.tokens.alphas,
      colors: {
        main: theme.aliases.colors.main,
        ground: {
          fore: theme.aliases.colors.ground.fore,
          back: theme.aliases.colors.ground.back,
        },
        primary: {
          DEFAULT: theme.aliases.colors.main,
          light: alpha(theme.aliases.colors.main, theme.tokens.alphas[60]),
        },
      },
      fontSize: {
        headline: theme.aliases.typography.headline,
        title: theme.aliases.typography.title,
        body: theme.aliases.typography.body,
      },
    },
  },
};
```

Use semantic classes in your components:

```tsx
<button className="bg-ground-back text-ground-fore p-spacing-block">
  <h1 className="text-headline">Welcome</h1>
  <p className="text-body opacity-60">Get started with themizer</p>
</button>
```

### Linaria (Zero-Runtime CSS-in-JS)

Use theme values directly in your styled components:

```tsx
import { styled } from '@linaria/react';
import { theme } from './themizer.config';

const Button = styled.button`
  background: ${theme.aliases.colors.ground.back};
  color: ${theme.aliases.colors.ground.fore};
  padding: ${theme.aliases.spacing.block};
  font-size: ${theme.aliases.typography.body};
  transition: ${theme.aliases.animations.ease};

  &:hover {
    opacity: ${theme.tokens.alphas[60]};
  }
`;
```

## CLI Commands

### `themizer init`

Create configuration with auto-detected framework support.

```bash
themizer init                    # Interactive setup
themizer init --watch            # Include watch mode script
themizer init --out-dir ./path   # Skip prompts, use custom path
```

**Detects:** Next.js (App/Pages Router), Remix, Vite, CRA, and more.

### `themizer theme`

Generate theme.css from your configuration.

```bash
themizer theme --out-dir ./src/app         # Generate once
themizer theme --out-dir ./src/app --watch # Watch for changes
```

## API

### `themizer(options, aliases)`

Main function to generate design tokens and aliases.

#### Parameters

- `options.prefix` - Prefix for CSS custom properties (e.g., `'theme'` → `--theme-*`)
- `options.medias` - Media query definitions for responsive design
- `options.tokens` - Design tokens object with special expansions:
  - `palette.*`: OKLCH strings auto-expand to 7 shades (lightest, lighter, light, base, dark, darker, darkest)
  - `units.*`: Object where each key is a unit type (rem, px, percentage, vh, vw, etc.) with `[from, step, to]` tuple values
  - Other properties: Used as-is (no expansion)
- `aliases` - Function that receives resolved tokens and returns semantic aliases

#### Returns

- `aliases` - Semantic aliases wrapped in `var()` for use in CSS/JS
- `tokens` - Design tokens wrapped in `var()` for use in CSS/JS (with expansions applied)
- `medias` - Media queries prefixed with `@media`
- `rules` - Internal/advanced: generated CSS rules (use `theme.css` file instead)
- `variableMap` - Internal/advanced: minified variable names map (use `theme.css.map.json` instead)

#### Example

```ts
import { theme } from './themizer.config'

// Using aliases (semantic names)
theme.aliases.colors.main        // → "var(--themea0, oklch(76.9% 0.188 70.08))"
theme.aliases.typography.title    // → "var(--themea5, 2.5rem)"

// Using tokens (raw values)
// Expanded OKLCH color from palette:
theme.tokens.palette.amber.base    // → "var(--theme3, oklch(76.9% 0.188 70.08))"
theme.tokens.palette.amber.lightest // → "var(--theme0, oklch(98.92% 0.0102 81.8))"
// Manual color definition:
theme.tokens.colors.blue[500]     // → "var(--theme7, #3b82f6)"
// Expanded units:
theme.tokens.units.rem[1]          // → "var(--themed, 1rem)"
theme.tokens.units.rem[4]          // → "var(--themeS, 4rem)"
theme.tokens.units.px[16]          // → "var(--themee, 16px)"

// Using media queries
theme.medias.desktop              // → "@media (width >= 1024px)"
theme.medias.dark                 // → "@media (prefers-color-scheme: dark)"
```

### `unwrapAtom(atom)`

Extract CSS custom property name from `var()` expression.

#### Parameters

- `atom` - A CSS custom property wrapped in `var()`

#### Returns

The unwrapped custom property name (string)

#### Example

```ts
import { unwrapAtom } from 'themizer'
import { theme } from './themizer.config'

unwrapAtom(theme.aliases.colors.main)  // → "--themea0"

// Useful for scoped overrides:
<div style={{ [unwrapAtom(theme.aliases.colors.main)]: 'oklch(50% 0.2 180)' }}>
  This div has a custom main color
</div>
```

### `resolveAtom(atom)`

Extract default value from `var()` expression.

#### Parameters

- `atom` - A CSS custom property with a default value

#### Returns

The resolved default value (string or number)

#### Example

```ts
import { resolveAtom } from 'themizer'
import { theme } from './themizer.config'

resolveAtom(theme.tokens.palette.amber.base)  // → "oklch(76.9% 0.188 70.08)"
resolveAtom(theme.aliases.colors.main)      // → "oklch(76.9% 0.188 70.08)"
resolveAtom(theme.tokens.units.rem[1])       // → "1rem"

// Useful for non-CSS contexts:
export const viewport = {
  themeColor: resolveAtom(theme.aliases.colors.main),
}
```

## Links

- [GitHub Repository](https://github.com/soujvnunes/themizer)
- [npm Package](https://www.npmjs.com/package/themizer)
- [Report Issues](https://github.com/soujvnunes/themizer/issues)

## License

ISC
