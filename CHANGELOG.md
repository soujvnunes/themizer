# @soujvnunes/themizer

## Unreleased

### Documentation

- Marked `rules` and `variableMap` as internal/advanced usage in API docs
- Simplified Framework Integration section to lead with `theme.css` import
- Updated CLI help text to recommend watch mode for development

## 1.7.0

### Minor Changes

- c779070: Enhanced token expansion with improved color algorithm and new units format

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

- 1b6dcb4: Improve type inference for units expansion with literal types

  ## Enhanced Type Inference

  Added literal type inference for standard unit configurations, providing IntelliSense autocomplete for common scales.

  ### Features

  - **Literal types for standard configs**: Common unit configurations now provide exact value autocomplete
  - **Fallback for custom configs**: Non-standard configurations still work with generic number types
  - **Better IntelliSense display**: Units now show actual object structure instead of `Record<>` notation

  ### Standard Configurations

  ```ts
  // Standard rem scale [0, 0.25, 4] - shows available values in IntelliSense
  theme.tokens.units.rem[0.5][ // ✅ Valid - IntelliSense shows: 0, 0.25, 0.5, 0.75, 1, ...
    // Standard px scales
    (0, 4, 16)
  ][(0, 4, 64)][(0, 8, 128)] // Small scale: 0, 4, 8, 12, 16 // Default scale: 0, 4, 8, 12, 16, 20, 24, ... // Large scale: 0, 8, 16, 24, 32, ...
  ```

  ### Type Helpers

  New helper types in `src/types/helpers.ts`:

  ```ts
  // Extract available unit keys
  type Keys = ExtractUnitKeys<{ rem: [0, 0.25, 4] }>
  // Keys['rem'] = 0 | 0.25 | 0.5 | ... | 4

  // Type-safe unit values
  type RemValue = UnitValue<Config, 'rem'>

  // Infer complete theme structure
  type Theme = InferTokens<ConfigType>
  ```

  ### TypeScript Support

  - Added scale types: `RemScale`, `PxScale`, `PercentageScale`, etc.
  - `ConfigToScale` type mapping for automatic inference
  - `ExpandedUnits` type improved to show object structure

- 806743d: Add automatic color palette expansion with new `palette` token property

  ## New Feature: `palette` Property

  Introduce a dedicated `palette` property for automatic OKLCH color expansion. This provides explicit control over which colors are expanded into 7 harmonious shades.

  ### Usage

  ```ts
  export default themizer(
    {
      tokens: {
        // Auto-expand OKLCH colors into 7 shades
        palette: {
          amber: 'oklch(76.9% 0.188 70.08)',
          // Generates: lightest, lighter, light, base, dark, darker, darkest
        },

        // Manual color definitions (no expansion)
        colors: {
          blue: { 500: '#3b82f6', 700: '#1d4ed8' },
          red: '#ff0000',
        },
      },
    },
    ({ palette, colors }) => ({
      // Semantic aliases from tokens
      brand: {
        base: palette.amber.base,
        light: palette.amber.light,
        accent: colors.blue[500],
      },
    }),
  )
  ```

  ## Features

  - **Type-safe**: `palette` only accepts OKLCH format strings - invalid formats throw clear errors
  - **Explicit expansion**: Clear distinction between auto-expanding colors (`palette`) and manual definitions (`colors`)
  - **Harmonious shades**: Generates 7 perceptually-balanced shades with variable chroma and warm hue shifts
  - **Runtime validation**: `validatePaletteConfig` ensures only valid OKLCH strings are provided

  ## Generated Shades

  Each color in `palette` expands to:

  - `lightest` (L: 98.92%, low chroma, +11.72° hue)
  - `lighter` (L: 96.2%, reduced chroma)
  - `light` (L: base + 5.9, half chroma)
  - `base` (original color)
  - `dark` (L: base - 10.3, 80% chroma)
  - `darker` (L: 35%, half chroma)
  - `darkest` (L: 14.92%, low chroma, +15.69° hue)

  ## Error Handling

  ```ts
  palette: {
    // ✅ Valid
    amber: 'oklch(76.9% 0.188 70.08)',

    // ❌ Error: not OKLCH format
    red: '#ff0000',

    // ❌ Error: can't use object notation
    blue: { 500: 'oklch(50% 0.15 240)' },
  }
  ```

### Patch Changes

- 2ad055a: Improve error handling with consistent themizer prefix

  ## Improvements

  - Added `createError` and `createContextError` helper functions for consistent error messaging
  - All errors now include "themizer:" prefix for clear identification
  - Context-aware errors show which module threw the error (e.g., "themizer [validation]:")
  - Prevents double-prefixing when re-throwing errors

  ## Changes

  - Created `src/lib/createError.ts` with error helper functions
  - Updated all `throw new Error()` calls to use the new helpers
  - Fixed error handling in `executeConfig` to avoid duplicate prefixes
  - Added comprehensive tests for error helpers

  This ensures users always know when an error comes from themizer and provides better debugging context.

- 806743d: Add runtime validation for units configuration and fix documentation

  ### Validation Enhancements

  - Added `validateUnitsConfig` function with clear error messages
  - Runtime validation now provides helpful guidance when invalid keys are used
  - Error messages explain that custom named values should be separate token properties

  ### Documentation Corrections

  - Fixed incorrect examples showing nested "spacing" within units configuration
  - Clarified that `units` property accepts ONLY CSS unit types (rem, px, em, etc.)
  - Updated all examples to show correct pattern: units for expansion, separate properties for named values

  ### Developer Experience

  - Runtime validation catches invalid units configuration with helpful error messages
  - Clear documentation guides users toward the correct pattern
  - No breaking changes - this enforces what was already the only working pattern

## 1.6.3

### Patch Changes

- 96f4b01: Add @property registration rules to JSS output. The getJSS function now includes CSS @property rules with type validation for all custom properties.

## 1.6.2

### Patch Changes

- da395b3: fix(ci): improve release workflow reliability

  - Replace `--provenance` flag with `--no-git-checks` to avoid OIDC configuration issues during npm publish
  - Add `git pull --rebase` before pushing version bump to prevent non-fast-forward errors when concurrent commits exist
  - These changes ensure the automated release workflow runs successfully without manual intervention

## 1.6.1

### Patch Changes

- 142945c: fix: update npm publish workflow configuration

  - Replace --provenance with --no-git-checks to avoid OIDC configuration issues
  - Ensure NPM_TOKEN automation token is used to bypass 2FA/OTP requirements

## 1.6.0

### Minor Changes

- bb5b5a7: feat: enhanced CSS variable name minification

  CSS custom property names are now always minified with several improvements:

  - **Always-on minification**: Consistent minification across all environments (removes NODE_ENV detection)
  - **Extended character set**: Uses base-52 encoding (a-z, A-Z) providing 520 single-letter variables before needing double letters (2x improvement over previous a-z only)
  - **Prefix-aware minification**: When using the `prefix` option, minified names incorporate the prefix (e.g., `--ds0`, `--ui0`) preventing collisions when multiple themed packages are used together
  - **Automatic source maps**: A `theme.css.map.json` file is always generated for debugging minified variable names

  **Pattern examples:**

  - Without prefix: `--a0...--z9, --A0...--Z9, --aa0...--ZZ9`
  - With prefix 'ds': `--ds0...--ds9, --dsa0...--dsZ9, --dsaa0...--dsZZ9`

  Breaking change: Generated CSS now always uses minified variable names instead of semantic names.

## 1.5.0

### Minor Changes

- 1029090: Add CSS @property registration for type validation and browser optimization

  This release introduces automatic CSS `@property` registration for all generated custom properties, providing type validation and browser optimization.

  **New Features:**

  - Automatic type inference for CSS custom properties (colors, lengths, percentages, angles, time values, etc.)
  - CSS `@property` at-rule generation with syntax validation
  - Comprehensive support for 160+ CSS named colors and all CSS syntax types

  **Type Validation Benefits:**

  - Browsers now validate that custom property values match their declared syntax types
  - Prevents type mismatches (e.g., setting a `<color>` to `16px`)
  - Type-safe custom properties with automatic type detection

  **Breaking Changes:**

  None - This feature is fully backward compatible. Existing configurations will automatically benefit from `@property` registration.

  **Example:**

  ```typescript
  export default themizer(
    {
      prefix: 'theme',
      medias: {},
      tokens: {
        colors: { primary: 'oklch(76.9% 0.188 70.08)' },
        spacing: { md: '1rem' },
      },
    },
    ({ colors }) => ({ foreground: colors.primary }),
  )
  ```

  Generated CSS now includes:

  ```css
  @property --theme-tokens-colors-primary {
    syntax: '<color>';
    inherits: false;
    initial-value: oklch(76.9% 0.188 70.08);
  }
  ```

## 1.4.2

### Patch Changes

- b71f771: Test automated publishing workflow with npm Trusted Publishing (OIDC)

## 1.4.1

### Patch Changes

- 8338f7d: Refactor architecture for better maintainability and add comprehensive improvements

  **Breaking Changes (Internal):**

  - Remove side-effects from `themizer()` function - now returns `rules.css` and `rules.jss` without writing files. File writing is handled by CLI commands and `writeThemeFile()` helper, maintaining backward compatibility for CLI users.

  **Bug Fixes:**

  - Fix TypeScript type conflict in RJSS interface by converting from interface to intersection type (fixes TS2411 error)
  - Fix import path for detectFramework in init tests

  **Refactoring:**

  - Consolidate config execution in `writeThemeFile()` for cleaner separation of concerns
  - Simplify `executeConfig()` to return CSS directly instead of module object
  - Separate CLI validators into dedicated module (`src/lib/validators.ts` → `src/cli/validators.ts`)
  - Move framework detection to CLI module for better organization
  - Make `executeConfig()` testable via dependency injection
  - Modernize init template with OKLCH colors and semantic structure
  - Remove unused ThemeTempFile infrastructure and related constants

  **Testing:**

  - Add comprehensive tests for CLI validators
  - Add missing shellEscape tests
  - Improve writeThemeFile test assertions
  - Improve theme test mocking strategy
  - Add tests for executeConfig functionality

  **Documentation:**

  - Add JSDoc documentation to type exports in main entry point
  - Add comprehensive JSDoc to internal library functions
  - Update README examples to match new init template
  - Modernize README examples with color-mix() and semantic naming
  - Add comprehensive Linaria (zero-runtime CSS-in-JS) integration examples
  - Highlight themizer's side-effect-free design enabling build-time CSS extraction
  - Document RJSS interface to type conversion in CHANGELOG

  **Code Quality:**

  - Export utility functions (`addAtMedia`, `atomizer`, `getVar`, `getJSS`) for advanced use cases
  - Improve code organization by separating concerns between CLI and library code

## 1.4.0

### Minor Changes

- 3d088b4: Add watch mode for automatic theme.css regeneration, improve security with input validation, add comprehensive JSDoc documentation, and fix multiple production-readiness issues.

  **New Features:**

  - Add `--watch` flag to `theme` command for automatic CSS regeneration on config changes
  - Export framework detection types (`Framework`, `FrameworkDetectionResult`) for advanced integrations

  **Security Improvements:**

  - Secure all JSON.parse() operations with try-catch blocks and structure validation
  - Add path validation to both interactive prompts and CLI flags to prevent directory traversal attacks
  - Extract shell escaping logic to dedicated `escapeSingleQuotes()` helper with comprehensive documentation to prevent command injection
  - Improve media query validation regex to prevent malformed CSS values (rejects multiple decimals, orphan slashes, etc.)
  - Add reusable validation utilities (`isPlainObject`, `validatePlainObject`) with proper TypeScript type guards and assertion functions
  - Eliminate duplicate validation code across init.ts, detectFramework.ts, and tsup.config.ts
  - Improve type safety in framework detection with proper type checking
  - Add graceful shutdown handlers for file watcher to prevent resource leaks

  **Documentation:**

  - Add comprehensive JSDoc comments to all public API functions (`themizer`, `resolveAtom`, `unwrapAtom`, `isAtom`, `getCSS`)
  - Include usage examples in JSDoc for better developer experience

  **Bug Fixes:**

  - Fix temp file extension typo (`.text` → `.tmp`)
  - Remove unused `MEDIA_QUERY_FEATURE_REGEX` constant
  - Fix hardcoded version by implementing build-time injection from package.json
  - Update TSConfig to remove outdated `src/cli/index.ts` reference
  - Fix ESLint configuration to include root-level TypeScript files
  - Fix media query validation regex to support keyword values (prefers-color-scheme, orientation, etc.) in addition to numeric values
  - Fix TypeScript error TS2411 in RJSS type by converting from interface to intersection type. This resolves the conflict between the optional ':root' property and the index signature while maintaining the same runtime behavior. Note: The RJSS interface can no longer be extended via `interface extends`, but can still be composed using type intersections.

  **Improvements:**

  - Extract magic number to `MAX_CSS_IDENTIFIER_LENGTH` constant for better maintainability
  - Clarify RegExp instantiation in `resolveAtom` - document that fresh instances are created to avoid global state issues with recursive calls
  - Extract media query feature pattern to `MEDIA_QUERY_FEATURE_PATTERN` constant with strict validation rules and comprehensive documentation
  - Extract temp file extension to `TEMP_FILE_EXTENSION` constant for better maintainability
  - Refactor version reading in `tsup.config.ts` to use dedicated function with proper validation
  - Simplify nested try-catch structure in framework detection for better code clarity
  - Improve Next.js version parsing robustness with explicit length checks
  - Add `resetForTesting()` method to `ThemeTempFile` for better test isolation
  - Add documentation clarifying race condition safety in ThemeTempFile event handler registration (Node.js single-threaded event loop guarantees)
  - Enhance CLI error formatting with user-friendly messages and debug mode support
  - Update ESLint rules to allow console.log in CLI files
  - Update all dependencies to latest versions
  - Improve ThemeTempFile event handler registration to prevent duplicates in test environments
  - Fix Node.js version requirement inconsistency between CONTRIBUTING.md and package.json

### Patch Changes

- 033c55b: fix: correct package.json exports to match build output

  Fixed module resolution issues by updating package.json exports to point to the correct build files:

  - ESM import: `dist/index.js` (was incorrectly pointing to non-existent `dist/index.mjs`)
  - CommonJS require: `dist/index.cjs` (was incorrectly pointing to `dist/index.js`)

- c569cc9: fix: theme command now automatically executes config file with cache busting

  The `themizer theme` command now dynamically imports and executes the `themizer.config.ts` file, so you don't need to import it in your application code to generate CSS. This fixes the issue where the command would fail with "ENOENT: no such file or directory" because the config hadn't been executed yet.

  Also added cache busting to ensure config changes are properly detected in watch mode.

## 1.3.0

### Minor Changes

- ff29eb1: prefer writting atoms file on build

## 1.1.0

### Minor Changes

- e77a9a1: adjust generated theme types

## 1.0.1

### Patch Changes

- 018f3e0: setup dual publish and changesets
