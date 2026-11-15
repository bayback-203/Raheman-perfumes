/**
 * Provenance tiers. REHMAN sells provenance-tagged fragrances and the tier drives
 * the badge colour, the price-per-ml logic and the copy across the storefront.
 */
export const TIERS = {
  Original: {
    id: 'Original',
    label: 'Original',
    tagline: '100% Authentic',
    description:
      'Genuine branded perfumes bought directly from official French and Italian suppliers.',
    text: 'text-tier-original',
    surface: 'bg-tier-originalSurface',
    border: 'border-tier-original/25',
    solid: 'bg-tier-original text-white',
  },
  Inspired: {
    id: 'Inspired',
    label: 'Inspired',
    tagline: 'Inspired Blend',
    description:
      'Popular designer scents remade by us with pure French oils, at a lower price.',
    text: 'text-tier-inspired',
    surface: 'bg-tier-inspiredSurface',
    border: 'border-tier-inspired/25',
    solid: 'bg-tier-inspired text-white',
  },
  Mixed: {
    id: 'Mixed',
    label: 'Mixing',
    tagline: 'Layer & Mix',
    description:
      'Two or more scents blended together — layer them yourself or let our team make the mix.',
    text: 'text-tier-mixed',
    surface: 'bg-tier-mixedSurface',
    border: 'border-tier-mixed/25',
    solid: 'bg-tier-mixed text-white',
  },
  Attar: {
    id: 'Attar',
    label: 'Pure Attar',
    tagline: 'Alcohol-Free Oil',
    description:
      'Pure concentrated perfume oils, distilled rose, oud and musks crafted without alcohol.',
    text: 'text-amber-800',
    surface: 'bg-amber-50',
    border: 'border-amber-700/25',
    solid: 'bg-amber-800 text-white',
  },
  Combo: {
    id: 'Combo',
    label: 'Combo Sets',
    tagline: 'Curated 2-Pack Sets',
    description:
      'Specially paired perfume combos and gift box sets curated by our fragrance atelier.',
    text: 'text-emerald-800',
    surface: 'bg-emerald-50',
    border: 'border-emerald-700/25',
    solid: 'bg-emerald-800 text-white',
  },
}

/** Extra merchandising flags that sit beside the tier badge. */
export const FLAGS = {
  Bestseller: { label: 'Bestseller', className: 'bg-amber-600 text-white' },
  New: { label: 'New In', className: 'bg-brand-charcoal text-brand-gold' },
  Limited: { label: 'Limited', className: 'bg-brand-gold text-brand-charcoal' },
  'Back in Stock': { label: 'Back in Stock', className: 'bg-emerald-700 text-white' },
}

export const TIER_LIST = Object.values(TIERS)

export function getTier(id) {
  return TIERS[id] ?? TIERS.Original
}
