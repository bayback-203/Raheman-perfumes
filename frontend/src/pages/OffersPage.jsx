import { useEffect, useMemo, useState } from 'react'
import { Link } from '@/components/ui/AppLink'
import cn from '@/lib/cn'
import { formatPrice } from '@/lib/format'
import useCartStore from '@/store/cartStore'
import { toast } from '@/store/uiStore'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Badge'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { Tabs } from '@/components/ui/Tabs'
import { ProductCard } from '@/components/product/ProductCard'
import { useShopActions } from '@/components/home/Showcase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { productService } from '@/services/productService'
import {
  OFFER_HERO,
  OFFER_TABS,
  VOLUME_TIERS,
  OFFER_TERMS,
  couponApplies,
  formatCouponTitle,
  formatCouponBadge,
} from '@/data/offers'
import {
  useCatalogueStore,
  useCatalogueUnavailable,
  useShowcase,
  useShowcaseProducts,
} from '@/store/catalogueStore'

/** A copy-to-clipboard coupon card. */
function CouponCard({ coupon, subtotal }) {
  const applyCoupon = useCartStore((state) => state.applyCoupon)
  const [copied, setCopied] = useState(false)
  const eligible = couponApplies(coupon, subtotal)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard access can be blocked; the code is visible either way.
    }
    applyCoupon(coupon)
    toast({ title: `${coupon.code} applied`, description: coupon.description })
  }

  return (
    <article className="card-surface flex flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-dashed border-brand-border bg-white p-5">
        <div>
          <p className="font-serif text-2xl font-semibold text-brand-charcoal">{formatCouponTitle(coupon)}</p>
          <p className="mt-1 text-label-sm font-bold uppercase text-brand-goldDark">
            {coupon.headline && !/up\s*to/i.test(coupon.headline)
              ? `${coupon.headline} · ${formatCouponBadge(coupon)}`
              : coupon.headline || formatCouponBadge(coupon)}
          </p>
        </div>
        <Icon name="ticket" className="h-6 w-6 shrink-0 text-brand-goldDark" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-body-sm leading-relaxed text-brand-muted">{coupon.description}</p>

        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 rounded border border-dashed border-brand-gold bg-white px-3 py-2 text-center font-mono text-body-sm font-bold tracking-wider text-brand-goldDark">
            {coupon.code}
          </code>
          <Button variant={copied ? 'primary' : 'outline'} size="sm" onClick={copy}>
            <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />
            {copied ? 'Copied' : 'Apply'}
          </Button>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-body-sm text-brand-muted">
          <Icon name={eligible ? 'check-circle' : 'info'} className="h-3.5 w-3.5" />
          {eligible ? 'Your bag qualifies' : `Minimum order ${formatPrice(coupon.minOrder)}`}
        </p>
        <p className="mt-1 text-body-sm text-brand-muted/80">{coupon.terms}</p>
      </div>
    </article>
  )
}

/** A vault/deal product card driven from the catalogue. */
function OfferProductCard({ product }) {
  const { onAdd, onToggleWishlist, isWishlisted } = useShopActions()
  if (!product) return null

  return (
    <ProductCard
      product={product}
      showTier
      onAdd={onAdd}
      onToggleWishlist={onToggleWishlist}
      isWishlisted={isWishlisted(product.id)}
    />
  )
}

export function OffersPage() {
  useDocumentTitle('Offers & Special Deals')

  const [tab, setTab] = useState('all')
  const subtotal = useCartStore((state) => state.subtotal())
  const showcase = useShowcase()
  const offerProducts = useShowcaseProducts('offerProductIds')
  const refreshShowcase = useCatalogueStore((state) => state.refreshShowcase)
  const unavailable = useCatalogueUnavailable()

  // The coupon board and showcase products come strictly from the server.
  const [coupons, setCoupons] = useState([])
  useEffect(() => {
    let alive = true
    refreshShowcase()
    productService
      .coupons()
      .then((rows) => {
        if (alive) setCoupons(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (alive) setCoupons([])
      })
    return () => {
      alive = false
    }
  }, [refreshShowcase])

  const filteredVault = useMemo(() => {
    if (tab === 'all') return offerProducts
    return offerProducts.filter((product) => {
      if (tab === 'originals') return product.tier === 'Original' || product.collections?.includes('originals')
      if (tab === 'inspired') return product.tier === 'Inspired' || product.collections?.includes('inspired')
      if (tab === 'mixing') return product.tier === 'Mixed' || product.collections?.includes('mixing')
      if (tab === 'attars') {
        return (
          product.tier === 'Attar' ||
          /attar/i.test(product.category ?? '') ||
          product.collections?.includes('attars')
        )
      }
      if (tab === 'combos') {
        return product.tier === 'Combo' || product.collections?.includes('combos')
      }
      if (tab === 'bakhoor') {
        return product.tier === 'Bakhoor' || product.collections?.includes('bakhoor')
      }
      return false
    })
  }, [offerProducts, tab])

  return (
    <div className="pb-16">
      {/* Hero */}
      <section
        className="relative flex min-h-screen min-h-[100dvh] flex-col justify-center overflow-hidden border-b border-brand-border bg-white bg-cover bg-center bg-no-repeat text-brand-charcoal"
        style={{ backgroundImage: "url('/offer-white.jpg?v=2')" }}
      >
        {/* Soft directional scrim behind typography only — never washes out the perfume visual */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/90 via-white/35 to-transparent sm:bg-gradient-to-r sm:from-white/90 sm:via-white/45 sm:to-transparent"
          aria-hidden="true"
        />
        <div className="shell relative z-10 py-16 pt-24 sm:pt-28 lg:py-24 lg:pt-36">
          <div className="max-w-2xl">
            <Chip tone="dark" className="bg-white/95 shadow-sm">
              <Icon name="tag" className="h-3.5 w-3.5 text-brand-goldDark" />
              {OFFER_HERO.badge}
            </Chip>
            <h1 className="mt-6 font-serif text-[32px] font-medium leading-[1.15] text-brand-charcoal sm:text-[42px]">
              {OFFER_HERO.title}
            </h1>

            <div className="mt-8 flex flex-wrap gap-3">
              {showcase.showOffersProducts && (
                <Button variant="primary" size="lg" href="#vault">
                  {OFFER_HERO.cta.label}
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Button>
              )}
              {showcase.showCouponsSection && (
                <Button variant="outline" size="lg" href="#coupons" className="bg-white/80">
                  View Coupon Codes
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Offers Products (strictly manually curated in Admin -> Website Display) */}
      {showcase.showOffersProducts && (
        <section id="vault" className="shell py-16 lg:py-20">
          <SectionHeading title="Special Offer Deals" />

          <Tabs className="mt-8" value={tab} onChange={setTab} tabs={OFFER_TABS} />

          <div className="pt-8">
            {filteredVault.length === 0 ? (
              <p className="py-12 text-center text-body-md text-brand-muted">
                {unavailable
                  ? 'The store could not be reached, so there is nothing to list here right now.'
                  : offerProducts.length === 0
                    ? 'No special offer perfumes are listed right now —'
                    : 'No special deals in this category right now. Try another tab, or'}
                {!unavailable && (
                  <>
                    {' '}
                    <Link to="/shop" className="link-underline text-brand-goldDark">
                      browse the full collection
                    </Link>
                    .
                  </>
                )}
              </p>
            ) : (
              <div className="grid grid-cols-2 items-stretch gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredVault.map((product) => (
                  <OfferProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Coupons */}
      {showcase.showCouponsSection && (
        <section id="coupons" className="border-y border-brand-border bg-white py-16 lg:py-20">
          <div className="shell">
            <SectionHeading title="Apply A Coupon Code" />

            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.length === 0 ? (
                <p className="py-8 text-center text-body-md text-brand-muted sm:col-span-2 lg:col-span-3">
                  {unavailable
                    ? 'The store could not be reached, so no codes can be shown.'
                    : 'No coupon codes are active right now — check back soon.'}
                </p>
              ) : (
                coupons.map((coupon) => (
                  <CouponCard key={coupon.code} coupon={coupon} subtotal={subtotal} />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Volume ladder */}
      {showcase.showMultiBottleOffers && (
        <section className="border-y border-brand-border bg-white py-16 lg:py-20">
          <div className="shell">
            <SectionHeading align="center" title="Multi-Bottle Savings" />

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {VOLUME_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={cn(
                    'rounded border p-6 text-center',
                    tier.recommended ? 'border-brand-gold bg-white ring-1 ring-brand-gold shadow-card' : 'border-brand-border bg-white',
                  )}
                >
                  <p className="mt-1 font-serif text-3xl font-semibold text-brand-charcoal">{tier.title}</p>
                  <p className="mt-3 text-body-sm leading-relaxed text-brand-muted">{tier.description}</p>
                  <p className="mt-5 flex items-center justify-center gap-2 text-label-sm font-bold uppercase text-ink-variant">
                    <Icon name="package" className="h-3.5 w-3.5" />
                    Buy {tier.threshold}+ bottles
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Terms */}
      <section className="shell py-16 lg:py-20">
        <SectionHeading title="Offer Terms" />
        <div className="mt-6 max-w-3xl">
          <Accordion items={OFFER_TERMS} allowMultiple />
        </div>
      </section>
    </div>
  )
}

export default OffersPage
