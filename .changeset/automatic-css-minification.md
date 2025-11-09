---
"themizer": minor
---

Add automatic CSS variable minification for production builds

CSS custom properties are now automatically minified when `NODE_ENV=production`, reducing bundle size by 15-30% for typical design systems.

**Features:**
- Automatic minification in production (no configuration needed)
- Sequential naming pattern: `a0, a1, ..., z9, aa0, ...`
- Source map generation (`theme.css.map.json`) for debugging
- Deterministic minification ensures consistent builds
- ~88% reduction in variable name length

**Breaking changes:** None - minification only activates in production mode

**Framework support:**
- Next.js/Vercel: Automatic detection during build
- Other frameworks: Set `NODE_ENV=production` when running `themizer:theme`

**Important:** Do not set `NODE_ENV` in `.env` files to avoid deployment conflicts
