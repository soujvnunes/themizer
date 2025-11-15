/**
 * Matches OKLCH color format: oklch(lightness chroma hue)
 * Examples: oklch(76.9% 0.188 70.08), oklch(0.769 0.188 70.08)
 */
export default /^oklch\s*\([^)]+\)$/
