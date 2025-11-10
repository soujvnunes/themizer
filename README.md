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
<button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-300">
  {/* Is this our primary color? No way to know */}
</button>

// Card.tsx
<div className="border-blue-500 dark:border-blue-400">
  {/* Same values, zero connection to design system */}
</div>
```

**With CSS-in-JS:**

```tsx
const Button = styled.button`
  background: #3b82f6; /* Repeated in 15 files */

  @media (prefers-color-scheme: dark) {
    background: #60a5fa; /* Repeated in 18 files */
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

**Define your tokens:**

```ts
// themizer.config.ts
export default themizer(
  {
    // Tokens: Raw design values
    tokens: {
      colors: { blue: { 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' } },
    },
  },
  // Compose tokens into semantic aliases
  ({ colors }) => ({
    palette: {
      main: {
        primary: [{ dark: colors.blue[400] }, colors.blue[500]],
        secondary: [{ dark: colors.blue[300] }, colors.blue[600]],
      },
    },
  }),
)
```

**Build components from aliases:**

```tsx
// Utility classes (Tailwind)
<button className="bg-main-primary hover:bg-main-secondary">
  Primary Action
</button>

// CSS-in-JS
import theme from './themizer.config'

const Button = styled.button`
  background: ${theme.aliases.palette.main.primary};

  &:hover {
    background: ${theme.aliases.palette.main.secondary};
  }
  /* Dark mode handled by themizer configuration, applied natively by the browser */
`
```

**Rebrand by updating aliases, not components:**

```ts
// Update aliases to use new tokens
palette: {
  main: {
    primary: [{ dark: colors.purple[400] }, colors.purple[500]],
    secondary: [{ dark: colors.purple[300] }, colors.purple[600]],
  },
}

// All components using palette.main.primary reflect the configuration change
```

## Features

- **Atomic Design** - Build from atoms (tokens) to molecules (semantic aliases) to organisms (components)
- **Type-Safe** - Full TypeScript support with autocomplete for tokens and aliases
- **Framework Agnostic** - Works with Tailwind, styled-jsx, styled-components, Linaria, emotion
- **Responsive by Default** - Media queries configured through themizer, executed natively by the browser
- **Production Ready** - Base-52 minification, CSS @property registration, source maps

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

## Usage

### 1. Configuration

```ts
// themizer.config.ts
import themizer from 'themizer'

const alpha = (color: string, percentage: string) => `color-mix(in srgb, ${color} ${percentage}, transparent)`

export default themizer(
  {
    prefix: 'theme',
    medias: {
      desktop: '(width >= 1024px)',
      desktopPortrait: '(width >= 1024px) and (orientation: portrait)',
      dark: '(prefers-color-scheme: dark)',
      motion: '(prefers-reduced-motion: no-preference)',
    },
    tokens: {
      colors: {
        amber: {
          50: 'oklch(98% 0.02 85)',
          500: 'oklch(76.9% 0.188 70.08)',
          950: 'oklch(6% 0.02 70)',
        },
      },
      alphas: {
        100: '100%',
        80: '80%',
        60: '60%',
      },
      units: {
        16: '1rem',
        24: '1.5rem',
        40: '2.5rem',
        64: '4rem',
      },
      transitions: {
        bounce: '200ms cubic-bezier(0.5, -0.5, 0.25, 1.5)',
        ease: '200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  ({ colors, alphas, units, transitions }) => ({
    // Semantic aliases composed from tokens
    palette: {
      main: colors.amber[500],
      ground: {
        fore: [{ dark: colors.amber[50] }, alpha(colors.amber[950], alphas.secondary)],
        back: [{ dark: colors.amber[950] }, colors.amber[50]],
      },
    },
    typography: {
      headline: [{ desktop: units[64] }, units[40]],
      title: [{ desktop: units[40] }, units[24]],
      body: units[16],
    },
    spacing: {
      section: [{ desktopPortrait: units[64] }, units[40]],
      block: units[24],
    },
    animations: {
      bounce: [{ motion: transitions.bounce }],
      ease: [{ motion: transitions.ease }],
    },
  }),
)
```

**Key Concepts:**
- **Tokens** = Raw design values (`colors.amber[500]`, `units[16]`, `transitions.bounce`)
- **Aliases** = Semantic names composed from tokens (`palette.ground.fore`, `typography.title`, `animations.ease`)
- **Components** = Built using aliases, stay decoupled from raw values
- **Responsive values** use array syntax: `[{ mediaKey: value }, defaultValue]`
- **Dark mode** works via media queries - aliases switch values based on `prefers-color-scheme`, applied natively by the browser
- **Complex media queries** combine conditions like `desktopPortrait: '(width >= 1024px) and (orientation: portrait)'`
- **Motion preferences** respect accessibility - users with `prefers-reduced-motion: reduce` get undefined animation variables, while users who prefer motion get smooth transitions
- **Browser-native execution** - themizer generates CSS custom properties with @media queries, the browser handles all responsive and preference-based switching

### 2. Generate CSS

```bash
pnpm run themizer:theme        # Generate once
pnpm run themizer:theme:watch  # Watch mode (if configured with --watch)
```

The CLI executes your `themizer.config.ts` and generates `theme.css` with minified CSS custom properties:

```css
@property --theme0 { syntax: "<color>"; inherits: false; initial-value: oklch(98% 0.02 85); }
@property --theme1 { syntax: "<color>"; inherits: false; initial-value: oklch(76.9% 0.188 70.08); }
@property --theme2 { syntax: "<color>"; inherits: false; initial-value: oklch(12% 0.03 70); }
@property --theme3 { syntax: "<color>"; inherits: false; initial-value: oklch(6% 0.02 70); }
@property --theme4 { syntax: "<percentage>"; inherits: false; initial-value: 80%; }
@property --theme5 { syntax: "<length>"; inherits: false; initial-value: 1rem; }
@property --theme6 { syntax: "<length>"; inherits: false; initial-value: 1.5rem; }
@property --theme7 { syntax: "<length>"; inherits: false; initial-value: 2.5rem; }
@property --theme8 { syntax: "<length>"; inherits: false; initial-value: 4rem; }
@property --theme9 { syntax: "*"; inherits: false; initial-value: color-mix(in srgb, var(--theme3) var(--theme4), transparent); }
@property --themea0 { syntax: "*"; inherits: false; initial-value: var(--theme0); }
@property --themea1 { syntax: "*"; inherits: false; initial-value: var(--theme7); }
@property --themea2 { syntax: "*"; inherits: false; initial-value: var(--theme6); }

:root {
  --theme0: oklch(98% 0.02 85);
  --theme1: oklch(76.9% 0.188 70.08);
  --theme2: oklch(12% 0.03 70);
  --theme3: oklch(6% 0.02 70);
  --theme4: 80%;
  --theme5: 1rem;
  --theme6: 1.5rem;
  --theme7: 2.5rem;
  --theme8: 4rem;
  --theme9: color-mix(in srgb, var(--theme3) var(--theme4), transparent);
  --themea0: var(--theme0);
  --themea1: var(--theme7);
  --themea2: var(--theme6);
}

@media (prefers-color-scheme: dark) {
  :root {
    --theme9: var(--theme0);
    --themea0: var(--theme3);
  }
}

@media (width >= 1024px) {
  :root {
    --themea1: var(--theme8);
    --themea2: var(--theme7);
  }
}
```

**themizer** always minifies CSS custom property names using base-52 encoding (a-z, A-Z) to reduce bundle size:

```ts
// Without minification (original semantic names)
--theme-tokens-colors-amber-light: rgb(251, 191, 36);
--theme-aliases-palette-ground-fore: var(--theme-tokens-colors-amber-light);

// With minification (what themizer generates)
--theme0: rgb(251, 191, 36);
--themea0: var(--theme0);
```

#### Source Map for Debugging

A `theme.css.map.json` file is generated alongside your CSS, mapping minified names back to semantic names:

```json
{
  "--theme0": "--theme-tokens-colors-amber-50",
  "--theme1": "--theme-tokens-colors-amber-500",
  "--theme2": "--theme-tokens-colors-amber-900",
  "--theme3": "--theme-tokens-colors-amber-950",
  "--theme4": "--theme-tokens-alphas-secondary",
  "--theme5": "--theme-tokens-units-16",
  "--themea0": "--theme-aliases-palette-ground-fore",
  "--themea1": "--theme-aliases-typography-headline"
}
```

This allows you to identify original variable names when debugging minified CSS in DevTools.

**Bundle Size Savings:**

For a typical design system with 100-200 variables:
- **Variable name reduction**: ~88% (from ~35 characters to ~4 characters)
- **Overall CSS reduction**: 15-30% depending on value lengths

**Naming Pattern:**

Minified names use base-52 encoding (a-z, A-Z) for maximum compression:
- Single letters: `a0-z9, A0-Z9` (520 variables)
- Double letters: `aa0-ZZ9` (27,040 variables)
- Triple letters and beyond for larger design systems

#### CSS @property Registration

**themizer** generates CSS @property registration for all custom properties, with type validation enforced natively by the browser:

- **Type Validation** - Browsers validate that values match their declared syntax (`<color>`, `<length>`, `<percentage>`, etc.)
- **Browser Enforcement** - Invalid values are rejected, preventing type confusion errors

**Supported syntax types:**

- `<color>` - Colors (hex, rgb, hsl, oklch, color-mix, etc.)
- `<length>` - Lengths (px, rem, em, vh, vw, etc.)
- `<percentage>` - Percentages (%)
- `<angle>` - Angles (deg, rad, grad, turn)
- `<time>` - Time values (ms, s)
- `<number>` / `<integer>` - Numbers
- `*` - Universal (for complex expressions like `var()`, `cubic-bezier()`, etc.)

## Framework Integration

**One token system, multiple frameworks.** Use tokens and aliases across:

- **Tailwind** - Extend theme config with aliases, use semantic class names
- **styled-jsx** - Use `theme.rules.css` for global styles, interpolate aliases in components
- **styled-components/emotion** - Import theme, use tokens and aliases in templates
- **Linaria** - Zero-runtime extraction, themizer works at build time

Configure once, use everywhere.

**Note:** You only need to import `themizer.config` in your TypeScript/JavaScript code if you want to use the theme object programmatically (e.g., in Tailwind config, styled-components). For just using CSS custom properties, importing `theme.css` at your app's globals/main CSS is sufficient.

#### TypeScript References

Your TypeScript autocomplete remains unchanged despite minification. The minification only affects the generated CSS output:

```ts
// TypeScript still shows semantic names
theme.aliases.palette.ground.fore
// ✓ Type: "var(--theme0, rgb(251, 191, 36))"

// At runtime, it uses minified names
console.log(theme.aliases.palette.ground.fore)
// → "var(--theme0, rgb(251, 191, 36))"
```

#### Consistency Guarantee

The minification is **deterministic** - the same configuration always generates the same minified names, ensuring:
- Consistent builds across environments
- Reliable caching
- No cache-busting issues

### Tailwind CSS v4

```css
/* app/globals.css */
@import 'tailwindcss';
@import './theme.css';

@theme {
  --color-foreground: var(--theme-aliases-palette-ground-fore);
  --color-background: var(--theme-aliases-palette-ground-back);
  --font-size-headline: var(--theme-aliases-typography-headline);
  --font-size-title: var(--theme-aliases-typography-title);
}
```

### Tailwind CSS v3

```ts
// tailwind.config.ts
import { type Config } from 'tailwindcss'
import theme from './themizer.config'

export {
  content: ['./src/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        foreground: theme.aliases.palette.ground.fore,
        background: theme.aliases.palette.ground.back,
      },
      fontSize: {
        headline: [theme.aliases.typography.headline],
        title: [theme.aliases.typography.title],
      },
    },
  },
} satisfies Config
```

### Linaria (Zero-Runtime CSS-in-JS)

**themizer** is designed to be side-effect-free, making it compatible with build-time CSS-in-JS solutions like [Linaria](https://linaria.dev/). Unlike runtime CSS-in-JS libraries, Linaria extracts CSS at build time for optimal performance.

```tsx
// app/_components/ui/button.tsx
import { styled } from '@linaria/react'
import theme from './themizer.config'

export const Button = styled.button`
  background-color: ${theme.aliases.palette.ground.back};
  color: ${theme.aliases.palette.ground.fore};
  font-size: ${theme.aliases.typography.body};
  padding: ${theme.tokens.units[16]};

  &:hover {
    opacity: ${theme.tokens.alphas[80]};
  }

  @media ${theme.medias.desktop} {
    padding: ${theme.tokens.units[24]};
    font-size: ${theme.aliases.typography.title};
  }
`
```

**Why it works:** The `themizer()` function is pure and doesn't perform file system operations during module evaluation, so Linaria can safely evaluate your config at build time and extract the theme values into static CSS.

#### Using with the `css` function:

```tsx
import { css } from '@linaria/core'
import theme from './themizer.config'

const cardClassNames = css`
  background: ${theme.aliases.palette.ground.back};
  border: 1px solid ${theme.tokens.colors.amber[500]};
  padding: ${theme.tokens.units[24]};

  @media ${theme.medias.dark} {
    border-color: ${theme.tokens.colors.amber[50]};
  }
`

export function Card({ children }) {
  return <div className={cardClassNames}>{children}</div>
}
```

### Runtime CSS-in-JS (styled-components, emotion)

For runtime solutions, themizer works seamlessly with your theme tokens:

```tsx
import styled from 'styled-components'
import theme from './themizer.config'

const Button = styled.button`
  background-color: ${theme.aliases.palette.ground.back};
  color: ${theme.aliases.palette.ground.fore};
  padding: ${theme.tokens.units[16]};

  &:hover {
    opacity: ${theme.tokens.alphas[80]};
  }
`
```

### Next.js with styled-jsx

```tsx
import theme from './themizer.config'

export function Title({ children }) {
  return (
    <>
      {/* Global CSS with @property registration */}
      <style jsx global>{`${theme.rules.css}`}</style>

      <h1 className="heading">
        {children}
        <style jsx>{`
          .heading {
            color: ${theme.aliases.palette.ground.fore};
            font-size: ${theme.aliases.typography.title};
          }
        `}</style>
      </h1>
    </>
  )
}
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
- `options.tokens` - Design tokens object (colors, spacing, typography, etc.)
- `aliases` - Function that receives resolved tokens and returns semantic aliases

#### Returns

- `aliases` - Semantic aliases wrapped in `var()` for use in CSS/JS
- `tokens` - Design tokens wrapped in `var()` for use in CSS/JS
- `medias` - Media queries prefixed with `@media`

#### Example

```ts
import theme from './themizer.config'

// Using aliases (semantic names)
theme.aliases.palette.main        // → "var(--theme-aliases-palette-main)"
theme.aliases.typography.title    // → "var(--theme-aliases-typography-title)"

// Using tokens (raw values)
theme.tokens.colors.green[500]    // → "var(--theme-tokens-colors-green-500)"
theme.tokens.units[16]            // → "var(--theme-tokens-units-16)"

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
import theme from './themizer.config'

unwrapAtom(theme.aliases.palette.main)  // → "--theme-aliases-palette-main"

// Useful for scoped overrides:
<div style={{ [unwrapAtom(theme.aliases.palette.main)]: '#ff0000' }}>
  This div has red text
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
import theme from './themizer.config'

resolveAtom(theme.tokens.colors.green[500])  // → "#22c55e"
resolveAtom(theme.tokens.units[16])          // → "1rem"

// Useful for non-CSS contexts:
export const viewport = {
  themeColor: resolveAtom(theme.tokens.colors.green[500]),
}
```

## Links

- [GitHub Repository](https://github.com/soujvnunes/themizer)
- [npm Package](https://www.npmjs.com/package/themizer)
- [Report Issues](https://github.com/soujvnunes/themizer/issues)

## License

ISC
