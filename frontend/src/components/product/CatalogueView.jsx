import { useRef, useState } from 'react'
import cn from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Breadcrumbs } from '@/components/ui/SectionHeading'
import { SegmentedControl } from '@/components/ui/Form'
import { Pagination, PaginationBar } from '@/components/ui/Pagination'
import { EmptyState, Skeleton } from '@/components/ui/Feedback'
import { Drawer } from '@/components/ui/Modal'
import { ProductGrid } from '@/components/product/ProductCard'
import { FilterSidebar, SortSelect } from '@/components/product/FilterSidebar'
import { useShopActions } from '@/components/home/Showcase'
import { useCatalogueUnavailable } from '@/store/catalogueStore'

/** Active filter chips with individual remove buttons. */
export function ActiveChips({ chips, onRemove, onClear }) {
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.label}`}
          type="button"
          onClick={() => onRemove(chip)}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-3 py-1.5 text-label-sm font-bold uppercase text-ink-variant transition hover:border-tier-original hover:text-tier-original"
        >
          {chip.label}
          <Icon name="close" className="h-3 w-3" strokeWidth={2.5} />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-label-sm font-bold uppercase text-brand-goldDark underline-offset-4 transition hover:underline"
      >
        Clear all
      </button>
    </div>
  )
}

/** Skeleton grid shown while a catalogue read is in flight. */
export function CatalogueSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card-surface overflow-hidden">
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * The shared catalogue surface.
 *
 * Shop, the Originals and Inspired collection pages, and search results all
 * render through this so filters, sorting and pagination behave identically.
 */
export function CatalogueView({
  catalogue,
  breadcrumbs = [],
  eyebrow,
  title,
  subtitle,
  hero,
  loading = false,
  emptyTitle = 'No fragrances match these filters',
  emptyDescription = 'Try loosening a filter or clearing the refinement panel to see the full collection.',
  onClearFiltersOverride,
  layout = 'sidebar',
  lockTier = false,
}) {
  const [variant, setVariant] = useState('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false)
  const { onAdd, onToggleWishlist, isWishlisted } = useShopActions()
  // "The server never answered" must read differently from "nothing matches":
  // clearing filters cannot fix an unreachable shop.
  const unavailable = useCatalogueUnavailable()

  const {
    products,
    total,
    page,
    totalPages,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    filters,
    setFilters,
    clearFilters,
    activeChips,
    removeChip,
    facets,
    counts,
    priceBounds,
  } = catalogue

  const resultsRef = useRef(null)

  const handleClear = onClearFiltersOverride ?? clearFilters

  const renderSidebar = (onClose) => (
    <FilterSidebar
      filters={filters}
      onChange={setFilters}
      counts={counts}
      families={facets.family}
      brands={facets.brand}
      priceBounds={priceBounds}
      onClear={handleClear}
      onClose={onClose}
      lockTier={lockTier}
    />
  )

  return (
    <div className="bridal-canvas relative flex flex-1 flex-col overflow-x-clip">
      {/* Soft ambient bridal warmth along the side flanks so side margins are never blank */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-20 h-[38rem] w-80 rounded-full bg-gradient-to-r from-[#FAD9E2]/35 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-32 h-[38rem] w-80 rounded-full bg-gradient-to-l from-[#F5E1B8]/35 to-transparent blur-3xl"
      />
      <div className="shell relative z-10 flex flex-1 flex-col pb-0 pt-6 lg:pt-8">
      {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="mb-4" />}

      {hero}

      {!hero && (title || eyebrow) && (
        <header className="mb-6 max-w-3xl">
          {eyebrow && <p className="text-label-md font-bold uppercase tracking-[0.18em] text-brand-goldDark">{eyebrow}</p>}
          {title && (
            <h1 className="mt-2 font-serif text-3xl font-medium text-brand-charcoal lg:text-headline-xl">{title}</h1>
          )}
          {subtitle && <p className="mt-2 text-body-md leading-relaxed text-brand-muted">{subtitle}</p>}
        </header>
      )}

      <div className={cn('flex flex-1 flex-col gap-10', layout === 'sidebar' && desktopFiltersOpen && 'lg:grid lg:grid-cols-[16rem_1fr]')}>
        {layout === 'sidebar' && desktopFiltersOpen && (
          <div className="hidden pb-10 lg:block">{renderSidebar(() => setDesktopFiltersOpen(false))}</div>
        )}

        <div className="flex flex-1 min-w-0 flex-col">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE5D5] pb-4">
            <div className="flex items-center gap-3">
              {layout === 'sidebar' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-border px-3.5 py-2 text-label-sm font-bold uppercase text-ink-variant transition hover:border-brand-charcoal hover:text-brand-charcoal lg:hidden"
                  >
                    <Icon name="sliders" className="h-3.5 w-3.5" />
                    Filters
                    {activeChips.length > 0 && (
                      <span className="rounded-full bg-brand-charcoal px-1.5 text-[9px] text-white">
                        {activeChips.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesktopFiltersOpen((open) => !open)}
                    aria-expanded={desktopFiltersOpen}
                    className="hidden items-center gap-2 rounded-full border border-brand-border bg-white px-3.5 py-2 text-label-sm font-semibold uppercase text-brand-charcoal transition hover:border-brand-charcoal lg:inline-flex"
                  >
                    <Icon name={desktopFiltersOpen ? 'close' : 'sliders'} className="h-3.5 w-3.5" />
                    {desktopFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                    {activeChips.length > 0 && (
                      <span className="rounded-full bg-brand-charcoal px-1.5 py-0.5 text-[9px] text-white">
                        {activeChips.length}
                      </span>
                    )}
                  </button>
                </>
              )}
              <p className="text-body-sm text-brand-muted">
                <span className="font-semibold text-brand-charcoal">{total}</span>{' '}
                {total === 1 ? 'fragrance' : 'fragrances'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SortSelect value={sort} onChange={setSort} />
              <SegmentedControl
                value={variant}
                onChange={setVariant}
                size="sm"
                options={[
                  { value: 'grid', icon: 'grid', title: 'Grid view' },
                  { value: 'list', icon: 'list', title: 'List view' },
                ]}
              />
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="border-b border-brand-border py-4">
              <ActiveChips chips={activeChips} onRemove={removeChip} onClear={handleClear} />
            </div>
          )}

          {/* Results */}
          <div className="flex flex-1 flex-col pt-6" ref={resultsRef}>
            {loading ? (
              <div className="flex-1 pb-10">
                <CatalogueSkeleton count={pageSize > 12 ? 12 : pageSize} />
              </div>
            ) : products.length === 0 ? (
              <>
                <div className="flex-1 pb-10">
                  <EmptyState
                    icon="search"
                    title={unavailable ? 'The shop could not be reached' : emptyTitle}
                    description={
                      unavailable
                        ? 'No catalogue is loaded because the server did not answer — nothing here is invented. Check your connection and reload to see what is listed.'
                        : emptyDescription
                    }
                    actionLabel={unavailable ? undefined : 'Clear Filters'}
                    onAction={unavailable ? undefined : handleClear}
                  />
                </div>
                <div className="mt-auto space-y-3 border-t border-[#EFE5D5] pt-5 pb-2.5">
                  <PaginationBar
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 pb-8">
                  <ProductGrid
                    products={products}
                    variant={variant}
                    columns={6}
                    onAdd={onAdd}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={isWishlisted}
                  />
                </div>

                <div className="mt-auto space-y-3 border-t border-[#EFE5D5] pt-5 pb-2.5">
                  <PaginationBar
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageSizeChange={setPageSize}
                  />
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        side="left"
        title="Refine"
        width="max-w-[21rem]"
      >
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="text-label-md font-bold uppercase tracking-widest text-brand-charcoal">Refine</h2>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition hover:bg-neutral-100"
          >
            <Icon name="close" className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{renderSidebar()}</div>
        <div className="border-t border-brand-border px-5 py-4">
          <Button variant="primary" className="w-full" onClick={() => setMobileFiltersOpen(false)}>
            Show {total} {total === 1 ? 'Result' : 'Results'}
          </Button>
        </div>
      </Drawer>
      </div>
    </div>
  )
}

export default CatalogueView
