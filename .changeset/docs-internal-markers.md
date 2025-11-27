---
"themizer": patch
---

refactor: hide rules and variableMap from public API via Symbol

- Internal properties (`rules`, `variableMap`) are now hidden behind a Symbol
- CLI accesses these via the Symbol for theme.css generation
- Public API only exposes `aliases`, `tokens`, and `medias`
- Removed `RJSS` type from public exports
