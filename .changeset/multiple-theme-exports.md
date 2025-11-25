---
"themizer": major
---

Add support for multiple theme exports with breaking changes

**New Features:**
- Support exporting multiple themes from `themizer.config.ts`
- All named exports are automatically detected and combined into a single `theme.css` file
- Enhanced CLI logging shows theme count when multiple themes are generated
- Each theme uses its own prefix to avoid naming conflicts

**Breaking Changes:**
- Only named exports are now supported (default export is ignored)
- Users must migrate from `export default themizer(...)` to `export const theme = themizer(...)`
- Generated config templates now use named exports

**Migration Guide:**
```ts
// Before (no longer works)
export default themizer({ prefix: 'theme', ... }, () => ({}))

// After
export const theme = themizer({ prefix: 'theme', ... }, () => ({}))
```

**Multiple Themes Example:**
```ts
export const cocaCola = themizer({ prefix: 'coke', tokens: cokeTokens, medias }, () => ({}))
export const nike = themizer({ prefix: 'nike', tokens: nikeTokens, medias }, () => ({}))
```

All themes are combined into a single optimized `theme.css` file with enhanced logging:
```
themizer: theme.css written to ./src/app (2 themes: cocaCola, nike)
```
