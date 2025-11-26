---
"themizer": patch
---

Add dev-friendly error handling: in development mode, validation errors are logged to console with fallbacks applied so dev servers keep running. In production, errors are thrown to fail the build. This enables hot reload recovery when users fix config errors.
