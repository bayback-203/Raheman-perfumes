import { useMemo } from 'react'
import { ShopBanner } from '@/components/product/ShopBanner'
import { CatalogueView } from '@/components/product/CatalogueView'
import { useCatalogue } from '@/hooks/useCatalogue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCatalogueProducts } from '@/store/catalogueStore'

/**
 * Curated Combos & Gift Sets page (`/combos`).
 * Admin can create 2-perfume combo packs in the Admin Panel under Type: Combo.
 */
export function CombosPage() {
  const products = useCatalogueProducts()
  const dedicatedCombos = useMemo(
    () => products.filter((p) => p.tier === 'Combo' || p.collections?.includes('combos')),
    [products],
  )

  const hasDedicatedCombos = dedicatedCombos.length > 0
  const displayProducts = hasDedicatedCombos ? dedicatedCombos : products

  const catalogue = useCatalogue({
    baseProducts: displayProducts,
    initialFilters: hasDedicatedCombos ? { tier: ['Combo'] } : {},
    pageSize: 24,
  })

  useDocumentTitle('Perfume Combos & Gift Sets | Raheman Perfumes')

  return (
    <>
      <ShopBanner
        collection="combos"
        title="Perfume Combos & Gift Sets"
      />

      <CatalogueView
        catalogue={catalogue}
        emptyTitle="No combo sets added yet"
        emptyDescription="Admin can add 2-perfume combo packs in the Admin Panel to display them here."
        lockTier={hasDedicatedCombos}
      />
    </>
  )
}

export default CombosPage
