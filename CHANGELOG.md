# @soujvnunes/themizer

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
