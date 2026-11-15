import { useMemo } from 'react'
import { ShopBanner } from '@/components/product/ShopBanner'
import { CatalogueView } from '@/components/product/CatalogueView'
import { useCatalogue } from '@/hooks/useCatalogue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCatalogueProducts } from '@/store/catalogueStore'

/**
 * Curated Combos & Gift Sets page (`/combos`).
 */
export function CombosPage() {
  const products = useCatalogueProducts()
  const hasDedicatedCombos = useMemo(
    () => products.some((p) => p.tier === 'Combo' || p.collections?.includes('combos')),
    [products],
  )

  const combos = useMemo(() => {
    const dedicated = products.filter((p) => p.tier === 'Combo' || p.collections?.includes('combos'))
    // Display dedicated combo sets if available; otherwise show all store fragrances
    return dedicated.length > 0 ? dedicated : products
  }, [products])

  const catalogue = useCatalogue({
    baseProducts: combos,
    initialFilters: hasDedicatedCombos ? { tier: ['Combo'] } : {},
    pageSize: 24,
  })

  useDocumentTitle('Perfume Combos & Gift Sets')

  return (
    <>
      <ShopBanner
        collection="combos"
        title="Perfume Combos & Gift Sets"
        eyebrow="Curated Sets & Pairings"
      />

      <CatalogueView
        catalogue={catalogue}
        emptyTitle="No combo sets added yet"
        emptyDescription="Add perfume combos and gift sets in the Admin Panel to display them here."
        lockTier={hasDedicatedCombos}
      />
    </>
  )
}

export default CombosPage
