import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CatalogueView } from '@/components/product/CatalogueView'
import { ShopBanner } from '@/components/product/ShopBanner'
import { useCatalogue } from '@/hooks/useCatalogue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCatalogueProducts, useCategories } from '@/store/catalogueStore'
import { SHOP_NOTES } from '@/data/content'

/** Collection slug -> how to narrow the catalogue. */
const COLLECTION_RULES = {
  men: { filters: { gender: ['Men'] }, title: "Men's Perfumes" },
  women: { filters: { gender: ['Women'] }, title: "Women's Perfumes" },
  unisex: { filters: { gender: ['Unisex'] }, title: 'Unisex Signatures' },
  original: { filters: { tier: ['Original'] }, title: 'Original Branded Perfumes' },
  originals: { filters: { tier: ['Original'] }, title: 'Original Branded Perfumes' },
  inspired: { filters: { tier: ['Inspired', 'Mixed'] }, title: 'Inspired & Mixing Perfumes' },
  mixing: { filters: { tier: ['Mixed'] }, title: 'Mixing Perfumes' },
  mixed: { filters: { tier: ['Mixed'] }, title: 'Mixing Perfumes' },
  attar: { filters: { tier: ['Attar'] }, title: 'Pure Attars & Oils' },
  attars: { filters: { tier: ['Attar'] }, title: 'Pure Attars & Oils' },
  combo: { filters: { tier: ['Combo'] }, title: 'Combos & Gift Sets' },
  combos: { filters: { tier: ['Combo'] }, title: 'Combos & Gift Sets' },
  bakhoor: { filters: { tier: ['Bakhoor'] }, title: 'Bakhoor' },
  'best-sellers': { filters: {}, title: 'Bestsellers' },
  everyday: {
    filters: {},
    title: 'Everyday Perfumes',
    occasionKeywords: ['everyday', 'daily', 'fresh', 'citrus', 'floral', 'musk', 'clean', 'bergamot', 'aqua', 'vetiver'],
  },
  office: {
    filters: {},
    title: 'Office Perfumes',
    occasionKeywords: ['office', 'work', 'woody', 'vetiver', 'citrus', 'fresh', 'cedar', 'musk', 'aromatic', 'bergamot'],
  },
  party: {
    filters: {},
    title: 'Party Perfumes',
    occasionKeywords: ['party', 'night', 'club', 'oriental', 'oud', 'spicy', 'amber', 'gourmand', 'sweet', 'vanilla', 'leather', 'tobacco'],
  },
  sports: {
    filters: {},
    title: 'Sports Perfumes',
    occasionKeywords: ['sport', 'sports', 'gym', 'fresh', 'citrus', 'aqua', 'aquatic', 'marine', 'ice', 'mint', 'lemon', 'bergamot'],
  },
  'date-night': {
    filters: {},
    title: 'Date Night Perfumes',
    occasionKeywords: ['date', 'romantic', 'evening', 'oriental', 'oud', 'rose', 'vanilla', 'amber', 'gourmand', 'musk', 'floral', 'jasmine', 'saffron'],
  },
  college: {
    filters: {},
    title: 'College Perfumes',
    occasionKeywords: ['college', 'casual', 'youth', 'fresh', 'citrus', 'fruity', 'sweet', 'gourmand', 'floral', 'ice', 'aqua'],
  },
}

/** Match live catalogue items suited to an occasion (by collection tag, family, notes, or copy). */
function filterByOccasion(products, slug, keywords) {
  if (!keywords?.length) return products
  const matched = products.filter((p) => {
    if (Array.isArray(p.collections) && p.collections.some((c) => String(c).toLowerCase() === slug)) {
      return true
    }
    const haystack = [
      p.family,
      p.tagline,
      p.description,
      p.name,
      ...(p.notes?.top ?? []),
      ...(p.notes?.heart ?? []),
      ...(p.notes?.base ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return keywords.some((kw) => haystack.includes(kw))
  })
  return matched.length > 0 ? matched : products
}

/**
 * The catalogue.
 *
 * `/shop` shows everything, `/shop/:collection` narrows to one of the curated
 * collections, and `?brand=` / `?family=` deep links pre-apply a facet.
 */
export function ShopPage() {
  const { collection } = useParams()
  const [searchParams] = useSearchParams()

  const rule = collection ? COLLECTION_RULES[collection] : null
  // Collection copy comes from the live taxonomy, so an admin-created category
  // gets its proper title and blurb without a code change.
  const categories = useCategories()
  const category = collection ? categories.find((entry) => entry.slug === collection) : null

  const brandParam = searchParams.get('brand')
  const familyParam = searchParams.get('family')
  const noteParam = searchParams.get('note')
  const activeNote = noteParam ? SHOP_NOTES.find((n) => n.id === noteParam.toLowerCase()) : null

  const initialFilters = useMemo(() => {
    const base = { ...(rule?.filters ?? {}) }
    if (brandParam) base.brand = [brandParam]
    if (familyParam) base.family = [familyParam]
    return base
    // Recompute only when the route or the deep-link params actually change.
  }, [rule, brandParam, familyParam])

  const title = activeNote
    ? `${activeNote.label} Perfumes`
    : (rule?.title ?? (category ? category.label : 'All Fragrances'))
  useDocumentTitle(title)

  // Deep-link params stay in the URL so filter links remain shareable; the
  // `key` below remounts the catalogue with fresh filters whenever they change.
  return (
    <ShopCatalogue
      key={`${collection ?? 'all'}-${brandParam ?? ''}-${familyParam ?? ''}-${noteParam ?? ''}`}
      title={title}
      subtitle={category?.blurb ?? rule?.subtitle}
      initialFilters={initialFilters}
      collection={collection}
      occasionKeywords={activeNote?.keywords ?? rule?.occasionKeywords}
      bannerOverride={activeNote?.image}
    />
  )
}

function ShopCatalogue({ title, initialFilters, collection, occasionKeywords, bannerOverride }) {
  const allProducts = useCatalogueProducts()
  const occasionProducts = useMemo(
    () => (occasionKeywords ? filterByOccasion(allProducts, collection ?? '', occasionKeywords) : null),
    [allProducts, collection, occasionKeywords],
  )
  // No `baseProducts` for normal pages so the hook reads the live catalogue
  // directly; occasion & note routes narrow cleanly to fragrances matching the mood.
  const catalogue = useCatalogue({
    baseProducts: occasionProducts,
    initialFilters,
    pageSize: 24,
  })

  return (
    <>
      <ShopBanner
        collection={collection}
        title={title}
        imageOverride={bannerOverride}
      />

      <CatalogueView
        catalogue={catalogue}
        emptyTitle="Nothing in this collection matches those filters"
        lockTier={!!initialFilters.tier}
      />
    </>
  )
}

/** Dedicated Originals page (route `/shop/originals` renders ShopPage). */
export function OriginalPerfumesPage() {
  const products = useCatalogueProducts()
  const originals = useMemo(() => products.filter((product) => product.tier === 'Original'), [products])

  const catalogue = useCatalogue({
    baseProducts: originals,
    initialFilters: { tier: ['Original'] },
    pageSize: 24,
  })

  useDocumentTitle('Original Branded Perfumes')

  return (
    <>
      <ShopBanner
        title="Original Branded Perfumes"
      />

      <CatalogueView
        catalogue={catalogue}
        lockTier
      />
    </>
  )
}

/** Dedicated Inspired & Mixing page. */
export function InspiredMixingPage() {
  const products = useCatalogueProducts()
  const inspired = useMemo(
    () => products.filter((product) => product.tier === 'Inspired' || product.tier === 'Mixed'),
    [products],
  )

  const catalogue = useCatalogue({ baseProducts: inspired, pageSize: 24 })

  useDocumentTitle('Inspired & Mixing Perfumes')

  return (
    <>
      <ShopBanner
        title="Inspired Blends & Mixing Perfumes"
      />

      <CatalogueView
        catalogue={catalogue}
        lockTier
      />
    </>
  )
}

export default ShopPage
