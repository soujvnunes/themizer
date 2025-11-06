---
"themizer": minor
---

Add watch mode for automatic theme.css regeneration, improve security with input validation, add comprehensive JSDoc documentation, and fix multiple production-readiness issues.

**New Features:**
- Add `--watch` flag to `theme` command for automatic CSS regeneration on config changes
- Export framework detection types (`Framework`, `FrameworkDetectionResult`) for advanced integrations

**Security Improvements:**
- Secure all JSON.parse() operations with try-catch blocks and structure validation
- Add path validation to interactive prompts to prevent directory traversal attacks
- Improve type safety in framework detection with proper type checking

**Documentation:**
- Add comprehensive JSDoc comments to all public API functions (`themizer`, `resolveAtom`, `unwrapAtom`, `isAtom`, `getCSS`)
- Include usage examples in JSDoc for better developer experience

**Bug Fixes:**
- Fix temp file extension typo (`.text` → `.tmp`)
- Remove unused `MEDIA_QUERY_FEATURE_REGEX` constant
- Fix hardcoded version by implementing build-time injection from package.json
- Update TSConfig to remove outdated `src/cli/index.ts` reference
- Fix ESLint configuration to include root-level TypeScript files

**Improvements:**
- Extract magic number to `MAX_CSS_IDENTIFIER_LENGTH` constant for better maintainability
- Optimize regex usage in `resolveAtom` using `matchAll()` instead of `exec()` loop
- Enhance CLI error formatting with user-friendly messages and debug mode support
- Update ESLint rules to allow console.log in CLI files
- Update all dependencies to latest versions
