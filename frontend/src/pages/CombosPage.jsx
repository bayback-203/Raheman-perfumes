import { ShopBanner } from '@/components/product/ShopBanner'
import { CatalogueView } from '@/components/product/CatalogueView'
import { useCatalogue } from '@/hooks/useCatalogue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCombos, useCatalogueLoading } from '@/store/catalogueStore'

/**
 * Curated Combos & Gift Sets page (`/combos`).
 */
export function CombosPage() {
  const dedicatedCombos = useCombos()
  const loading = useCatalogueLoading()

  const catalogue = useCatalogue({
    baseProducts: dedicatedCombos,
    initialFilters: { tier: ['Combo'] },
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
        loading={loading}
        emptyImage="/states/state-combos-coming.png"
        emptyTitle="Curated Combo Sets Coming Soon"
        emptyDescription="Exclusive 2-perfume combo gift sets are being prepared by our perfumers."
        lockTier
      />
    </>
  )
}

export default CombosPage
