import api from '@/lib/api'

/**
 * Public order lookups — no session, no account.
 *
 * Kept out of `authService` on purpose. That service's order calls
 * (`orders()`, `placeOrder()`) are **account** reads: they answer for the
 * signed-in patron and are meaningless without a session. This one answers for
 * anybody holding an order number, which is what the tracking page is for, and
 * the two must not drift into each other.
 */
export const orderService = {
  /**
   * Look up one consignment.
   *
   * Resolves the tracking view, or **`null` when the server knows no such
   * order** — deliberately not an error, because a mistyped number is an
   * ordinary thing for a shopper to do and should read as "no such order"
   * rather than as a fault. A `throw` therefore means something different and
   * much more specific: the server never answered.
   *
   * There is nothing bundled to fall back to: the server's answer, or its
   * silence, is the entire truth this page has.
   */
  track: (number) => api.get(`/orders/track/${encodeURIComponent(number)}`),
}

export default orderService
