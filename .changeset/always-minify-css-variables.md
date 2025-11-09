---
'themizer': minor
---

feat: enhanced CSS variable name minification

CSS custom property names are now always minified with several improvements:

- **Always-on minification**: Consistent minification across all environments (removes NODE_ENV detection)
- **Extended character set**: Uses base-52 encoding (a-z, A-Z) providing 520 single-letter variables before needing double letters (2x improvement over previous a-z only)
- **Prefix-aware minification**: When using the `prefix` option, minified names incorporate the prefix (e.g., `--ds0`, `--ui0`) preventing collisions when multiple themed packages are used together
- **Automatic source maps**: A `theme.css.map.json` file is always generated for debugging minified variable names

**Pattern examples:**
- Without prefix: `--a0...--z9, --A0...--Z9, --aa0...--ZZ9`
- With prefix 'ds': `--ds0...--ds9, --dsa0...--dsZ9, --dsaa0...--dsZZ9`

Breaking change: Generated CSS now always uses minified variable names instead of semantic names.
