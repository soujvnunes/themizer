# themizer

Provide a design-like scheme (with design tokens and aliases) to have its values generated as CSS custom properties and a JavaScript object to be used in your app as a reference.

## Installation

```bash
pnpm add themizer@latest
``` 

## API

```ts
import themizer, { unwrapAtom, resolveAtom } from "themizer";

const { aliases, medias, tokens, rules } = themizer(aliases, { medias, prefixAtoms? });

const unwrapedAtom = unwrapAtom(aliases[key] /* or tokens[key] */);

const resolvedAtom = resolveAtom(aliases[key] /* or tokens[key] */)
```

### themizer

#### Parameters

|Property|Type|Default|Description|
|-|-|-|-|
|aliases|`(tokens) => Object`|_Required_|Function to generate `theme.rules` having `options.tokens` passed as parameter, and `theme.aliases` as a JavaScript reference|
|options.tokens|`Object`|_Required_|Object to generate `theme.rules` and compose `aliases` as parameter, and `theme.tokens` as a JavaScript reference|
|options.medias|`Object`|_Required_|Object with values as media queries and key as its own aliases to replace the responsive properties in the `aliases` object values. It's also accessed throught `theme.medias` as it is as a JavaScript reference| 
|options.prefixAtoms?|string||Text to prefix all the generated CSS custom properties|

#### Return

|Property|Type|Description|
|-|-|-|
|theme.aliases|Object|Object containing the same keys as `aliases` parameter, but returning its CSS custom properties|
|theme.rules.css|string|String containing the custom properties as CSS format|
|theme.rules.jss|string|Object containing the custom properties as JSS format|
|theme.medias?|Object|Object containing the `options.medias` to be also used as reference in JavaScript|
|theme.tokens?|Object|Object containing the same keys as `options.tokens` parameter, but returning its CSS custom properties|

### unwrapAtom

#### Parameters

|Property|Type|Default|Description|
|-|-|-|-|
|atom|string|_Required_|Function to generate `theme.rules` having `options.tokens` passed as parameter, and `theme.aliases` as a JavaScript reference|

#### Return

|Property|Type|Description|
|-|-|-|
|atom|string|Object containing the same keys as `aliases` parameter, but returning its CSS custom properties|

### resolveAtom

#### Parameters

|Property|Type|Default|Description|
|-|-|-|-|
|atom|string|_Required_|Function to generate `theme.rules` having `options.tokens` passed as parameter, and `theme.aliases` as a JavaScript reference|

#### Return

|Property|Type|Description|
|-|-|-|
|atom|string|Object containing the same keys as `aliases` parameter, but returning its CSS custom properties|


## Usage

Create a file and provide any tokens and options based on the product's design system needs.

```ts
// src/lib/theme.ts

import themizer from 'themizer';
import rgba from 'helpers/rgba';

const theme = themizer(
  (tokens) => ({
    palette: {
      main: {
        primary: `rgb(${tokens.colors.amber[500]} / ${tokens.alphas.primary})`,
      },
      foreground: {
        dark: tokens.colors.amber[50],
        DEFAULT: tokens.colors.amber[950],
      },
      background: {
        dark: tokens.colors.amber[950],
        DEFAULT: tokens.colors.amber[50],
      },
    },
    typography: {
      title: {
        desktop: tokens.units[40],
        DEFAULT: tokens.units[24]
      },
      body: tokens.units[16],
    },
    motion: {
      bounce: {
        motion: `${tokens.trans.duration.fast} ${tokens.trans.timing.bounce}`,
      },
    },
  }),
  {
    prefixAtoms: 'brand',
    medias: {
      desktop: '(min-width: 1024px)',
      dark: '(prefers-color-scheme: dark)',
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
);
```

The generated custom properties from the last example would look like this.

> Note that the provided `prefixAtoms` ("brand") is being used. Otherwise, these custom properties would be just like `--tokens-*` for tokens and `--aliases-*` for aliases.

Generated styles within `theme.rules.css`:

```css
:root {
  --brand-tokens-alphas-primary: 0.8;
  --brand-tokens-units-16: 1rem;
  --brand-tokens-units-24: 1.5rem;
  --brand-tokens-units-40: 2.5rem;
  --brand-tokens-timing-bounce: cubic-bezier(0.5, -0.5, 0.25, 1.5);
  --brand-tokens-duration-fast: 200ms;
  --brand-tokens-colors-amber-50: #fffbf4;
  --brand-tokens-colors-amber-500: 245 158 11; /* #f59e0b */
  --brand-tokens-colors-amber-950: #100a01;
  --brand-aliases-palette-main-primary: rgb(var(--brand-tokens-colors-amber-500) / var(--brand-tokens-alphas-primary));
  --brand-aliases-palette-foreground: var(--brand-tokens-colors-amber-950);
  --brand-aliases-palette-background: var(--brand-tokens-colors-amber-50);
  --brand-aliases-typography-title: var(--ds-tokens-units-24);
  --brand-aliases-typography-body: var(--ds-tokens-units-16);
}

@media (prefers-color-scheme: dark) {
  :root {
    --brand-aliases-palette-foreground: var(--brand-tokens-colors-amber-50);
    --brand-aliases-palette-background: var(--brand-tokens-colors-amber-950);
  }
}

@media (min-width: 1024px) {
  :root {
    --brand-aliases-typography-title: var(--brand-tokens-units-40);
  }
}

@media (prefers-reduced-motion: no-preference) {
  :root {
    --brand-aliases-motion-bounce: var(--brand-tokens-duration-fast) var(--brand-tokens-timing-bounce);
  }
}
```

Generated styles within `theme.rules.jss`:

```json
{
  ":root": {
    "--brand-tokens-alphas-primary": "0.8",
    "--brand-tokens-units-16": "1rem",
    "--brand-tokens-units-24": "1.5rem",
    "--brand-tokens-units-40": "2.5rem",
    "--brand-tokens-timing-bounce": "cubic-bezier(0.5, -0.5, 0.25, 1.5)",
    "--brand-tokens-duration-fast": "200ms",
    "--brand-tokens-colors-amber-50": "#fffbf4",
    "--brand-tokens-colors-amber-500": "245 158 11", /* #f59e0b */
    "--brand-tokens-colors-amber-950": "#100a01",
    "--brand-aliases-palette-main-primary": "rgb(var(--brand-tokens-colors-amber-500) / var(--brand-tokens-alphas-primary))",
    "--brand-aliases-palette-foreground": "var(--brand-tokens-colors-amber-950)",
    "--brand-aliases-palette-background": "var(--brand-tokens-colors-amber-50)",
    "--brand-aliases-typography-title": "var(--ds-tokens-units-24)",
    "--brand-aliases-typography-body": "var(--ds-tokens-units-16)",
  },
  "@media (prefers-color-scheme: dark)": {
    ":root": {
      "--brand-aliases-palette-foreground": "var(--brand-tokens-colors-amber-50)",
      "--brand-aliases-palette-background": "var(--brand-tokens-colors-amber-950)",
    }
  },
  "@media (min-width: 1024px)": {
    ":root": {
      "--brand-aliases-typography-title": "var(--brand-tokens-units-40)",
    }
  },
  "@media (prefers-reduced-motion: no-preference)": {
    ":root": {
      "--ds-aliases-motion-bounce": "var(--ds-tokens-trans-duration-fast) var(--ds-tokens-trans-timing-bounce)"
    }
  }
}
```

### Usage

The generated CSS custom properties needs to be indexed at the project's top-level file.

#### Next.js and Talwind CSS

1. Customize Tailwind CSS' default theme with the generated by `themizer`.

```ts
// tailwind.config.ts

import { type Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import { type CSSRuleObject } from 'tailwindcss/types/config';

import theme from '@/lib/theme';

const config = {
  content: ['./app/**/*.{tsx,ts,mdx}', './components/**/*.{tsx,ts,mdx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      background: theme.aliases.palette.background,
      foreground: theme.aliases.palette.foreground,
    },
    fontSize: {
      body: [
        theme.aliases.typography.title,
        {
          lineHeight: theme.tokens.units[24],
        },
      ],
    },
  },
  plugins: [
    plugin((api) => api.addBase(theme.rules.jss as CSSRuleObject)),
  ],
} satisfies Config;

export default config;
```

2. Apply the class names normally to style anything. And don't worry, intellisense will charmingly work.

```tsx
import type { Metadata, Viewport } from 'next';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { resolveAtom } from 'themizer';

import theme from '@/lib/theme';

import './global.css';

export const viewport: Viewport = {
  themeColor: [
    {
      media: '(prefers-color-scheme: dark)',
      color: `rgb(${resolveAtom(theme.tokens.colors.amber[950])})`,
    },
    {
      media: '(prefers-color-scheme: light)',
      color: `rgb(${resolveAtom(theme.tokens.colors.amber[50])})`,
    },
  ],
};

export default function AppLayout({ children }: React.PropsWithChildren) {
  return (
    <html
      lang="en"
      className="h-full bg-background text-body text-foreground antialiased"
    >
      <body className="flex h-full flex-col">
        <main className="m-auto">{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

> ✨

![Intellisense Example](intellisense-example.png)

#### Next.js and styled-jsx (native CSS-in-JS solution)

1. Create a **styled-jsx** [registry](https://nextjs.org/docs/app/building-your-application/styling/css-in-js#styled-jsx) to collect all CSS rules in a render and inject the theme rules in the document.

```tsx
// src/providers/StyledJsxProvider.tsx

'use client';

import { useState } from 'react';

import { useServerInsertedHTML } from 'next/navigation';

import { StyleRegistry, createStyleRegistry } from 'styled-jsx';

import theme from '@/lib/theme';

export default function StyledJsxProvider({
  children,
}: React.PropsWithChildren) {
  const [styleRegistry] = useState(createStyleRegistry);

  useServerInsertedHTML(() => {
    styleRegistry.flush();

    return <>{styleRegistry.styles()}</>;
  });

  return (
    <StyleRegistry registry={styleRegistry}>
      <style jsx global>{`
        ${theme.rules}/* Other CSS styles, such as Reset, Normalize and so on. */
      `}</style>
      {children}
    </StyleRegistry>
  );
}
```

2. Wrap the children of the root layout with the style registry component.

```tsx
// src/app/layout.tsx

import type { Viewport } from 'next';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import StyledJsxProvider from '@/providers/StyledJsxProvider';

import { resolveAtom, unwrapAtom } from 'themizer';

export const viewport: Viewport = {
  themeColor: [
    {
      media: '(prefers-color-scheme: dark)',
      color: resolveAtom(theme.tokens.colors.amber[400]), // #fbbf24
    },
    {
      media: '(prefers-color-scheme: light)',
      color: resolveAtom(theme.tokens.colors.amber[600]), // #d97706
    },
  ],
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html
      lang="en"
      style={{
        // --ds-tokens-trans-duration-fast
        [unwrapVar(theme.tokens.duration.fast)]: '400ms',
      }}
    >
      <body>
        <StyledJsxProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </StyledJsxProvider>
      </body>
    </html>
  );
}
```

3. Implement components using the generated theme.

```tsx
// src/components/Title.tsx

import theme from '@/lib/theme';

export default function Title({
  children,
  className = '',
  ...props
}: React.ComponentProps<'h1'>) {
  return (
    <h1 className={`title ${className}`} {...props}>
      {children}
      <style jsx>{`
        .title {
          font-size: ${theme.aliases.typography.title};
        }
      `}</style>
    </h1>
  );
}
```

4. Or anywhere else it's needed.

> No need to change de directive of a file to use theme.

```tsx
// src/app/page.tsx

import Title from '@/components/Title';

import theme from '@/lib/theme';

export default function Page() {
  return (
    <main>
      <Title>Styled with Styled JSX</Title>
    </main>
  );
}
```
