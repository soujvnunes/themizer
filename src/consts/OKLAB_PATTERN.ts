/**
 * Matches any OKLab color space format (oklch or oklab)
 * Examples: oklch(76.9% 0.188 70.08), oklab(0.5 0.1 -0.1)
 */
export default /^okl(ch|ab)\s*\([^)]+\)$/
