---
'themizer': patch
---

fix: correct package.json exports to match build output

Fixed module resolution issues by updating package.json exports to point to the correct build files:
- ESM import: `dist/index.js` (was incorrectly pointing to non-existent `dist/index.mjs`)
- CommonJS require: `dist/index.cjs` (was incorrectly pointing to `dist/index.js`)
