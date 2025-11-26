---
"themizer": patch
---

Fix: skip @property generation for values containing var() references. CSS @property initial-value must be computationally independent and cannot contain var(), env(), or attr() references. Properties with such values now correctly omit @property rules.
