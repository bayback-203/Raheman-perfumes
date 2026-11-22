import { ShopBanner } from '@/components/product/ShopBanner'
import { CatalogueView } from '@/components/product/CatalogueView'
import { useCatalogue } from '@/hooks/useCatalogue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCombos } from '@/store/catalogueStore'

/**
 * Curated Combos & Gift Sets page (`/combos`).
 * Admin can create 2-perfume combo packs in the Admin Panel under Type: Combo
 * or choose products directly in Website Display.
 */
export function CombosPage() {
  const dedicatedCombos = useCombos()

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
        emptyTitle="No combo sets added yet"
        emptyDescription="Admin can add 2-perfume combo packs in the Admin Panel or choose them in Website Display to display them here."
        lockTier
      />
    </>
  )
}

export default CombosPage
