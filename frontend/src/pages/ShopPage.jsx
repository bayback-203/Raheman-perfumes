import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CatalogueView } from '@/components/product/CatalogueView'
import { ShopBanner } from '@/components/product/ShopBanner'
import { useCatalogue } from '@/hooks/useCatalogue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCatalogueProducts, useCategories } from '@/store/catalogueStore'

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
  'best-sellers': { filters: {}, title: 'Bestsellers' },
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

  const initialFilters = useMemo(() => {
    const base = { ...(rule?.filters ?? {}) }
    if (brandParam) base.brand = [brandParam]
    if (familyParam) base.family = [familyParam]
    return base
    // Recompute only when the route or the deep-link params actually change.
  }, [rule, brandParam, familyParam])

  const title = rule?.title ?? (category ? category.label : 'All Fragrances')
  useDocumentTitle(title)

  // Deep-link params stay in the URL so filter links remain shareable; the
  // `key` below remounts the catalogue with fresh filters whenever they change.
  return (
    <ShopCatalogue
      key={`${collection ?? 'all'}-${brandParam ?? ''}-${familyParam ?? ''}`}
      title={title}
      subtitle={category?.blurb ?? rule?.subtitle}
      initialFilters={initialFilters}
      collection={collection}
    />
  )
}

function ShopCatalogue({ title, initialFilters, collection }) {
  // No `baseProducts`: the hook reads the live catalogue from the store, so a
  // fragrance created in the admin panel is in this grid.
  const catalogue = useCatalogue({ initialFilters, pageSize: 24 })

  return (
    <>
      <ShopBanner
        collection={collection}
        title={title}
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
