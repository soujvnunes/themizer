# themizer

Provide a design-like scheme (with design tokens and aliases) to have its values generated as CSS custom properties and a JavaScript object to be used in your app as a reference.

## Installation

```bash
pnpm add themizer@latest
``` 

## API

```ts
import themizer, { unwrapAtom, resolveAtom } from "themizer";

const { aliases, medias, tokens } = themizer({ prefix, medias, tokens, outDir? }, aliases);

const unwrapedAtom = unwrapAtom(aliases[key] /* or tokens[key] */);

const resolvedAtom = resolveAtom(aliases[key] /* or tokens[key] */)
```

### themizer

#### Parameters

|Property|Type|Default|Description|
|-|-|-|-|
|options.tokens|`Object`|_Required_|Object to componse `themizer.css` file and `aliases` as its function parameter, and `theme.tokens` as a JavaScript reference|
|options.medias|`Object`|_Required_|Object with values as media queries and key as its own aliases to replace the responsive properties in the `aliases` object values. It's also accessed throught `theme.medias` as it is as a JavaScript reference with the addition of `@media *` in its values| 
|options.prefix?|string|_Required_|Text to prefix all the generated CSS custom properties. It's required to avoid colision with other libraries custom properties|
|options.prefix?|`"root" \| string`|`src`|Output directory for the generated `themizer.css` file. No need to be defined, as it defaults to the `src` folder of the consumer project|
|aliases|`(tokens) => Object`|_Required_|Function to generate `theme.rules` having `options.tokens` passed as parameter, and `theme.aliases` as a JavaScript reference|

#### Return

|Property|Type|Description|
|-|-|-|
|theme.aliases|Object|Object containing the same keys as `aliases` parameter, but returning its CSS custom properties wrapped within `var(*)`. Use the utility `unwrapAtom` to unwrap it|
|theme.tokens|Object|Object containing the same keys as `options.tokens` parameter, but returning its CSS custom properties wrapped within `var(*)`. Use the utility `unwrapAtom` to unwrap it|
|theme.medias|Object|Object containing the `options.medias` to be also used as reference in JavaScript|

### unwrapAtom

#### Parameters

|Type|Description|
|-|-|
|string|Function to get generated custom properties. I.e. `unwrapAtom('var(--property)')` returns `--property`. Useful to change scoped custom properties|

#### Return

|Type|Description|
|-|-|
|string|String containing the unwrapped custom property|

### resolveAtom

#### Parameters

|Type|Description|
|-|-|
|string|Function to get the default value of a custom propertie. I.e. `resolveAtom('var(--property, value)')` returns `value`. Useful for reusability and keeping its source of truth|

#### Return

|Type|Description|
|-|-|
|string|String containing the default value of a custom property|

## Usage

1. Create a file and provide any tokens and options based on the product's design system needs.

```ts
// src/lib/theme.ts

import themizer from 'themizer'

const theme = themizer(
  {
    // "jv" in this example stands to João Victor, my name
    prefix: 'jv',
    // Changing "src" to "src/app"
    outDir: 'src/app', 
    medias: {
      desktop: '(min-width: 1024px)',
      // Nothing surprising, queries can be combined
      darkNonprint: '(prefers-color-scheme: dark) and not print',
      motion: '(prefers-reduced-motion: no-preference)',
    },
    tokens: {
      alphas: {
        primary: 0.8,
      },
      units: {
        16: '1rem',
        24: '1.5rem',
        40: '2.5rem',
      },
      timing: {
        bounce: 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
      },
      duration: {
        fast: '200ms',
      },
      colors: {
        amber: {
          50: '#fffbf4',
          500: '245 158 11',
          950: '#100a01',
        },
      },
    },
  },
  (tokens) => ({
    palette: {
      main: {
        primary: `rgb(${tokens.colors.amber[500]} / ${tokens.alphas.primary})`,
      },
      foreground: [{ darkNonprint: tokens.colors.amber[50] }, tokens.colors.amber[950]],
      background: [{ darkNonprint: tokens.colors.amber[950] }, tokens.colors.amber[50]],
    },
    typography: {
      heading: [{ desktop: tokens.units[40] }, tokens.units[24]],
      body: tokens.units[16],
    },
    motion: {
      bounce: [{ motion: `${tokens.trans.duration.fast} ${tokens.trans.timing.bounce}` }],
    },
  }),
)

export default theme
```

> Note that `prefix` was specified as "jv". Otherwise, the generated custom properties would start with `--tokens-*` for tokens and `--aliases-*` for aliases.

The generated custom properties would be written in your product's app `src/app/themizer.css`, and look like this:

```css
/* src/app/themizer.css */

:root {
  --jv-tokens-alphas-primary: 0.8;
  --jv-tokens-units-16: 1rem;
  --jv-tokens-units-24: 1.5rem;
  --jv-tokens-units-40: 2.5rem;
  --jv-tokens-timing-bounce: cubic-bezier(0.5, -0.5, 0.25, 1.5);
  --jv-tokens-duration-fast: 200ms;
  --jv-tokens-colors-amber-50: #fffbf4;
  --jv-tokens-colors-amber-500: 245 158 11; /* #f59e0b */
  --jv-tokens-colors-amber-950: #100a01;
  --jv-aliases-palette-main-primary: rgb(var(--jv-tokens-colors-amber-500) / var(--jv-tokens-alphas-primary));
  --jv-aliases-palette-foreground: var(--jv-tokens-colors-amber-950);
  --jv-aliases-palette-background: var(--jv-tokens-colors-amber-50);
  --jv-aliases-typography-heading: var(--jv-tokens-units-24);
  --jv-aliases-typography-body: var(--jv-tokens-units-16);
}

@media (prefers-color-scheme: dark) and not print {
  :root {
    --jv-aliases-palette-foreground: var(--jv-tokens-colors-amber-50);
    --jv-aliases-palette-background: var(--jv-tokens-colors-amber-950);
  }
}

@media (min-width: 1024px) {
  :root {
    --jv-aliases-typography-heading: var(--jv-tokens-units-40);
  }
}

@media (prefers-reduced-motion: no-preference) {
  :root {
    --jv-aliases-motion-bounce: var(--jv-tokens-duration-fast) var(--jv-tokens-timing-bounce);
  }
}
```

2. Index the generated CSS in the project's top-level file, and also start using themizer's helpers.

```diff
  // Example of src/app/layout.tsx Next.js file.

  import { type Viewport } from 'next'

+ import { resolveAtom } from 'themizer'

+ import theme from '@/lib/theme'

  import './global.css'
+ import './themizer.css'

  export const viewport: Viewport = {
    themeColor: [
      {
        media: '(prefers-color-scheme: dark)',
+       color: `rgb(${resolveAtom(theme.tokens.colors.amber[950])})`,
-       color: '#100a01',
      },
      {
        media: '(prefers-color-scheme: light)',
+       color: `rgb(${resolveAtom(theme.tokens.colors.amber[50])})`,
-       color: '#fffbf4',
      },
    ],
  }

  export default function AppLayout({ children }: React.PropsWithChildren) {
    return (
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    )
  }
```

### Extending Talwind CSS' v3 theme

Customize Tailwind CSS' default theme with the generated by `themizer`.

```diff
  // tailwind.config.ts

  import { type Config } from 'tailwindcss';
  import plugin from 'tailwindcss/plugin';
  import { type CSSRuleObject } from 'tailwindcss/types/config';

+ import theme from './lib/theme';

  export default {
    content: ['./app/**/*.{tsx,ts,mdx}', './components/**/*.{tsx,ts,mdx}'],
    theme: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
+       background: theme.aliases.palette.background,
+       foreground: theme.aliases.palette.foreground,
      },
      fontSize: {
+       heading: [theme.aliases.typography.heading, { lineHeight: theme.tokens.units[24] }],
+       body: [theme.aliases.typography.body],
      },
    },
  } satisfies Config
```

### Composing components

#### React and Tailwind CSS 

Implement React components using the generated theme.

```tsx
// src/components/Heading.tsx

import { unwrapAtom } from 'themizer'

export default function Heading({ className = '', ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      className={`text-heading ${className}`} {...props}
      styles={{
        /* If this component has to have it's font-size locked for some reason */
        [unwrapAtom(theme.aliases.typography.heading)]: theme.tokens.units[24],
      }}
    />
  )
}
```

> Apply the class names normally to style anything. And don't worry, intellisense will charmingly work.

![Intellisense Example](intellisense-example.png)

#### Next.js and styled-jsx (Next.js' built-in JSS solution)

```tsx
// src/components/Title.tsx

import theme from '@/lib/theme';

export default function Title({ children, className = '', ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1 className={`heading ${className}`} {...props}>
      {children}
      <style jsx>{`
        .heading {
          font-size: ${theme.aliases.typography.heading};
        }
      `}</style>
    </h1>
  );
}
```

> Remember to create a **styled-jsx** [registry](https://nextjs.org/docs/app/building-your-application/styling/css-in-js#styled-jsx) to collect all CSS rules in a render and inject the theme rules in the document.
