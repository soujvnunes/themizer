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
- **Responsive Design** - Built-in media query support
- **Single Source of Truth** - Define your design system once, use everywhere
- **Tailwind Integration** - Extend Tailwind's theme with your tokens
- **CSS-in-JS Compatible** - Works with styled-jsx, styled-components, emotion, etc.

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

const medias = {
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  dark: '(prefers-color-scheme: dark)',
} as const

const tokens = {
  colors: {
    black: '#000000',
    white: '#ffffff',
    green: { 500: '#22c55e', 600: '#16a34a' },
  },
  alphas: { primary: 1, secondary: 0.8 },
  units: { 16: '1rem', 24: '1.5rem', 40: '2.5rem' },
}

const { aliases, tokens: resolvedTokens } = themizer(
  { prefix: 'theme', medias, tokens },
  ({ colors, alphas, units }) => ({
    // Semantic aliases grouped by context
    palette: {
      text: [`rgb(${colors.black} / ${alphas.secondary})`, { dark: `rgb(${colors.white} / ${alphas.primary})` }],
      background: [colors.white, { dark: colors.black }],
      main: colors.green[500],
    },
    typography: {
      title: [units[24], { lg: units[40] }],
      body: units[16],
    },
  }),
)

export { aliases, resolvedTokens as tokens, medias }
```

**Key Concept:**
- **Tokens** = Raw values (`colors.green[500]`)
- **Aliases** = Semantic names (`palette.text`, `typography.title`)
- Responsive values use array syntax: `[defaultValue, { mediaKey: value }]`

### 2. Generate CSS

```bash
pnpm run themizer:theme        # Generate once
pnpm run themizer:theme:watch  # Watch mode (if configured with --watch)
```

This creates `theme.css` with CSS custom properties:

```css
:root {
  --theme-tokens-colors-green-500: #22c55e;
  --theme-aliases-palette-text: rgb(var(--theme-tokens-colors-black) / var(--theme-tokens-alphas-secondary));
  --theme-aliases-palette-main: var(--theme-tokens-colors-green-500);
  --theme-aliases-typography-title: var(--theme-tokens-units-24);
  /* ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --theme-aliases-palette-text: rgb(var(--theme-tokens-colors-white) / var(--theme-tokens-alphas-primary));
    --theme-aliases-palette-background: var(--theme-tokens-colors-black);
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

### Tailwind CSS v4

```css
/* app/globals.css */
@import "tailwindcss";
@import "./theme.css";

@theme {
  --color-text: var(--theme-aliases-palette-text);
  --color-background: var(--theme-aliases-palette-background);
  --color-main: var(--theme-aliases-palette-main);
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
        text: theme.aliases.palette.text,
        background: theme.aliases.palette.background,
        main: theme.aliases.palette.main,
      },
      fontSize: {
        title: [theme.aliases.typography.title],
      },
    },
  },
} satisfies Config
```

Use semantic class names:

```tsx
<div className="bg-background text-text">
  <h1 className="text-title text-main">Hello World</h1>
</div>
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
          color: ${theme.aliases.palette.main};
          font-size: ${theme.aliases.typography.title};
        }
      `}</style>
    </h1>
  )
}
```

### CSS-in-JS (styled-components, emotion)

```tsx
import styled from 'styled-components'
import theme from './themizer.config'

const Button = styled.button`
  background-color: ${theme.aliases.palette.main};
  color: ${theme.aliases.palette.text};
  padding: ${theme.aliases.typography.body};

  &:hover {
    opacity: ${theme.tokens.alphas.secondary};
  }
`
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

```ts
const { aliases, tokens, medias } = themizer(
  {
    prefix: 'theme',              // CSS custom property prefix
    medias: { lg: '(min-width: 1024px)' },
    tokens: { colors: { blue: '#3b82f6' } },
  },
  (t) => ({
    primary: t.colors.blue,       // Semantic alias
  }),
)
```

**Returns:**
- `aliases` - Semantic names wrapped in `var()` for CSS/JS use
- `tokens` - Design tokens wrapped in `var()` for CSS/JS use
- `medias` - Media queries prefixed with `@media`

### `unwrapAtom(atom)`

Extract CSS custom property name from `var()` expression.

```ts
import { unwrapAtom } from 'themizer'

unwrapAtom('var(--theme-aliases-primary)')  // → "--theme-aliases-primary"

// Useful for scoped overrides:
<div style={{ [unwrapAtom(theme.aliases.primary)]: '#ff0000' }} />
```

### `resolveAtom(atom)`

Extract default value from `var()` expression.

```ts
import { resolveAtom } from 'themizer'

resolveAtom('var(--theme-aliases-primary, #3b82f6)')  // → "#3b82f6"

// Useful for non-CSS contexts:
export const viewport = {
  themeColor: resolveAtom(theme.tokens.colors.blue),
}
```

## Advanced

### Dark Mode

```ts
const { aliases } = themizer(
  {
    prefix: 'theme',
    medias: { dark: '(prefers-color-scheme: dark)' },
    tokens: { colors: { white: '#fff', black: '#000' } },
  },
  (t) => ({
    foreground: [t.colors.black, { dark: t.colors.white }],
    background: [t.colors.white, { dark: t.colors.black }],
  }),
)
```

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
