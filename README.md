# themizer

> Transform verbose CSS utility classes into semantic, maintainable design tokens

[![npm version](https://img.shields.io/npm/v/themizer.svg)](https://www.npmjs.com/package/themizer)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/themizer.svg)](https://github.com/soujvnunes/themizer/blob/main/LICENSE)

## The Problem

Utility-first CSS frameworks create a maintainability trap. Your components become littered with verbose, brittle class names:

```tsx
<button className="text-white dark:text-black hover:text-white/60 dark:hover:text-white/60 transition-colors">
  Click me
</button>
```

Need to change your brand color? Good luck finding and updating every instance of `text-blue-500` across your codebase. There's no single source of truth, just scattered utility classes everywhere.

## The Solution

**themizer** generates type-safe design tokens and semantic aliases that work seamlessly with Tailwind CSS or any CSS-in-JS solution:

```tsx
<button className="text-foreground hover:text-foreground-secondary transition-colors">
  Click me
</button>
```

Change your design system once in your configuration, and all components update automatically.

## Features

- **Framework-Aware Setup** - Automatically detects Next.js, Remix, Vite, and more
- **Type-Safe Tokens** - Full TypeScript support with autocomplete
- **Responsive Design** - Built-in media query support
- **Single Source of Truth** - Define your design system once, use everywhere
- **Tailwind Integration** - Extend Tailwind's theme with your tokens
- **CSS-in-JS Compatible** - Works with styled-jsx, styled-components, emotion, etc.
- **CSS @property Registration** - Automatic type validation and browser optimization

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
      desktop: '(min-width: 1024px)',
      dark: '(prefers-color-scheme: dark)',
    },
    tokens: {
      colors: {
        amber: {
          50: 'oklch(98% 0.02 85)',
          500: 'oklch(76.9% 0.188 70.08)',
          900: 'oklch(12% 0.03 70)',
          950: 'oklch(6% 0.02 70)',
        },
      },
      alphas: {
        primary: '100%',
        secondary: '80%',
        tertiary: '60%',
      },
      units: {
        16: '1rem',
        24: '1.5rem',
        40: '2.5rem',
        64: '4rem',
      },
    },
  },
  ({ colors, alphas, units }) => ({
    // Semantic aliases grouped by context
    palette: {
      foreground: [{ dark: colors.amber[50] }, alpha(colors.amber[950], alphas.secondary)],
      background: [{ dark: colors.amber[950] }, colors.amber[50]],
    },
    typography: {
      headline: [{ desktop: units[64] }, units[40]],
      title: [{ desktop: units[40] }, units[24]],
      body: units[16],
    },
  }),
)
```

**Key Concept:**
- **Tokens** = Raw values (`colors.amber[500]`)
- **Aliases** = Semantic names (`palette.foreground`, `typography.title`)
- Responsive values use array syntax: `[{ mediaKey: value }, defaultValue]`
- Use modern CSS color spaces like `oklch()` for better color manipulation

### 2. Generate CSS

```bash
pnpm run themizer:theme        # Generate once
pnpm run themizer:theme:watch  # Watch mode (if configured with --watch)
```

The CLI automatically executes your `themizer.config.ts` and generates `theme.css` with CSS custom properties:

```css
:root {
  --theme-tokens-colors-amber-500: oklch(76.9% 0.188 70.08);
  --theme-aliases-palette-foreground: color-mix(in srgb, var(--theme-tokens-colors-amber-950) var(--theme-tokens-alphas-secondary), transparent);
  --theme-aliases-palette-background: var(--theme-tokens-colors-amber-50);
  --theme-aliases-typography-title: var(--theme-tokens-units-24);
  /* ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --theme-aliases-palette-foreground: var(--theme-tokens-colors-amber-50);
    --theme-aliases-palette-background: var(--theme-tokens-colors-amber-950);
  }
}

@media (min-width: 1024px) {
  :root {
    --theme-aliases-typography-headline: var(--theme-tokens-units-64);
    --theme-aliases-typography-title: var(--theme-tokens-units-40);
  }
}
```

### 3. Import in Your App

```tsx
// Next.js: app/layout.tsx or pages/_app.tsx
// React/Vite: src/index.tsx or src/main.tsx
import './theme.css'
import './globals.css'
```

## Framework Integration

**Note:** You only need to import `themizer.config` in your TypeScript/JavaScript code if you want to use the theme object programmatically (e.g., in Tailwind config, styled-components). For just using CSS custom properties, importing `theme.css` is sufficient.

### Tailwind CSS v4

```css
/* app/globals.css */
@import "tailwindcss";
@import "./theme.css";

@theme {
  --color-foreground: var(--theme-aliases-palette-foreground);
  --color-background: var(--theme-aliases-palette-background);
  --font-size-headline: var(--theme-aliases-typography-headline);
  --font-size-title: var(--theme-aliases-typography-title);
}
```

### Tailwind CSS v3

```ts
// tailwind.config.ts
import { type Config } from 'tailwindcss'
import theme from './themizer.config'

export default {
  content: ['./src/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        foreground: theme.aliases.palette.foreground,
        background: theme.aliases.palette.background,
      },
      fontSize: {
        headline: [theme.aliases.typography.headline],
        title: [theme.aliases.typography.title],
      },
    },
  },
} satisfies Config
```

Use semantic class names:

```tsx
<div className="bg-background text-foreground">
  <h1 className="text-headline">Hello World</h1>
  <h2 className="text-title">Subtitle</h2>
</div>
```

### Linaria (Zero-Runtime CSS-in-JS)

**themizer** is designed to be side-effect-free, making it compatible with build-time CSS-in-JS solutions like [Linaria](https://linaria.dev/). Unlike runtime CSS-in-JS libraries, Linaria extracts CSS at build time for optimal performance.

```tsx
// Button.tsx
import { styled } from '@linaria/react'
import theme from './themizer.config'

const Button = styled.button`
  background-color: ${theme.aliases.palette.background};
  color: ${theme.aliases.palette.foreground};
  font-size: ${theme.aliases.typography.body};
  padding: ${theme.tokens.units[16]};
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: opacity 150ms;

  &:hover {
    opacity: ${theme.tokens.alphas.secondary};
  }

  @media ${theme.medias.desktop} {
    padding: ${theme.tokens.units[24]};
    font-size: ${theme.aliases.typography.title};
  }
`

export default function MyButton({ children }) {
  return <Button>{children}</Button>
}
```

**Why it works:** The `themizer()` function is pure and doesn't perform file system operations during module evaluation, so Linaria can safely evaluate your config at build time and extract the theme values into static CSS.

#### Using with the `css` function:

```tsx
import { css } from '@linaria/core'
import theme from './themizer.config'

const cardStyles = css`
  background: ${theme.aliases.palette.background};
  border: 1px solid ${theme.tokens.colors.amber[500]};
  padding: ${theme.tokens.units[24]};

  @media ${theme.medias.dark} {
    border-color: ${theme.tokens.colors.amber[50]};
  }
`

export default function Card({ children }) {
  return <div className={cardStyles}>{children}</div>
}
```

### Runtime CSS-in-JS (styled-components, emotion)

For runtime solutions, themizer works seamlessly with your theme tokens:

```tsx
import styled from 'styled-components'
import theme from './themizer.config'

const Button = styled.button`
  background-color: ${theme.aliases.palette.background};
  color: ${theme.aliases.palette.foreground};
  padding: ${theme.tokens.units[16]};

  &:hover {
    opacity: ${theme.tokens.alphas.secondary};
  }
`
```

### Next.js with styled-jsx

```tsx
import theme from './themizer.config'

export default function Title({ children }) {
  return (
    <h1 className="heading">
      {children}
      <style jsx>{`
        .heading {
          color: ${theme.aliases.palette.foreground};
          font-size: ${theme.aliases.typography.title};
        }
      `}</style>
    </h1>
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
- `options.overrides` - Optional array of property paths to exclude from `@property` registration (e.g., `['tokens.colors.primary']`)
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
theme.medias.lg                   // → "@media (min-width: 1024px)"
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

## Advanced

### CSS @property Registration (Type Validation)

**themizer** automatically registers all generated CSS custom properties using the CSS `@property` at-rule. This provides two key benefits:

1. **Type Validation** - Browsers validate that property values match their declared syntax (e.g., `<color>`, `<length>`, `<percentage>`)
2. **Type Safety** - Invalid values set by external stylesheets or scripts are rejected by the browser, helping prevent accidental type mismatches (but this is not a comprehensive security mechanism)

#### How It Works

When you generate your theme, themizer analyzes each token and alias value to infer its CSS syntax type:

```ts
export default themizer(
  {
    prefix: 'theme',
    medias: {},
    tokens: {
      colors: {
        primary: 'oklch(76.9% 0.188 70.08)', // → <color>
      },
      spacing: {
        md: '1rem',                            // → <length>
      },
      opacity: {
        full: '100%',                          // → <percentage>
      },
      rotation: {
        quarter: '90deg',                      // → <angle>
      },
      duration: {
        fast: '200ms',                         // → <time>
      },
    },
  },
  (t) => ({
    // Aliases are also registered
    foreground: t.colors.primary,              // → <color>
  }),
)
```

Generated CSS includes `@property` declarations:

```css
@property --theme-tokens-colors-primary {
  syntax: "<color>";
  inherits: false;
  initial-value: oklch(76.9% 0.188 70.08);
}

@property --theme-tokens-spacing-md {
  syntax: "<length>";
  inherits: false;
  initial-value: 1rem;
}

@property --theme-aliases-foreground {
  syntax: "<color>";
  inherits: false;
  initial-value: var(--theme-tokens-colors-primary);
}

:root {
  --theme-tokens-colors-primary: oklch(76.9% 0.188 70.08);
  --theme-tokens-spacing-md: 1rem;
  --theme-aliases-foreground: var(--theme-tokens-colors-primary);
}
```

#### Type Safety Benefits

With `@property` registration, browsers validate that custom property values match the declared syntax type:

```css
:root {
  --theme-tokens-colors-primary: red;            /* ✓ Valid <color> value */
  --theme-tokens-colors-primary: 16px;           /* ✗ Rejected: not a <color> value */

  --theme-tokens-spacing-md: 1rem;               /* ✓ Valid <length> value */
  --theme-tokens-spacing-md: #f00;               /* ✗ Rejected: not a <length> value */
}
```

The browser enforces that values match the declared type, preventing type confusion errors.

#### Supported Syntax Types

themizer automatically detects and registers these CSS syntax types:

- `<color>` - Colors (hex, rgb, hsl, oklch, oklab, lab, lch, hwb, color, color-mix, etc.)
- `<length>` - Lengths (px, rem, em, vh, vw, etc.)
- `<percentage>` - Percentages (%)
- `<angle>` - Angles (deg, rad, grad, turn)
- `<time>` - Time values (ms, s)
- `<number>` - Decimal numbers
- `<integer>` - Whole numbers
- `*` - Universal syntax (for complex expressions like `var()`, `cubic-bezier()`, strings, etc.)

#### Property Overrides

If you need certain properties to accept any value type (bypassing validation), use the `overrides` option:

```ts
export default themizer(
  {
    prefix: 'theme',
    medias: {},
    tokens: {
      colors: {
        primary: '#f00',
        accent: '#0f0',
      },
    },
    // Exclude specific properties from @property registration
    // Supports both dot notation and dash notation
    overrides: ['tokens.colors.primary'], // or ['tokens-colors-primary']
  },
  (t) => ({
    foreground: t.colors.primary,
    background: t.colors.accent,
  }),
)
```

Properties listed in `overrides` will:
- Still be generated as CSS custom properties
- Not have `@property` registration
- Accept any value type without validation

**Important:** Override paths match the structure of your tokens/aliases objects, not the generated CSS variable names:
- For tokens: Use the path within the `tokens` object (e.g., `'colors.primary'` for `tokens.colors.primary`)
- For aliases: Use the path within the aliases object (e.g., `'foreground'` for the `foreground` alias)

This is useful for properties that you want to allow dynamic overriding from external sources or that have complex computed values that change types.

### Dark Mode

```ts
const { aliases } = themizer(
  {
    prefix: 'theme',
    medias: { dark: '(prefers-color-scheme: dark)' },
    tokens: { colors: { white: '#fff', black: '#000' } },
  },
  (t) => ({
    foreground: [{ dark: t.colors.white }, t.colors.black],
    background: [{ dark: t.colors.black }, t.colors.white],
  }),
)
```

### Motion & Accessibility

Respect user preferences for reduced motion while providing smooth animations:

```ts
const { aliases } = themizer(
  {
    prefix: 'theme',
    medias: {
      motion: '(prefers-reduced-motion: no-preference)',
    },
    tokens: {
      transitions: {
        bounce: '200ms cubic-bezier(0.5, -0.5, 0.25, 1.5)',
        ease: '200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  (t) => ({
    animations: {
      bounce: [{ motion: t.transitions.bounce }],
      ease: [{ motion: t.transitions.ease }],
    },
  }),
)
```

Generated CSS:

```css
@media (prefers-reduced-motion: no-preference) {
  :root {
    --theme-aliases-animations-bounce: var(--theme-tokens-transitions-bounce);
    --theme-aliases-animations-ease: var(--theme-tokens-transitions-ease);
  }
}
```

Users with `prefers-reduced-motion: reduce` get no animation variables (they remain undefined), while users who prefer motion get smooth transitions. This ensures accessibility without sacrificing user experience.

### Component Overrides

```tsx
import { unwrapAtom } from 'themizer'
import theme from './themizer.config'

export default function Heading({ className = '', ...props }) {
  return (
    <h1
      className={`text-2xl ${className}`}
      style={{
        // Override color for this component only
        [unwrapAtom(theme.aliases.palette.main)]: theme.tokens.colors.green[600],
      }}
      {...props}
    />
  )
}
```

## Links

- [GitHub Repository](https://github.com/soujvnunes/themizer)
- [npm Package](https://www.npmjs.com/package/themizer)
- [Report Issues](https://github.com/soujvnunes/themizer/issues)

## License

ISC
