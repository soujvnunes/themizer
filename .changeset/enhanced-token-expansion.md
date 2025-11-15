---
"themizer": minor
---

Enhanced token expansion with improved color algorithm and new units format

### Color Expansion Improvements
- More sophisticated color shade generation with harmonious palettes
- Variable chroma at extremes (0.0102 for lightest, 0.0268 for darkest)
- Warm hue shifts at both extremes for better visual harmony
- Updated lightness values: lightest 98.92%, darkest 14.92%, darker 35%

### Units Expansion Enhancement
- New object-based format: `{ rem: [0, 0.25, 4], px: [0, 4, 64] }`
- Type-safe CSS unit types (rem, em, px, percentage, vh, vw, etc.)
- Support for multiple unit types in a single configuration
- Cleaner numeric input values with automatic suffix generation

### Developer Experience
- Better TypeScript support with proper type inference
- Clearer separation between automatic expansion and manual definition
- Improved documentation with inline examples of generated values