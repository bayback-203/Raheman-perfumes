import { useEffect } from 'react'
import { Link } from '@/components/ui/AppLink'
import cn from '@/lib/cn'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/format'
import useUiStore from '@/store/uiStore'
import useCartStore, { groupCartItems } from '@/store/cartStore'
import { useShowcase } from '@/store/catalogueStore'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Modal'
import { TierBadge } from '@/components/ui/Badge'
import { QuantityStepper, EmptyState } from '@/components/ui/Feedback'
import { FlaconStage } from '@/components/product/FlaconArt'
import { productImage } from '@/data/productImages'

/** Progress rail toward the free-shipping threshold. */
function ShippingProgress({ subtotal }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
  const unlocked = remaining === 0

  return (
    <div className="border-b border-brand-border bg-brand-cream/60 px-5 py-3.5">
      <p className="flex items-center gap-2 text-body-sm text-ink-variant">
        <Icon name={unlocked ? 'check-circle' : 'truck'} className="h-4 w-4 shrink-0 text-brand-goldDark" />
        {unlocked ? (
          <span className="font-semibold">Complimentary shipping unlocked.</span>
        ) : (
          <span>
            Add <span className="font-semibold text-brand-charcoal">{formatPrice(remaining)}</span> more for free
            shipping.
          </span>
        )}
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-brand-border">
        <div
          className={cn('h-full rounded-full transition-all duration-500', unlocked ? 'bg-emerald-600' : 'bg-brand-goldDark')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

/** Slide-over bag, opened from the header. */
export function CartDrawer() {
  const { cartDrawerOpen, closeCartDrawer } = useUiStore()
  const showcase = useShowcase()
  const items = useCartStore((state) => state.items)
  const increment = useCartStore((state) => state.increment)
  const decrement = useCartStore((state) => state.decrement)
  const removeItem = useCartStore((state) => state.removeItem)
  const syncPricing = useCartStore((state) => state.syncPricing)
  const summary = useCartStore((state) => state.summary())

  useEffect(() => {
    if (cartDrawerOpen) syncPricing()
  }, [cartDrawerOpen, syncPricing])

  const entries = groupCartItems(items)
  const empty = items.length === 0

  return (
    <Drawer
      open={cartDrawerOpen}
      onClose={closeCartDrawer}
      side="right"
      title="Shopping Bag"
      width="max-w-[26rem]"
    >
      <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
        <h2 className="flex items-center gap-2 text-label-md font-bold uppercase tracking-widest text-brand-charcoal">
          <Icon name="bag" className="h-4 w-4 text-brand-goldDark" />
          Your Bag
          {!empty && <span className="text-brand-muted">({summary.itemCount})</span>}
        </h2>
        <button
          type="button"
          onClick={closeCartDrawer}
          aria-label="Close bag"
          className="flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition hover:bg-neutral-100 hover:text-brand-charcoal"
        >
          <Icon name="close" className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {empty ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon="bag"
            title="Your bag is empty"
            description="Explore the catalogue and add a fragrance to begin."
            actionLabel="Browse Fragrances"
            actionTo="/shop"
            className="py-10"
          />
        </div>
      ) : (
        <>
          <ShippingProgress subtotal={summary.subtotal} />

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <ul className="space-y-4">
              {entries.map(({ item }) => (
                <li key={item.id} className="flex gap-3.5">
                  <Link to={`/product/${item.slug}`} onClick={closeCartDrawer} className="w-16 shrink-0">
                    <FlaconStage tier={item.tier} seed={item.slug} label={item.name} image={productImage(item)} compact />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <TierBadge tier={item.tier} size="sm" />
                        <p className="mt-1 truncate text-body-sm font-semibold text-brand-charcoal">{item.name}</p>
                        <p className="text-body-sm text-brand-muted">{item.volume}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 rounded p-1 text-brand-muted transition hover:bg-brand-cream hover:text-tier-original"
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(next) => (next < item.quantity ? decrement(item.id) : increment(item.id))}
                        size="sm"
                      />
                      <div className="text-right">
                        <span className="text-body-sm font-semibold text-brand-charcoal">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-brand-border bg-brand-cream/50 px-5 py-4">
            <dl className="space-y-1.5 text-body-sm">
              <div className="flex items-center justify-between">
                <dt className="text-brand-muted">Subtotal</dt>
                <dd className="font-semibold text-brand-charcoal">{formatPrice(summary.subtotal)}</dd>
              </div>
              {summary.productSavings > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-brand-muted">Savings</dt>
                  <dd className="font-semibold text-emerald-700">−{formatPrice(summary.productSavings)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-brand-muted">Shipping</dt>
                <dd className="font-semibold text-brand-charcoal">
                  {summary.shipping === 0 ? 'Complimentary' : formatPrice(summary.shipping)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex items-baseline justify-between border-t border-brand-border pt-3">
              <span className="text-label-md font-bold uppercase text-brand-charcoal">Total</span>
              <span className="text-headline-sm font-semibold text-brand-charcoal">{formatPrice(summary.payable)}</span>
            </div>

            {summary.savings > 0 && (
              <p className="mt-1.5 text-body-sm font-semibold text-emerald-700">
                You save {formatPrice(summary.savings)} on this order
              </p>
            )}

            <div className="mt-4 space-y-2">
              <Button variant="primary" to="/checkout" onClick={closeCartDrawer} className="w-full">
                Proceed To Checkout
                <Icon name="arrow-right" className="h-4 w-4" />
              </Button>
              <Button variant="outline" to="/cart" onClick={closeCartDrawer} className="w-full">
                View Full Bag
              </Button>
            </div>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-body-sm text-brand-muted">
              <Icon name="lock" className="h-3.5 w-3.5" />
              Secure encrypted checkout · {showcase.codEnabled ? 'UPI, cards & COD' : 'UPI & cards'}
            </p>
          </div>
        </>
      )}
    </Drawer>
  )
}

export default CartDrawer
