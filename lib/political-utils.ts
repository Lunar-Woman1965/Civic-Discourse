
/**
 * Political identifier utilities
 * Maps political identifiers to their display labels and color classes
 */

export const POLITICAL_IDENTIFIERS = {
  progressive: {
    label: 'Progressive',
    colorClass: 'bg-coffee-cream-200 text-coffee-cream-900',
    description: 'Coffee cream colored identifier',
  },
  'democratic-socialist': {
    label: 'Democratic Socialist',
    colorClass: 'bg-mocha-mist-200 text-mocha-mist-900',
    description: 'Mocha mist colored identifier',
  },
  independent: {
    label: 'Independent',
    colorClass: 'bg-muted-sage-200 text-muted-sage-900',
    description: 'Muted sage green colored identifier',
  },
  liberal: {
    label: 'Liberal',
    colorClass: 'bg-turquoise-100 text-turquoise-800',
    description: 'Turquoise colored identifier',
  },
  conservative: {
    label: 'Conservative',
    colorClass: 'bg-pale-copper-100 text-pale-copper-800',
    description: 'Pale copper colored identifier',
  },
  centrist: {
    label: 'Centrist',
    colorClass: 'bg-creamy-tan-200 text-earth-brown-800',
    description: 'Creamy tan colored identifier',
  },
  libertarian: {
    label: 'Libertarian',
    colorClass: 'bg-yellow-100 text-yellow-800',
    description: 'Yellow colored identifier',
  },
  other: {
    label: 'Other',
    colorClass: 'bg-earth-brown-100 text-earth-brown-800',
    description: 'Earth brown colored identifier',
  },
} as const

export type PoliticalIdentifier = keyof typeof POLITICAL_IDENTIFIERS

/**
 * Get the color class for a political identifier
 */
export function getPoliticalIdentifierColor(
  identifier: string | null | undefined
): string {
  if (!identifier) return POLITICAL_IDENTIFIERS.other.colorClass
  
  const key = identifier.toLowerCase().replace(/\s+/g, '-') as PoliticalIdentifier
  return POLITICAL_IDENTIFIERS[key]?.colorClass || POLITICAL_IDENTIFIERS.other.colorClass
}

/**
 * Get the display label for a political identifier
 */
export function getPoliticalIdentifierLabel(
  identifier: string | null | undefined
): string {
  if (!identifier) return 'Other'
  
  const key = identifier.toLowerCase().replace(/\s+/g, '-') as PoliticalIdentifier
  return POLITICAL_IDENTIFIERS[key]?.label || identifier
}

/**
 * Get all available political identifiers for selection
 */
export function getPoliticalIdentifierOptions() {
  return Object.entries(POLITICAL_IDENTIFIERS).map(([value, { label }]) => ({
    value,
    label,
  }))
}

// Aliases for compatibility
export const POLITICAL_LEANINGS = Object.entries(POLITICAL_IDENTIFIERS).map(([value, { label }]) => ({
  value,
  label,
}))

export const getPoliticalLeaningLabel = getPoliticalIdentifierLabel

// Color mapping for political leanings (for Badge components)
export const politicalLeaningColors: Record<string, { bg: string; text: string }> = {
  progressive: { bg: 'bg-coffee-cream-200', text: 'text-coffee-cream-900' },
  'democratic-socialist': { bg: 'bg-mocha-mist-200', text: 'text-mocha-mist-900' },
  independent: { bg: 'bg-muted-sage-200', text: 'text-muted-sage-900' },
  liberal: { bg: 'bg-turquoise-100', text: 'text-turquoise-800' },
  conservative: { bg: 'bg-pale-copper-100', text: 'text-pale-copper-800' },
  centrist: { bg: 'bg-creamy-tan-200', text: 'text-earth-brown-800' },
  libertarian: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  other: { bg: 'bg-earth-brown-100', text: 'text-earth-brown-800' },
}
