# themizer

> Transform verbose CSS utility classes into semantic, maintainable design tokens

[![npm version](https://img.shields.io/npm/v/themizer.svg)](https://www.npmjs.com/package/themizer)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/themizer.svg)](https://github.com/soujvnunes/themizer/blob/main/LICENSE)

## The Problem

Working with utility-first CSS frameworks often leads to verbose, hard-to-maintain class names:

```tsx
<button className="text-white dark:text-black hover:text-white/60 dark:hover:text-white/60 transition-colors">
  Click me
</button>
```

What if your design system changes? You'd need to update these classes across your entire codebase.

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
- **Responsive Design** - Built-in media query support for responsive values
- **Single Source of Truth** - Define your design system once, use everywhere
- **Tailwind Integration** - Extend Tailwind's theme with your tokens
- **CSS-in-JS Compatible** - Works with styled-jsx, styled-components, emotion, etc.

## Quick Start

Get started with themizer in under 2 minutes:

```bash
# Install themizer
pnpm add themizer

# Initialize with interactive setup (detects your framework)
npx themizer init

# Example output:
# Detected framework: Next.js (App Router)
# Suggested output directory: ./src/app
# Use the suggested output directory? (Y/n)
```

The `init` command will:
1. Create a `themizer.config.ts` with example tokens
2. Add a `themizer:theme` script to your `package.json`
3. Configure the correct output path for your framework

Then generate your theme CSS:

```bash
# Generate theme.css
pnpm run themizer:theme
```

That's it! Import the generated CSS in your app and start using semantic class names.

## Installation

Install themizer via your preferred package manager:

```bash
pnpm add themizer
# or
npm install themizer
# or
yarn add themizer
```

## CLI Commands

### `themizer init`

Interactive setup that creates a configuration file and detects your framework.

```bash
# Interactive mode (recommended)
themizer init

# With options
themizer init --watch                    # Add watch mode script
themizer init --out-dir ./custom/path    # Non-interactive with custom path
```

**Options:**
- `--watch` - Add a watch mode script for automatic CSS regeneration
- `--out-dir <DIR>` - Specify output directory (skips interactive prompts)

**Framework Detection:**
Automatically detects and suggests paths for:
- Next.js App Router → `./src/app` or `./app`
- Next.js Pages Router → `./src/styles` or `./styles`
- Remix → `./app/styles`
- Vite → `./src` or `./public`
- Create React App → `./src`
- Generic projects → `./src/styles` or `./styles`

### `themizer theme`

Generate the theme.css file from your configuration.

```bash
themizer theme --out-dir ./src/app
```

**Options:**
- `--out-dir <DIR>` - Output directory for theme.css (required)

**After running `init`:**
```bash
pnpm run themizer:theme        # Uses the configured path
pnpm run themizer:theme:watch  # Watch mode (if configured)
```

## Usage

### Configuration

The `init` command creates a `themizer.config.ts` file. Here's the pattern:

```ts
// themizer.config.ts

import themizer from 'themizer'

// Define your media queries
const medias = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  dark: '(prefers-color-scheme: dark)',
} as const

// Define your design tokens (raw values)
const tokens = {
  colors: {
    black: '#000000',
    white: '#ffffff',
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      900: '#14532d',
      950: '#052e16',
    },
  },
  alphas: {
    primary: 1,
    secondary: 0.8,
    tertiary: 0.6,
    quaternary: 0.4,
    quinary: 0.2,
  },
  units: {
    0: '0',
    8: '0.5rem',
    16: '1rem',
    24: '1.5rem',
    40: '2.5rem',
    64: '4rem',
    104: '6.5rem',
  },
}

// Initialize themizer with your configuration
const { aliases, tokens: resolvedTokens } = themizer(
  {
    prefix: 'theme',  // Prefix for CSS custom properties
    medias,
    tokens,
  },
  ({ colors, alphas, units }) => ({
    // Define your semantic aliases grouped by context

    palette: {
      text: [`rgb(${colors.black} / ${alphas.secondary})`, { dark: `rgb(${colors.white} / ${alphas.primary})` }],
      background: [colors.white, { dark: colors.black }],
      main: colors.green[500],
    },

    typography: {
      headline: [units[40], { lg: units[64] }],
      title: [units[24], { lg: units[40] }],
      subtitle: [units[16], { lg: units[24] }],
    },

    grid: {
      margin: [units[16], { lg: units[40] }],
      gutter: [units[8], { lg: units[16] }],
    },
  }),
)

export { aliases, resolvedTokens as tokens, medias }
```

**Key Concept:**
- **Tokens** = Raw values (colors.green[500], alphas.secondary, units[16])
- **Aliases** = Semantic names grouped by context (palette.text, typography.headline, grid.margin)

### Generated CSS

After running `pnpm run themizer:theme`, a `theme.css` file is created:

```css
/* theme.css */

:root {
  --theme-tokens-colors-black: #000000;
  --theme-tokens-colors-white: #ffffff;
  --theme-tokens-colors-green-50: #f0fdf4;
  --theme-tokens-colors-green-100: #dcfce7;
  --theme-tokens-colors-green-500: #22c55e;
  --theme-tokens-colors-green-600: #16a34a;
  --theme-tokens-colors-green-900: #14532d;
  --theme-tokens-colors-green-950: #052e16;
  --theme-tokens-alphas-primary: 1;
  --theme-tokens-alphas-secondary: 0.8;
  --theme-tokens-alphas-tertiary: 0.6;
  --theme-tokens-alphas-quaternary: 0.4;
  --theme-tokens-alphas-quinary: 0.2;
  --theme-tokens-units-0: 0;
  --theme-tokens-units-8: 0.5rem;
  --theme-tokens-units-16: 1rem;
  --theme-tokens-units-24: 1.5rem;
  --theme-tokens-units-40: 2.5rem;
  --theme-tokens-units-64: 4rem;
  --theme-tokens-units-104: 6.5rem;
  --theme-aliases-palette-text: rgb(var(--theme-tokens-colors-black) / var(--theme-tokens-alphas-secondary));
  --theme-aliases-palette-background: var(--theme-tokens-colors-white);
  --theme-aliases-palette-main: var(--theme-tokens-colors-green-500);
  --theme-aliases-typography-headline: var(--theme-tokens-units-40);
  --theme-aliases-typography-title: var(--theme-tokens-units-24);
  --theme-aliases-typography-subtitle: var(--theme-tokens-units-16);
  --theme-aliases-grid-margin: var(--theme-tokens-units-16);
  --theme-aliases-grid-gutter: var(--theme-tokens-units-8);
}

@media (prefers-color-scheme: dark) {
  :root {
    --theme-aliases-palette-text: rgb(var(--theme-tokens-colors-white) / var(--theme-tokens-alphas-primary));
    --theme-aliases-palette-background: var(--theme-tokens-colors-black);
  }
}

@media (min-width: 1024px) {
  :root {
    --theme-aliases-typography-headline: var(--theme-tokens-units-64);
    --theme-aliases-typography-title: var(--theme-tokens-units-40);
    --theme-aliases-typography-subtitle: var(--theme-tokens-units-24);
    --theme-aliases-grid-margin: var(--theme-tokens-units-40);
    --theme-aliases-grid-gutter: var(--theme-tokens-units-16);
  }
}
```

### Import the Theme

Import the generated CSS in your application:

```tsx
// Next.js App Router: src/app/layout.tsx
import './theme.css'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

```tsx
// Vite/CRA: src/main.tsx or src/index.tsx
import './theme.css'
import './index.css'
```

## Framework Integration

### Tailwind CSS v4

With Tailwind CSS v4, use the `@theme` directive to expose your CSS variables:

```css
/* app/globals.css */
@import "tailwindcss";
@import "./theme.css";

@theme {
  --color-text: var(--theme-aliases-palette-text);
  --color-background: var(--theme-aliases-palette-background);
  --color-main: var(--theme-aliases-palette-main);
  --font-size-headline: var(--theme-aliases-typography-headline);
  --font-size-title: var(--theme-aliases-typography-title);
  --font-size-subtitle: var(--theme-aliases-typography-subtitle);
  --spacing-margin: var(--theme-aliases-grid-margin);
  --spacing-gutter: var(--theme-aliases-grid-gutter);
}
```

Use them with Tailwind's utilities:

```tsx
<div className="bg-background text-text p-margin">
  <h1 className="text-headline text-main">Hello World</h1>
  <p className="text-subtitle">Semantic design tokens with Tailwind v4</p>
</div>
```

Learn more about [Tailwind CSS v4](https://tailwindcss.com/docs/upgrade-guide).

### Tailwind CSS v3

Integrate themizer with Tailwind CSS v3 by extending the theme configuration:

```ts
// tailwind.config.ts

import { type Config } from 'tailwindcss'
import theme from './themizer.config'

export default {
  content: ['./src/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        text: theme.aliases.palette.text,
        background: theme.aliases.palette.background,
        main: theme.aliases.palette.main,
      },
      fontSize: {
        headline: [theme.aliases.typography.headline],
        title: [theme.aliases.typography.title],
        subtitle: [theme.aliases.typography.subtitle],
      },
      spacing: {
        margin: theme.aliases.grid.margin,
        gutter: theme.aliases.grid.gutter,
      },
    },
  },
} satisfies Config
```

Use semantic class names:

```tsx
<div className="bg-background text-text p-margin">
  <h1 className="text-headline text-main">Hello World</h1>
  <p className="text-subtitle">Semantic design tokens</p>
</div>
```

### React with Tailwind CSS

Override CSS custom properties when needed:

```tsx
import { unwrapAtom } from 'themizer'
import theme from './themizer.config'

export default function Heading({ className = '', ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      className={`text-2xl font-bold ${className}`}
      style={{
        // Lock the color for this specific component
        [unwrapAtom(theme.aliases.palette.main)]: theme.tokens.colors.green[600],
      }}
      {...props}
    />
  )
}
```

### Next.js with styled-jsx

Use themizer with Next.js's built-in CSS-in-JS solution:

```tsx
import theme from './themizer.config'

export default function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="heading">
      {children}
      <style jsx>{`
        .heading {
          color: ${theme.aliases.palette.main};
          font-size: ${theme.aliases.typography.headline};
          margin: ${theme.aliases.grid.margin};
        }
      `}</style>
    </h1>
  )
}
```

> Remember to create a [styled-jsx registry](https://nextjs.org/docs/app/building-your-application/styling/css-in-js#styled-jsx) to collect CSS rules and inject them into the document.

### CSS-in-JS (styled-components, emotion, etc.)

```tsx
import styled from 'styled-components'
import theme from './themizer.config'

const Button = styled.button`
  background-color: ${theme.aliases.palette.main};
  color: ${theme.aliases.palette.text};
  padding: ${theme.aliases.grid.margin};
  font-size: ${theme.aliases.typography.subtitle};

  &:hover {
    opacity: ${theme.tokens.alphas.secondary};
  }
`
```

## API Reference

### `themizer(options, aliases)`

The main function to generate design tokens and aliases.

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `options.tokens` | `Object` | Design tokens object (colors, spacing, typography, etc.) |
| `options.prefix` | `string` | Prefix for CSS custom properties (e.g., `'theme'` → `--theme-*`) |
| `options.medias` | `Object` | Media query definitions for responsive design |
| `aliases` | `Function` | Function that receives tokens and returns semantic aliases |

#### Returns

| Property | Type | Description |
| --- | --- | --- |
| `aliases` | `Object` | Semantic aliases wrapped in `var()` for use in CSS/JS |
| `tokens` | `Object` | Design tokens wrapped in `var()` for use in CSS/JS |
| `medias` | `Object` | Media queries with `@media` prefix for direct use |

#### Example

```ts
const { aliases, tokens, medias } = themizer(
  {
    prefix: 'theme',
    medias: {
      lg: '(min-width: 1024px)',
    },
    tokens: {
      colors: {
        blue: { 500: '#3b82f6' },
      },
    },
  },
  (t) => ({
    primary: t.colors.blue[500],
  }),
)

// Usage:
// aliases.primary  → "var(--theme-aliases-primary)"
// tokens.colors.blue[500] → "var(--theme-tokens-colors-blue-500)"
```

### `unwrapAtom(atom)`

Extracts the CSS custom property name from a `var()` expression.

#### Parameters

| Type | Description |
| --- | --- |
| `string` | A CSS custom property wrapped in `var()` |

#### Returns

| Type | Description |
| --- | --- |
| `string` | The unwrapped custom property name |

#### Example

```ts
import { unwrapAtom } from 'themizer'

const atom = 'var(--theme-aliases-primary)'
const property = unwrapAtom(atom)
// → "--theme-aliases-primary"

// Useful for scoped overrides:
<div style={{ [unwrapAtom(theme.aliases.primary)]: '#ff0000' }}>
  {/* primary is now red for this component */}
</div>
```

### `resolveAtom(atom)`

Extracts the default/fallback value from a `var()` expression.

#### Parameters

| Type | Description |
| --- | --- |
| `string` | A CSS custom property with an optional default value |

#### Returns

| Type | Description |
| --- | --- |
| `string` | The default value from the `var()` expression |

#### Example

```ts
import { resolveAtom } from 'themizer'

const atom = 'var(--theme-aliases-primary, #3b82f6)'
const value = resolveAtom(atom)
// → "#3b82f6"

// Useful for JS contexts that don't support CSS variables:
export const viewport = {
  themeColor: resolveAtom(theme.tokens.colors.blue[500]),
}
```

## Advanced Usage

### Responsive Design

Define responsive values using arrays with media query keys:

```ts
const { aliases } = themizer(
  {
    prefix: 'theme',
    medias: {
      sm: '(min-width: 640px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 1024px)',
    },
    tokens: {
      spacing: {
        8: '0.5rem',
        16: '1rem',
        32: '2rem',
      },
    },
  },
  (t) => ({
    // Mobile-first approach
    padding: [
      t.spacing[8],           // default (mobile)
      {
        sm: t.spacing[16],     // small screens
        lg: t.spacing[32],     // large screens
      },
    ],
  }),
)
```

This generates:

```css
:root {
  --theme-aliases-padding: var(--theme-tokens-spacing-8);
}

@media (min-width: 640px) {
  :root {
    --theme-aliases-padding: var(--theme-tokens-spacing-16);
  }
}

@media (min-width: 1024px) {
  :root {
    --theme-aliases-padding: var(--theme-tokens-spacing-32);
  }
}
```

### Complex Tokens

Themizer supports any token structure:

```ts
const tokens = {
  colors: {
    // Nested objects
    brand: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
    },
    // Numeric keys
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      900: '#111827',
    },
  },
  // Arrays (accessed by index)
  shadows: [
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 4px 6px rgba(0,0,0,0.1)',
  ],
  // Numbers
  opacity: {
    half: 0.5,
    full: 1,
  },
}
```

### Dark Mode Example

```ts
const { aliases } = themizer(
  {
    prefix: 'theme',
    medias: {
      dark: '(prefers-color-scheme: dark)',
    },
    tokens: {
      colors: {
        white: '#ffffff',
        black: '#000000',
      },
    },
  },
  (t) => ({
    foreground: [
      t.colors.black,          // light mode
      { dark: t.colors.white }, // dark mode
    ],
    background: [
      t.colors.white,          // light mode
      { dark: t.colors.black }, // dark mode
    ],
  }),
)
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Links

- [GitHub Repository](https://github.com/soujvnunes/themizer)
- [npm Package](https://www.npmjs.com/package/themizer)
- [Report Issues](https://github.com/soujvnunes/themizer/issues)
