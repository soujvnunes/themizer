---
"themizer": patch
---

Improve error handling with consistent themizer prefix

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