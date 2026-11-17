import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CatalogueView } from '@/components/product/CatalogueView'
import { ShopBanner } from '@/components/product/ShopBanner'
import { SignatureTile } from '@/components/home/Collections'
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

function ShopCatalogue({ title, subtitle, initialFilters, collection }) {
  // No `baseProducts`: the hook reads the live catalogue from the store, so a
  // fragrance created in the admin panel is in this grid.
  const catalogue = useCatalogue({ initialFilters, pageSize: 24 })

  const hero =
    collection === 'inspired' ? (
      <SignatureTile
        className="mb-10"
        eyebrow="Inspired Blends"
        title="Popular designer scents, remade with 30%+ oil."
        body="Our team recreates the scents you love using pure French oils — never diluted. Same feel, much lower price, and longer lasting on skin and clothes."
        to="/shop"
        cta="See All Perfumes"
        tier="Inspired"
        seed="inspired-hero"
      />
    ) : collection === 'originals' ? (
      <SignatureTile
        className="mb-10"
        eyebrow="Direct Sourcing"
        title="100% Genuine Branded Perfumes."
        body="We buy only from official suppliers, never third-party resellers. Every order is carefully checked and sealed with a Raheman Perfumes authenticity seal."
        to="/pages/about"
        cta="How We Source"
        tier="Original"
        seed="originals-hero"
      />
    ) : null

  return (
    <>
      <ShopBanner
        collection={collection}
        title={title}
        eyebrow={collection ? 'Selected Collection' : 'All Perfumes'}
      />

      <CatalogueView
        catalogue={catalogue}
        hero={hero}
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
        eyebrow="100% Authentic"
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
