/**
 * Shared color pattern constants to avoid duplication
 */

/**
 * Matches OKLCH color format: oklch(lightness chroma hue)
 * Examples: oklch(76.9% 0.188 70.08), oklch(0.769 0.188 70.08)
 */
export const OKLCH_PATTERN = /^oklch\s*\([^)]+\)$/

/**
 * Matches any OKLab color space format (oklch or oklab)
 */
export const OKLAB_PATTERN = /^okl(ch|ab)\s*\([^)]+\)$/
