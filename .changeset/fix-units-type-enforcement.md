---
"themizer": patch
---

Add runtime validation for units configuration and fix documentation

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