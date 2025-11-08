---
"themizer": patch
---

Refactor architecture for better maintainability and add comprehensive improvements

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
