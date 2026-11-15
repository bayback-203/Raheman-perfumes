import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useCatalogueStore } from '@/store/catalogueStore'
import { imageUrls } from '@/data/productImages'
import { productService } from '@/services/productService'
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  GIFT_WRAP_FEE,
  LOYALTY_POINTS_PER_RUPEE,
} from '@/lib/format'

/** A stable key for a cart line: combo lines keep each paired combination distinct. */
export function lineKey(item) {
  if (item.comboId) return `combo:${item.comboId}:${item.productId}:${item.volume}`
  return `${item.productId}:${item.volume}`
}

/**
 * Snapshot builder shared by single additions and 1+1 combination pairs.
 */
function buildCartLine(product, { quantity = 1, volume, price, mrp, comboId = '' } = {}) {
  const safeQty = Math.min(99, Math.max(1, Math.floor(Number(quantity) || 1)))
  const resolvedProductId = product.productId ?? product.id ?? product._id ?? product.slug
  const chosenVolume = volume ?? product.volumes?.[0]?.size ?? product.volume ?? '50ml'
  const variant = product.volumes?.find((v) => v.size === chosenVolume)
  const unitPrice = price ?? variant?.price ?? product.price
  const unitMrp = mrp ?? variant?.mrp ?? product.mrp ?? unitPrice

  return {
    id: comboId ? `combo:${comboId}:${resolvedProductId}:${chosenVolume}` : `${resolvedProductId}:${chosenVolume}`,
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
    kind: comboId ? 'combo' : 'product',
    comboId: comboId || undefined,
    quantity: safeQty,
  }
}

/**
 * Compute multi-bottle combination discount matching `backend/src/lib/pricing.js`.
 *
 * Rules:
 * - Flatten all bottles across the cart into individual units.
 * - Sort descending by price (highest price first, lowest last).
 * - 1st bottle (highest price): 0% discount (customer pays full price).
 * - 2nd bottle (2nd highest): 15% discount.
 * - 3rd bottle and beyond: 20% discount.
 *
 * Sorting descending ensures that if a customer adds a cheap bottle first and an expensive one later,
 * the 20% cut applies strictly to the cheaper bottle, never the most expensive one.
 */
export function comboDiscountOf(items = [], percent = 15) {
  const bottlePrices = []
  for (const item of items) {
    const qty = Number(item.quantity ?? item.qty ?? 0)
    const price = Number(item.price ?? item.unitPrice ?? 0)
    for (let i = 0; i < qty; i++) {
      if (price > 0) bottlePrices.push(price)
    }
  }

  if (bottlePrices.length < 2) return 0

  // Sort descending: highest price to lowest price
  bottlePrices.sort((a, b) => b - a)

  const secondRate = Math.max(0, Math.min(80, Number(percent) || 15)) / 100
  const thirdRate = 0.20

  let discount = 0
  for (let i = 1; i < bottlePrices.length; i++) {
    const price = bottlePrices[i]
    if (i === 1) {
      discount += Math.round(price * secondRate)
    } else {
      discount += Math.round(price * thirdRate)
    }
  }

  return discount
}

/**
 * Group cart items for rendering, while allocating combo discounts accurately
 * to each line based on the sorted rule:
 * - Bottle units are sorted descending by price in backend calculation.
 * - Visual display order of items is preserved as added by customer ("not in frontend just in backend").
 */
export function groupCartItems(items = [], comboDiscountPercent = 15) {
  // 1. Flatten all individual bottle units, referencing their item id
  const units = []
  for (const item of items) {
    const qty = Number(item.quantity ?? 0)
    const price = Number(item.price ?? 0)
    for (let u = 0; u < qty; u++) {
      if (price > 0) {
        units.push({ id: item.id, price })
      }
    }
  }

  // 2. Accumulate discount per line
  const lineDiscounts = new Map()

  if (units.length >= 2) {
    // Sort descending by price (highest price first, lowest last)
    units.sort((a, b) => b.price - a.price)

    const secondRate = Math.max(0, Math.min(80, Number(comboDiscountPercent) || 15)) / 100
    const thirdRate = 0.20

    // Unit 0 (highest price): 0% discount
    // Unit 1 (2nd highest): 15% discount
    // Unit 2+ (3rd+ cheapest): 20% discount
    for (let i = 1; i < units.length; i++) {
      const { id, price } = units[i]
      const rate = i === 1 ? secondRate : thirdRate
      const cut = Math.round(price * rate)
      lineDiscounts.set(id, (lineDiscounts.get(id) || 0) + cut)
    }
  }

  // 3. Keep original visual order of items intact
  const comboMap = new Map()
  for (const item of items) {
    if (!item.comboId) continue
    if (!comboMap.has(item.comboId)) comboMap.set(item.comboId, [])
    comboMap.get(item.comboId).push(item)
  }

  const seenCombos = new Set()
  const entries = []

  for (const item of items) {
    if (!item.comboId) {
      const discountAmount = lineDiscounts.get(item.id) || 0
      entries.push({
        kind: 'single',
        item,
        comboPairs: units.length >= 2 && discountAmount > 0 ? 1 : 0,
        comboDiscountAmount: discountAmount,
      })
      continue
    }

    if (seenCombos.has(item.comboId)) continue
    seenCombos.add(item.comboId)

    const lines = comboMap.get(item.comboId) ?? []
    const isSelfPair = lines.length === 1
    const pairQty = isSelfPair
      ? Math.max(1, Math.floor((Number(lines[0].quantity) || 0) / 2))
      : Math.max(1, Math.min(...lines.map((l) => Number(l.quantity) || 0)))
    const rawTotal = lines.reduce((sum, l) => sum + (Number(l.price) || 0) * (Number(l.quantity) || 0), 0)
    const mrpTotal = lines.reduce((sum, l) => sum + (Number(l.mrp ?? l.price) || 0) * (Number(l.quantity) || 0), 0)
    const discountAmount = lines.reduce((sum, l) => sum + (lineDiscounts.get(l.id) || 0), 0)

    entries.push({
      kind: 'combo',
      comboId: item.comboId,
      lines,
      isSelfPair,
      pairQty,
      rawTotal,
      mrpTotal,
      discountAmount,
      finalTotal: Math.max(0, rawTotal - discountAmount),
    })
  }

  return entries
}

const initialState = {
  items: [],
  /** Live 1+1 combo percentage discount synced from `/api/pricing`. */
  comboDiscountPercent: 15,
  pricingSynced: false,
  /**
   * The applied coupon.
   *
   * `coupon` holds the **server's** rule (`{code, type, value, minOrder, cap}`,
   * pure data, so it persists and round-trips). There is no bundled coupon table
   * any more: a code only prices as a discount once `/coupons/validate` has
   * answered for it. `couponCode` mirrors the stored rule's code.
   */
  couponCode: null,
  coupon: null,
  giftWrap: false,
  giftMessage: '',
  /** Set by the PDP "buy now" button to skip the cart and jump to checkout. */
  expressItem: null,
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      /** Fetch live store pricing settings so 1+1 combo percentages match checkout. */
      async syncPricing() {
        try {
          const data = await productService.pricing()
          if (data && data.comboDiscountPercent != null) {
            set({
              comboDiscountPercent: Number(data.comboDiscountPercent) || 0,
              pricingSynced: true,
            })
          }
        } catch {
          // Keep current percentage on transient failure; server enforces authoritative total.
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

      /** Add a 1+1 perfume combination pair sharing a `comboId`. */
      addComboPair(first, second) {
        if (!first?.product || !second?.product) return null
        const token =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID().slice(0, 8)
            : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
        const comboId = `cmb-${token}`

        const lineA = buildCartLine(first.product, { volume: first.volume, quantity: 1, comboId })
        const lineB = buildCartLine(second.product, { volume: second.volume, quantity: 1, comboId })
        const additions =
          lineA.productId === lineB.productId && lineA.volume === lineB.volume
            ? [{ ...lineA, quantity: 2 }]
            : [lineA, lineB]

        set((state) => ({ items: [...state.items, ...additions] }))
        return comboId
      },

      /** Set number of combo pairs for a given `comboId`. */
      updateComboQuantity(comboId, pairCount) {
        const parsed = Math.floor(Number(pairCount))
        if (!Number.isFinite(parsed)) return
        if (parsed < 1) return get().removeCombo(comboId)
        const capped = Math.min(20, parsed)
        set((state) => {
          const groupLines = state.items.filter((item) => item.comboId === comboId)
          const isSelfPair = groupLines.length === 1
          return {
            items: state.items.map((item) =>
              item.comboId === comboId ? { ...item, quantity: isSelfPair ? capped * 2 : capped } : item,
            ),
          }
        })
      },

      /** Remove all bottles belonging to a 1+1 combo pair. */
      removeCombo(comboId) {
        set((state) => ({ items: state.items.filter((item) => item.comboId !== comboId) }))
      },

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
        if (item) get().updateQuantity(lineId, item.quantity + 1)
      },

      decrement(lineId) {
        const item = get().items.find((entry) => entry.id === lineId)
        if (item) get().updateQuantity(lineId, item.quantity - 1)
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
        const comboDiscountPercent = Number(state.comboDiscountPercent) || 15
        const comboDiscount = Math.min(subtotal, comboDiscountOf(state.items, comboDiscountPercent))
        const afterCombo = Math.max(0, subtotal - comboDiscount)
        // The applied rule, if the server handed one back. `coupon` is a plain
        // field — it was also a method of the same name once, and the first
        // `set({ coupon })` overwrote that method and crashed every later
        // `summary()` call.
        const coupon = state.coupon ?? null
        const couponDiscount = Math.min(afterCombo, couponDiscountOf(coupon, subtotal))
        const afterCoupon = Math.max(0, afterCombo - couponDiscount)
        const shipping =
          afterCoupon === 0 || afterCoupon >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
        const giftWrapFee = state.giftWrap ? GIFT_WRAP_FEE : 0
        // Fragrances carry 18% GST, already included in the listed price — shown
        // as an informational split, not added on top.
        const gst = Math.round((afterCoupon * 18) / 118)
        const total = afterCoupon + shipping + giftWrapFee

        return {
          itemCount: state.count(),
          subtotal,
          mrpTotal,
          productSavings,
          comboDiscount,
          comboDiscountPercent,
          couponDiscount,
          couponCode: coupon?.code ?? null,
          shipping,
          giftWrapFee,
          gst,
          total,
          payable: total,
          savings: productSavings + comboDiscount + couponDiscount,
          loyaltyPoints: Math.floor(afterCoupon * LOYALTY_POINTS_PER_RUPEE),
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
