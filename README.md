# ui-tokens

Give it an object reference and receive a flexible one with all CSS custom properties to be injected in the DOM the way you want.

## API

```ts
getTheme<
  Screens extends string,
  Tokens extends object,
  Values extends string | number | Record<Screens, string | number>,
  Aliases extends object,
>(
  aliases: Aliases | (tokens: Tokens) => Aliases,
  options: {
    prefixKeys: string;
    wrapKeys: (key: string) => string;
    screens: Record<Screens, `@media ${string}: ${string}`>,
    tokens: Tokens;
  };
): {
  aliases: Aliases;
  screens: Screens;
  tokens: Tokens;
};

```

## Example

Create a file and provide any tokens and options based on the product's design system needs.

```tsx
// helpers/rgba.ts

export default function rgba(color: string, alpha: string) {
  return `color-mix(in srgb, ${color} calc(${alpha} * 100), transparent)`;
}

// src/lib/theme.ts

import { getTheme } from 'ui-tokens';
import rgba from 'helpers/rgba';

const theme = getTheme(
  (tokens) => ({
    colors: {
      main: tokens.colors.amber[500],
      accent: {
        default: tokens.colors.amber[600],
        dark: tokens.colors.amber[400],
      },
      text: {
        primary: {
          default: rgba(tokens.colors.black, tokens.alphas.primary),
          dark: tokens.colors.white,
        },
        secondary: {
          default: rgba(tokens.colors.black, tokens.alphas.secondary),
          dark: rgba(tokens.colors.white, tokens.alphas.secondary),
        },
      },
    },
    spaces: {
      margin: {
        default: tokens.dimensions[16],
        desktop: tokens.dimensions[40],
      },
      padding: tokens.dimensions[8],
    },
    font: {
      sizes: {
        lg: {
          default: tokens.dimensions[40],
          desktop: tokens.dimensions[64],
        },
        md: tokens.dimensions[16],
      },
    },
    trans: {
      bounce: {
        motion: `${tokens.trans.duration.fast} ${tokens.trans.timing.bounce}`,
      },
    },
  }),
  {
    prefixKeys: 'ds',
    screens: {
      desktop: '@media (min-width: 1024px)',
      dark: '@media (prefers-color-scheme: dark)',
      motion: '@media (prefers-reduced-motion: no-preference)',
    },
    tokens: {
      colors: {
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        white: '#fff',
        black: '#000',
      },
      alphas: {
        primary: 0.8,
        secondary: 0.6,
      },
      dimensions: {
        8: '0.5rem',
        16: '1rem',
        40: '2.5rem',
        64: '4rem',
      },
      font: {
        sans: 'sofia-pro',
        weight: {
          regular: 400,
          semibold: 600,
          bold: 800,
        },
      },
      trans: {
        timing: {
          bounce: 'cubic-bezier(0.5, -0.5, 0.25, 1.5)',
        },
        duration: {
          fast: '200ms',
        },
      },
    },
  },
);
```

In this example, `theme` has two properties: `tokens` and `aliases`. They serves as a reference in JavaScript for the generated CSS custom properties.

```css
/*
 * The generated custom properties from the last example would look like this.
 * Note that the provided `prefixKeys` ("ds") is being used.
 * Otherwise, these custom properties would be just like
 * `--tokens-*` for tokens and `--aliases-*` for aliases.
 */

:root {
  /* Generated tokens */
  --ds-tokens-colors-amber-400: #fbbf24;
  --ds-tokens-colors-amber-500: #f59e0b;
  --ds-tokens-colors-amber-600: #d97706;
  --ds-tokens-colors-white: #fff;
  --ds-tokens-colors-black: #000;

  --ds-tokens-alphas-primary: 0.8;
  --ds-tokens-alphas-secondary: 0.6;

  --ds-tokens-dimensions-8: 0.5rem;
  --ds-tokens-dimensions-16: 1rem;
  --ds-tokens-dimensions-40: 2.5rem;

  --ds-tokens-font-sans: 'sofia-pro';
  --ds-tokens-font-weight-regular: 400;
  --ds-tokens-font-weight-semibold: 600;
  --ds-tokens-font-weight-bold: 800;

  --ds-tokens-trans-timing-bounce: cubic-bezier(0.5, -0.5, 0.25, 1.5);
  --ds-tokens-trans-duration-fast: 200ms;

  /* Generated aliases */
  --ds-aliases-colors-main: var(--ds-tokens-colors-amber-500);
  --ds-aliases-colors-accent: var(--ds-tokens-colors-amber-600);
  --ds-aliases-colors-text-primary: color-mix(
    in srgb,
    var(--ds-tokens-colors-black) calc(var(--ds-tokens-alphas-primary) * 100),
    transparent
  );
  --ds-aliases-colors-text-secondary: color-mix(
    in srgb,
    var(--ds-tokens-colors-black) calc(var(--ds-tokens-alphas-secondary) * 100),
    transparent
  );

  --ds-aliases-spaces-margin: var(--ds-tokens-dimensions-16);
  --ds-aliases-spaces-padding: var(--ds-tokens-dimensions-8);

  --ds-aliases-font-sizes-md: var(--ds-tokens-dimensions-16);
  --ds-aliases-font-sizes-lg: var(--ds-tokens-dimensions-40);

  @media (prefers-color-aliases: dark) {
    --ds-aliases-colors-accent: var(--ds-tokens-colors-amber-400);
    --ds-aliases-colors-text-primary: var(--ds-tokens-colors-white);
    --ds-aliases-colors-text-secondary: color-mix(
      in srgb,
      var(--ds-tokens-colors-white) calc(
          var(--ds-tokens-alphas-secondary) * 100
        ),
      transparent
    );
  }

  @media (min-width: 1024px) {
    --ds-aliases-spaces-margin: var(--ds-tokens-dimensions-40);
    --ds-aliases-font-sizes-lg: var(--ds-tokens-dimensions-64);
  }

  @media (prefers-reduced-motion: no-preference) {
    --ds-aliases-trans-bounce: var(--ds-tokens-trans-duration-fast) var(
        --ds-tokens-trans-timing-bounce
      );
  }
}
```

### Usage

The created theme and generated CSS variables needs to be indexed at the project's top-level file.

#### Next.js

At the top-level layout's file, index both theme and generated CSS from `ui-tokens`.

```tsx
// src/app/layout.tsx

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Import the generated CSS files containing its variables
import 'ui-tokens/variables.css';

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

##### styled-jx

Then, the tokens and aliases will be available in the entire project.

```tsx
// src/app/page.tsx

'use client';

import theme from 'ui-tokens';

export default function Page() {
  return (
    <div className="container">
      <h1 className="title">Styled with Styled JSX</h1>
      <style jsx>{`
        .container {
          width: grid;
          margin: ${theme.aliases.spaces.margin};
          gap: ${theme.aliases.spaces.padding};
        }

        .title {
          font-size: ${theme.aliases.font.sizes.lg};
          font-weight: ${theme.tokens.font.weight.bold};
        }

        ${theme.screens.desktop} {
          .container {
            gap: ${theme.tokens.dimenstions[16]};
          }
        }
      `}</style>
    </div>
  );
}
```
