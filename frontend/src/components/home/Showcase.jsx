import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@/components/ui/AppLink'
import { formatPrice, discountPercent } from '@/lib/format'
import useCartStore from '@/store/cartStore'
import useWishlistStore from '@/store/wishlistStore'
import useUiStore, { toast } from '@/store/uiStore'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { TierBadge } from '@/components/ui/Badge'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProductCard } from '@/components/product/ProductCard'
import { FlaconStage } from '@/components/product/FlaconArt'
import { productImage } from '@/data/productImages'
import {
  useBestsellers,
  useCatalogueProducts,
  useShowcase,
  useShowcaseProducts,
} from '@/store/catalogueStore'
import { WHY_SHOP } from '@/data/content'

/** Tracks horizontal overflow and provides smooth step sliding for single-row shelves. */
function useRowSlider(itemCount) {
  const trackRef = useRef(null)
  const [state, setState] = useState({ canPrev: false, canNext: false })

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = Math.max(0, scrollWidth - clientWidth)
    setState({
      canPrev: scrollLeft > 4,
      canNext: maxScroll > 4 && scrollLeft < maxScroll - 4,
    })
  }, [])

  useEffect(() => {
    sync()
    const el = trackRef.current
    if (!el) return undefined
    el.addEventListener('scroll', sync, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null
    ro?.observe(el)
    window.addEventListener('resize', sync, { passive: true })
    return () => {
      el.removeEventListener('scroll', sync)
      ro?.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [sync, itemCount])

  const slide = useCallback((direction) => {
    const el = trackRef.current
    if (!el) return
    const step = Math.max(260, Math.round(el.clientWidth * 0.78))
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }, [])

  return { trackRef, ...state, slide }
}

/** Circular prev/next arrows paired with row sliders. */
function RowSlideControls({ canPrev, canNext, onSlide }) {
  const btnClass =
    'flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-brand-charcoal transition hover:border-brand-charcoal hover:bg-brand-charcoal hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-brand-border disabled:hover:bg-white disabled:hover:text-brand-charcoal'
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Slide row">
      <button type="button" onClick={() => onSlide(-1)} disabled={!canPrev} aria-label="Slide previous" className={btnClass}>
        <Icon name="chevron-left" className="h-4 w-4" strokeWidth={2} />
      </button>
      <button type="button" onClick={() => onSlide(1)} disabled={!canNext} aria-label="Slide next" className={btnClass}>
        <Icon name="chevron-right" className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  )
}

/** Shared add/wishlist wiring so every section behaves the same way. */
export function useShopActions() {
  const addItem = useCartStore((state) => state.addItem)
  const openCartDrawer = useUiStore((state) => state.openCartDrawer)
  const toggleWishlist = useWishlistStore((state) => state.toggle)
  const isWishlisted = useWishlistStore((state) => state.has)

  return {
    onAdd: (product) => {
      addItem(product)
      toast({ title: 'Added to bag', description: `${product.name} · ${product.volumes?.[0]?.size ?? ''}`.trim() })
      openCartDrawer()
    },
    onToggleWishlist: (product) => {
      const added = toggleWishlist(product)
      toast({
        title: added ? 'Saved to wishlist' : 'Removed from wishlist',
        description: product.name,
        tone: 'info',
      })
    },
    isWishlisted,
  }
}

/** Best sellers manually chosen by Admin, rendered as a slideable single row. */
export function BestSellers({ products }) {
  const { onAdd, onToggleWishlist, isWishlisted } = useShopActions()
  const showcase = useShowcase()
  const bestsellers = useBestsellers()
  const catalogue = useCatalogueProducts()

  const list = products ?? bestsellers
  const slider = useRowSlider(list.length)

  if (!products && !showcase.showBestsellers) return null

  return (
    <section className="bridal-canvas relative overflow-hidden py-16 lg:py-20">
      <div className="shell relative z-10">
      <SectionHeading
        title="The Bestsellers"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {list.length > 0 && (
              <RowSlideControls canPrev={slider.canPrev} canNext={slider.canNext} onSlide={slider.slide} />
            )}
            <Button variant="outline" size="sm" to="/shop">
              {/* Counted, not captioned: this read "Shop All 44" from the day the
                  bundle was written, and the shop's real size is now whatever the
                  admin has published. */}
              Shop All {catalogue.length}
              <Icon name="arrow-right" className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      {list.length === 0 ? (
        <div className="mt-9 rounded-xl border border-dashed border-brand-border bg-brand-cream/40 px-6 py-12 text-center">
          <p className="text-body-md font-medium text-brand-charcoal">No bestsellers added yet.</p>
          <Button variant="outline" size="sm" to="/shop" className="mt-4">
            Browse Shop
          </Button>
        </div>
      ) : (
        <div
          ref={slider.trackRef}
          className="no-scrollbar mt-9 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 pt-1 scroll-smooth"
        >
          {list.map((product) => (
            <div
              key={product.id}
              className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)] xl:w-[calc((100%-5rem)/5)]"
            >
              <ProductCard
                product={product}
                showTier
                onAdd={onAdd}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={isWishlisted(product.id)}
              />
            </div>
          ))}
        </div>
      )}
      </div>
    </section>
  )
}

/**
 * Home page discount showcase area ("Best Discounts Right Now"), manually
 * controlled by Admin -> Website Display (never auto-filled from MRP/price).
 */
export function DealsOfDay() {
  const showcase = useShowcase()
  const featuredDeals = useShowcaseProducts('homeDealProductIds')
  const { onAdd } = useShopActions()

  const deals = useMemo(
    () =>
      featuredDeals.map((product) => ({
        product,
        percent: product.mrp > product.price ? discountPercent(product.mrp, product.price) : 0,
      })),
    [featuredDeals],
  )
  const slider = useRowSlider(deals.length)

  if (!showcase.showHomeDeals) return null

  return (
    <section className="bridal-banner relative overflow-hidden border-y border-[#E9D9BF] py-16 text-brand-charcoal lg:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-[#FAD9E2]/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-6 h-72 w-72 rounded-full bg-[#F3DFB4]/35 blur-3xl"
      />
      <div className="shell relative z-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-medium text-brand-charcoal lg:text-headline-xl">
              Best Discounts Right Now
            </h2>
          </div>
          {deals.length > 0 && (
            <RowSlideControls canPrev={slider.canPrev} canNext={slider.canNext} onSlide={slider.slide} />
          )}
        </div>

        {deals.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-brand-border bg-neutral-50/70 px-6 py-10 text-center">
            <p className="text-body-md font-medium text-brand-charcoal">No in-stock discount offers available right now.</p>
            <Button variant="gold" size="sm" to="/offers" className="mt-4">
              View Offers Page
            </Button>
          </div>
        ) : (
          <div
            ref={slider.trackRef}
            className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth"
          >
            {deals.map(({ product, percent }) => {
              const soldOut = product.inStock === false || product.stockLeft === 0
              return (
                <article
                  key={product.id}
                  className="card-lift group flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-[#ECE0CC] bg-gradient-to-b from-white via-[#FFFDF9] to-[#FDF6EB]/90 p-5 shadow-card transition duration-300 hover:border-brand-gold sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
                >
                  <Link to={`/product/${product.slug}`} className="flex items-center gap-4">
                    <span className="w-16 shrink-0">
                      <FlaconStage
                        tier={product.tier}
                        seed={product.slug}
                        label={product.name}
                        image={productImage(product)}
                        compact
                      />
                    </span>
                    <span className="min-w-0">
                      <TierBadge tier={product.tier} size="sm" />
                      <span className="mt-1.5 block truncate font-serif text-lg font-semibold text-brand-charcoal">
                        {product.name}
                      </span>
                      <span className="mt-0.5 block truncate text-body-sm text-brand-muted">{product.brand}</span>
                    </span>
                  </Link>

                  <div className="mt-auto pt-5">
                    <div className="flex items-baseline gap-2.5">
                      {product.mrp > product.price && (
                        <span className="text-[15px] font-medium text-[#C81E1E] line-through">{formatPrice(product.mrp)}</span>
                      )}
                      <span className="text-xl font-bold text-brand-charcoal">{formatPrice(product.price)}</span>
                    </div>
                    <p className="mt-1 text-label-sm font-bold uppercase text-emerald-700">
                      {percent > 0 ? `Up to ${percent}% off · Special Offer` : 'Special Offer'}
                    </p>

                    <Button
                      variant={soldOut ? 'outline' : 'gold'}
                      size="sm"
                      disabled={soldOut}
                      className="mt-4 w-full shadow-sm"
                      onClick={() => !soldOut && onAdd(product)}
                    >
                      <Icon name="bag" className="h-3.5 w-3.5" />
                      {soldOut ? 'Out of Stock' : 'Add To Bag'}
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

/** Six-reason trust grid. */
export function WhyShopWithUs() {
  return (
    <section className="border-y border-[#ECE0CC] bg-gradient-to-b from-white via-[#FDF5F6]/55 to-[#FFFDF9] py-16 lg:py-20">
      <div className="shell">
        <SectionHeading
          align="center"
          title="Why Customers Come Back"
        />

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_SHOP.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-[#ECE0CC] bg-gradient-to-b from-white via-[#FFFDF9] to-[#FDF6EB]/80 p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/70 hover:shadow-[0_14px_32px_-10px_rgba(200,155,60,0.22)]"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-brand-border bg-neutral-50 shadow-sm">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-body-md font-semibold text-brand-charcoal">{item.title}</h3>
                <p className="mt-1 text-body-sm leading-relaxed text-brand-muted">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default BestSellers
