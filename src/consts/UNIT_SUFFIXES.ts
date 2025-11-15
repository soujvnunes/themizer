/**
 * Mapping of unit names to their CSS suffixes
 * Used for generating CSS values from unit configurations
 */
export default Object.freeze({
  rem: 'rem',
  em: 'em',
  px: 'px',
  percentage: '%',
  vh: 'vh',
  vw: 'vw',
  vmin: 'vmin',
  vmax: 'vmax',
  ch: 'ch',
  ex: 'ex',
} as const)
