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
  Combo: {
    id: 'Combo',
    label: 'Combo',
    tagline: 'Pair & Save',
    description:
      'Perfume combinations and paired sets offering bundled savings when choosing two fragrances together.',
    text: 'text-tier-custom',
    surface: 'bg-tier-customSurface',
    border: 'border-tier-custom/25',
    solid: 'bg-tier-custom text-white',
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
