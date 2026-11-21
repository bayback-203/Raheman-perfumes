import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useCatalogueStore } from '@/store/catalogueStore'
import { imageUrls } from '@/data/productImages'
import { productService } from '@/services/productService'
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  GIFT_WRAP_FEE,
  LOYALTY_ORDER_THRESHOLD,
  LOYALTY_POINTS_PER_ORDER,
  LOYALTY_REWARD_POINTS_COST,
  LOYALTY_POINTS_PER_RUPEE,
} from '@/lib/format'

/** Exclusive 10-points loyalty reward pure attar bottle (5ml, ₹0). */
export const FREE_ATTAR_REWARD = {
  id: 'reward:free-5ml-attar',
  productId: 'free-5ml-attar-reward',
  slug: 'pure-artisan-attar-5ml',
  name: 'Pure Artisan Attar (Loyalty Reward)',
  brand: 'Raheman Atelier',
  tier: 'Attar',
  volume: '5ml',
  price: 0,
  mrp: 399,
  notes: ['Royal Oud', 'Taif Rose', 'Mysore Sandalwood'],
  images: ['/rehman-amber-bottle-transparent.png'],
  kind: 'loyalty_reward',
  isLoyaltyReward: true,
  quantity: 1,
}

/** A stable key for a cart line. */
export function lineKey(item) {
  return `${item.productId}:${item.volume}`
}

/**
 * Snapshot builder for cart items.
 */
function buildCartLine(product, { quantity = 1, volume, price, mrp } = {}) {
  const safeQty = Math.min(99, Math.max(1, Math.floor(Number(quantity) || 1)))
  const resolvedProductId = product.productId ?? product.id ?? product._id ?? product.slug
  const chosenVolume = volume ?? product.volumes?.[0]?.size ?? product.volume ?? '50ml'
  const variant = product.volumes?.find((v) => v.size === chosenVolume)
  const unitPrice = price ?? variant?.price ?? product.price
  const unitMrp = mrp ?? variant?.mrp ?? product.mrp ?? unitPrice

  return {
    id: `${resolvedProductId}:${chosenVolume}`,
    productId: resolvedProductId,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    tier: product.tier,
    volume: chosenVolume,
    price: unitPrice,
    mrp: unitMrp,
    notes: product.notes ?? [],
    images: imageUrls(product),
    kind: 'product',
    quantity: safeQty,
  }
}

export function comboDiscountOf() {
  return 0
}

/**
 * Group cart items for rendering.
 */
export function groupCartItems(items = []) {
  return items.map((item) => ({
    kind: 'single',
    item,
    comboPairs: 0,
    comboDiscountAmount: 0,
  }))
}

const initialState = {
  items: [],
  pricingSynced: false,
  couponCode: null,
  coupon: null,
  giftWrap: false,
  giftMessage: '',
  expressItem: null,
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      async syncPricing() {
        try {
          await productService.pricing()
          set({ pricingSynced: true })
        } catch {
          // Ignore transient network failure
        }
      },

      /** Add a product, or bump the quantity if that exact line already exists. */
      addItem(product, { quantity = 1, volume, price, mrp, silent = false } = {}) {
        const line = buildCartLine(product, { quantity, volume, price, mrp })
        const safeQty = line.quantity

        set((state) => {
          const key = lineKey(line)
          const existing = state.items.find((item) => lineKey(item) === key)
          if (existing) {
            return {
              items: state.items.map((item) =>
                lineKey(item) === key ? { ...item, quantity: Math.min(99, item.quantity + safeQty) } : item,
              ),
            }
          }
          return { items: [...state.items, line] }
        })
        return { line, silent }
      },

      addComboPair() {
        return null
      },

      updateComboQuantity() {},

      removeCombo() {},

      /**
       * Give older lines the picture they were added under.
       *
       * Lines saved before photographs travelled with them carry no gallery, and
       * so did every line added while the catalogue was still loading. Both are
       * healed here from the live list, matched on id first and slug second — the
       * picture only. A line's price and name are its own snapshot of what was
       * agreed and are never rewritten by this.
       */
      backfillImages() {
        const { byId, bySlug } = useCatalogueStore.getState()
        let changed = false
        const items = get().items.map((item) => {
          if (item.images?.length) return item
          const images = imageUrls(byId[item.productId] ?? bySlug[item.slug])
          if (!images.length) return item
          changed = true
          return { ...item, images }
        })
        if (changed) set({ items })
      },

      updateQuantity(lineId, quantity) {
        const item = get().items.find((entry) => entry.id === lineId)
        if (item?.isLoyaltyReward || lineId === FREE_ATTAR_REWARD.id) {
          if (quantity < 1) return get().removeItem(lineId)
          return
        }
        const parsed = Math.floor(Number(quantity))
        if (!Number.isFinite(parsed)) return
        if (parsed < 1) return get().removeItem(lineId)
        const capped = Math.min(99, parsed)
        set((state) => ({
          items: state.items.map((item) => (item.id === lineId ? { ...item, quantity: capped } : item)),
        }))
      },

      increment(lineId) {
        const item = get().items.find((entry) => entry.id === lineId)
        if (item?.isLoyaltyReward || lineId === FREE_ATTAR_REWARD.id) return
        if (item) get().updateQuantity(lineId, item.quantity + 1)
      },

      decrement(lineId) {
        const item = get().items.find((entry) => entry.id === lineId)
        if (item?.isLoyaltyReward || lineId === FREE_ATTAR_REWARD.id) {
          return get().removeItem(lineId)
        }
        if (item) get().updateQuantity(lineId, item.quantity - 1)
      },

      addFreeAttarReward() {
        set((state) => {
          if (state.items.some((item) => item.id === FREE_ATTAR_REWARD.id || item.isLoyaltyReward)) {
            return state
          }
          return { items: [FREE_ATTAR_REWARD, ...state.items] }
        })
      },

      removeFreeAttarReward() {
        set((state) => ({
          items: state.items.filter((item) => item.id !== FREE_ATTAR_REWARD.id && !item.isLoyaltyReward),
        }))
      },

      hasFreeAttarReward() {
        return get().items.some((item) => item.id === FREE_ATTAR_REWARD.id || item.isLoyaltyReward)
      },

      removeItem(lineId) {
        set((state) => ({ items: state.items.filter((item) => item.id !== lineId) }))
      },

      clearCart() {
        set({ ...initialState })
      },

      /**
       * Apply a coupon the server has already validated.
       *
       * Only the rule object counts — a bare code with no validated rule behind
       * it prices as no discount at all, which is why `CartPage` validates
       * against `/coupons/validate` before calling this.
       */
      applyCoupon(coupon) {
        if (!coupon || typeof coupon !== 'object' || !coupon.code) return
        set({ couponCode: coupon.code, coupon })
      },

      removeCoupon() {
        set({ couponCode: null, coupon: null })
      },

      setGiftWrap(enabled) {
        set({ giftWrap: enabled, giftMessage: enabled ? get().giftMessage : '' })
      },

      setGiftMessage(message) {
        set({ giftMessage: message })
      },

      setExpressItem(line) {
        set({ expressItem: line })
      },

      // --- Derived ---------------------------------------------------------
      count() {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      subtotal() {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      mrpTotal() {
        return get().items.reduce((total, item) => total + (item.mrp ?? item.price) * item.quantity, 0)
      },

      /** Full money breakdown used by the cart page, drawer and checkout. */
      summary() {
        const state = get()
        const subtotal = state.subtotal()
        const mrpTotal = state.mrpTotal()
        const productSavings = Math.max(0, mrpTotal - subtotal)
        const coupon = state.coupon ?? null
        const couponDiscount = Math.min(subtotal, couponDiscountOf(coupon, subtotal))
        const afterCoupon = Math.max(0, subtotal - couponDiscount)
        const shipping =
          afterCoupon === 0 || afterCoupon >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
        const giftWrapFee = state.giftWrap ? GIFT_WRAP_FEE : 0
        const gst = Math.round((afterCoupon * 18) / 118)
        const total = afterCoupon + shipping + giftWrapFee

        return {
          itemCount: state.count(),
          subtotal,
          mrpTotal,
          productSavings,
          comboDiscount: 0,
          comboDiscountPercent: 0,
          couponDiscount,
          couponCode: coupon?.code ?? null,
          shipping,
          giftWrapFee,
          gst,
          total,
          payable: total,
          savings: productSavings + couponDiscount,
          loyaltyPoints: total >= LOYALTY_ORDER_THRESHOLD ? LOYALTY_POINTS_PER_ORDER : 0,
          hasFreeReward: state.items.some((item) => item.isLoyaltyReward || item.id === FREE_ATTAR_REWARD.id),
          freeShippingGap: Math.max(0, FREE_SHIPPING_THRESHOLD - afterCoupon),
        }
      },
    }),
    {
      name: 'rehman.cart',
      storage: createJSONStorage(() => sessionStorage),
      // v2: the bundled coupon table is gone. A persisted code with no validated
      // rule behind it would price as nothing, so the stale pair is dropped
      // together — the shopper re-applies the code and the server re-decides.
      version: 2,
      migrate: (persisted, version) => {
        if (version >= 2) return persisted
        const coupon = persisted?.coupon ?? null
        return { ...persisted, coupon, couponCode: coupon?.code ?? null }
      },
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        // A server coupon is plain data, so it round-trips through storage
        // happily — and it has to, or a reload would leave the code applied
        // with no rule to price it by.
        coupon: state.coupon,
        giftWrap: state.giftWrap,
        giftMessage: state.giftMessage,
      }),
    },
  ),
)

/**
 * What a coupon removes from a subtotal.
 *
 * The rule is the server's data (`type`/`value`/`minOrder`/`cap`), mirrored here
 * so the cart preview prices the same way the backend's `couponDiscount()` does
 * at placement. This is a *preview*: the figure that lands on the order is the
 * server's, and a preview that could disagree with the charge is worse than no
 * preview at all — hence the clamp to the subtotal.
 */
function couponDiscountOf(coupon, subtotal) {
  if (!coupon) return 0

  const base = Number(subtotal) || 0
  if (base <= 0 || base < (coupon.minOrder ?? 0)) return 0

  let amount = 0
  if (coupon.type === 'percent') {
    amount = Math.round((base * (Number(coupon.value) || 0)) / 100)
    if (coupon.cap != null) amount = Math.min(amount, coupon.cap)
  } else if (coupon.type === 'flat') {
    amount = Number(coupon.value) || 0
  }

  return Math.max(0, Math.min(amount, base))
}

export default useCartStore
