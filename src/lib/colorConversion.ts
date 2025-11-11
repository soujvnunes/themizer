/**
 * Color conversion utilities for OKLCH <-> RGB transformations
 */

export interface OklchColor {
  l: number // Lightness: 0-100 (percentage)
  c: number // Chroma: 0-0.4 typical range
  h: number // Hue: 0-360 degrees
}

export interface RgbColor {
  r: number // Red: 0-255
  g: number // Green: 0-255
  b: number // Blue: 0-255
}

/**
 * Parse an oklch color string
 * Examples: 'oklch(76.9% 0.188 70.08)' or 'oklch(0.769 0.188 70.08)'
 */
export function parseOklch(color: string): OklchColor {
  const match = color.match(/oklch\((-?[\d.]+)%?\s+(-?[\d.]+)\s+(-?[\d.]+)\)/)
  if (!match) {
    throw new Error(`Invalid oklch color format: ${color}`)
  }

  const l = parseFloat(match[1])
  const c = parseFloat(match[2])
  const h = parseFloat(match[3])

  return {
    l: l > 1 ? l : l * 100, // Convert to percentage if in 0-1 range
    c,
    h,
  }
}

/**
 * Format an oklch color object as a string
 */
export function formatOklch(l: number, c: number, h: number): string {
  // Format lightness: preserve precision for non-whole numbers
  let lStr: string
  if (l % 1 === 0) {
    lStr = l.toString()
  } else {
    // Use up to 2 decimals but remove trailing zeros
    lStr = l.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
    // Ensure at least 1 decimal place for non-whole numbers
    if (!lStr.includes('.')) {
      lStr = l.toFixed(1)
    }
  }

  // Format chroma: preserve precision, especially for small values
  let cStr: string
  if (c === 0) {
    cStr = '0'
  } else if (c < 0.1) {
    // For small chroma values, preserve more precision
    cStr = c.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
    // Ensure at least 2 significant digits after decimal
    const parts = cStr.split('.')
    if (parts[1] && parts[1].length < 2) {
      cStr = c.toFixed(Math.max(2, 4 - parts[0].length))
    }
  } else {
    // For larger chroma values, use 3 decimals
    cStr = c.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
    // Ensure at least 2 decimals
    if (cStr.split('.')[1]?.length === 1) {
      cStr += '0'
    }
  }

  // Format hue: no decimals if whole number, otherwise as many as needed
  let hStr: string
  if (Math.abs(h - Math.round(h)) < 0.001) {
    hStr = Math.round(h).toString()
  } else {
    // Use up to 3 decimals but remove trailing zeros
    hStr = h.toFixed(3).replace(/\.?0+$/, '')
  }

  return `oklch(${lStr}% ${cStr} ${hStr})`
}

/**
 * Convert OKLCH to RGB (0-255)
 */
export function oklchToRgb(l: number, c: number, h: number): RgbColor {
  // Step 1: OKLCH to OKLAB (polar to cartesian)
  const L = l / 100 // Convert percentage to 0-1 range
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const bOklab = c * Math.sin(hRad)

  // Step 2: OKLAB to Linear RGB (using OKLab matrix)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * bOklab
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bOklab
  const s_ = L - 0.0894841775 * a - 1.291485548 * bOklab

  const l3 = l_ * l_ * l_
  const m3 = m_ * m_ * m_
  const s3 = s_ * s_ * s_

  const lr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3

  // Step 3: Linear RGB to sRGB (gamma correction)
  const toSrgb = (val: number): number => {
    if (val <= 0.0031308) {
      return 12.92 * val
    }
    return 1.055 * Math.pow(val, 1 / 2.4) - 0.055
  }

  const r = toSrgb(lr)
  const g = toSrgb(lg)
  const bRgb = toSrgb(lb)

  // Step 4: Convert to 0-255 range and clamp
  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(bRgb * 255))),
  }
}

/**
 * Convert RGB (0-255) to OKLCH
 */
export function rgbToOklch(r: number, g: number, b: number): OklchColor {
  // Step 1: sRGB to Linear RGB (inverse gamma correction)
  const toLinear = (val: number): number => {
    const v = val / 255
    if (v <= 0.04045) {
      return v / 12.92
    }
    return Math.pow((v + 0.055) / 1.055, 2.4)
  }

  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)

  // Step 2: Linear RGB to OKLAB (using inverse OKLab matrix)
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bOklab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  // Step 3: OKLAB to OKLCH (cartesian to polar)
  const c = Math.sqrt(a * a + bOklab * bOklab)
  let h = (Math.atan2(bOklab, a) * 180) / Math.PI
  if (h < 0) h += 360

  return {
    l: L * 100, // Convert to percentage
    c,
    h,
  }
}
