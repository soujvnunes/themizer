---
"themizer": minor
---

Add dev-friendly error handling: in development mode, errors are logged to console instead of thrown, allowing dev servers to keep running and hot reload to work when users fix config errors. In production, errors are still thrown to fail builds with broken configs.
