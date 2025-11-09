---
'themizer': minor
---

feat: always-on CSS variable name minification

CSS custom property names are now always minified to compact format (a0-z9, aa0-zz9, etc.), reducing bundle size by 15-30%. A source map (theme.css.map.json) is always generated for debugging. This change removes the NODE_ENV-based opt-in behavior in favor of consistent minification across all environments.

Breaking change: Generated CSS now always uses minified variable names instead of semantic names.
