import { useEffect, useMemo, useRef, useState } from 'react'
import { NAV_TRANSITION, Link, Navigate, useLocation, useNavigate } from '@/components/ui/AppLink'
import cn from '@/lib/cn'
import { formatPrice, GIFT_WRAP_FEE } from '@/lib/format'
import useCartStore, { groupCartItems } from '@/store/cartStore'
import { useCatalogueStore, useShowcase } from '@/store/catalogueStore'
import useAuthStore from '@/store/authStore'
import { authService } from '@/services/authService'
import { toast } from '@/store/uiStore'
import { Icon } from '@/components/ui/Icon'
import { Input, Checkbox } from '@/components/ui/Form'
import { AddressFields } from '@/components/ui/AddressFields'
import { EmptyState, Skeleton } from '@/components/ui/Feedback'
import { FlaconStage } from '@/components/product/FlaconArt'
import { productImage } from '@/data/productImages'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SHIPPING_METHODS, PAYMENT_METHODS } from '@/data/content'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+]?[\d\s-]{10,15}$/
const PINCODE_PATTERN = /^\d{6}$/

const PAYMENT_ICON = {
  razorpay: 'shield',
  cod: 'truck',
}

/** Framed icon input field card matching the clean two-column customer info style. */
function CheckoutFieldCard({ icon, label, value, onChange, error, type = 'text', required = false, placeholder = '' }) {
  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 transition',
          error
            ? 'border-error ring-1 ring-error'
            : 'border-brand-border focus-within:border-brand-charcoal focus-within:ring-1 focus-within:ring-brand-charcoal',
        )}
      >
        {icon && <Icon name={icon} className="h-4 w-4 shrink-0 text-brand-muted" />}
        <div className="min-w-0 flex-1">
          <label className="block text-[11px] font-medium text-brand-muted">
            {label}
            {required && <span className="ml-0.5 text-error">*</span>}
          </label>
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-medium text-brand-charcoal outline-none placeholder:font-normal placeholder:text-brand-muted/60"
          />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}

/** Inline mini quantity pill (- 1 +) inside Current Order item cards. */
function MiniQtyStepper({ count, onIncrement, onDecrement, itemLabel }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-[#F5F5F5] px-1.5 py-1">
      <button
        type="button"
        onClick={onDecrement}
        disabled={count <= 1}
        aria-label={`Decrease quantity of ${itemLabel}`}
        className="flex h-5 w-5 items-center justify-center rounded text-brand-charcoal transition hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Icon name="minus" className="h-3 w-3" strokeWidth={2.2} />
      </button>
      <span className="min-w-[1.1rem] text-center text-xs font-semibold tabular-nums text-brand-charcoal">
        {count}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Increase quantity of ${itemLabel}`}
        className="flex h-5 w-5 items-center justify-center rounded text-brand-charcoal transition hover:bg-white"
      >
        <Icon name="plus" className="h-3 w-3" strokeWidth={2.2} />
      </button>
    </div>
  )
}

export function CheckoutPage() {
  useDocumentTitle('Secure Checkout')

  const navigate = useNavigate()
  const location = useLocation()
  const items = useCartStore((state) => state.items)
  const summary = useCartStore((state) => state.summary())
  const increment = useCartStore((state) => state.increment)
  const decrement = useCartStore((state) => state.decrement)
  const updateComboQuantity = useCartStore((state) => state.updateComboQuantity)
  const giftWrap = useCartStore((state) => state.giftWrap)
  const setGiftWrap = useCartStore((state) => state.setGiftWrap)
  const clearCart = useCartStore((state) => state.clearCart)
  const syncPricing = useCartStore((state) => state.syncPricing)
  const couponCode = useCartStore((state) => state.couponCode)
  const showcase = useShowcase()
  const refreshShowcase = useCatalogueStore((state) => state.refreshShowcase)

  useEffect(() => {
    syncPricing()
    refreshShowcase({ force: true })
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshShowcase({ force: true })
    }
    window.addEventListener('focus', onVisible)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onVisible)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [syncPricing, refreshShowcase])

  const addOrder = useAuthStore((state) => state.addOrder)
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const addresses = useAuthStore((state) => state.addresses)

  const defaultAddress = addresses.find((address) => address.id === user?.defaultAddressId) ?? addresses[0]

  const [contact, setContact] = useState({
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
  })
  const [shipping, setShipping] = useState({
    line1: defaultAddress?.line1 ?? '',
    line2: defaultAddress?.line2 ?? '',
    area: defaultAddress?.area ?? '',
    city: defaultAddress?.city ?? '',
    district: defaultAddress?.district ?? '',
    state: defaultAddress?.state ?? 'Maharashtra',
    pincode: defaultAddress?.pincode ?? '',
  })
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0]?.id ?? 'standard')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]?.id ?? 'razorpay')
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const [activeTab, setActiveTab] = useState('customer')
  const [addressEditing, setAddressEditing] = useState(
    () =>
      !(
        defaultAddress?.line1 &&
        defaultAddress?.city &&
        defaultAddress?.district &&
        defaultAddress?.state &&
        PINCODE_PATTERN.test(defaultAddress?.pincode ?? '')
      ),
  )

  const customerRef = useRef(null)
  const paymentRef = useRef(null)
  const placingRef = useRef(false)
  const orderKeyRef = useRef({ signature: '', key: '' })

  const availablePayments = useMemo(
    () => PAYMENT_METHODS.filter((method) => showcase.codEnabled || method.id !== 'cod'),
    [showcase.codEnabled],
  )

  useEffect(() => {
    if (!showcase.codEnabled && paymentMethod === 'cod') {
      setPaymentMethod(availablePayments[0]?.id ?? 'razorpay')
    }
  }, [showcase.codEnabled, paymentMethod, availablePayments])

  const entries = useMemo(
    () => groupCartItems(items, summary.comboDiscountPercent),
    [items, summary.comboDiscountPercent],
  )

  const expressShipping = SHIPPING_METHODS.find((method) => method.id === shippingMethod)
  const shippingFee = expressShipping?.price ?? 0
  const totalDelivery = summary.shipping + shippingFee
  const codFee = availablePayments.find((method) => method.id === paymentMethod)?.fee ?? 0
  const payable = summary.payable + shippingFee + codFee

  const hasValidAddress =
    Boolean(shipping.line1.trim()) &&
    Boolean(shipping.city.trim()) &&
    Boolean(shipping.district.trim()) &&
    Boolean(shipping.state.trim()) &&
    PINCODE_PATTERN.test(shipping.pincode)

  const customerComplete =
    EMAIL_PATTERN.test(contact.email) &&
    PHONE_PATTERN.test(contact.phone) &&
    Boolean(contact.firstName.trim()) &&
    hasValidAddress

  const formattedAddress = [
    shipping.line1,
    shipping.line2,
    shipping.area,
    shipping.city,
    shipping.district,
    shipping.state ? `${shipping.state}${shipping.pincode ? ` - ${shipping.pincode}` : ''}` : shipping.pincode,
  ]
    .filter(Boolean)
    .join(', ')

  if (items.length === 0) {
    return (
      <div className="shell py-16">
        <EmptyState
          icon="bag"
          title="Nothing to check out"
          description="Your bag is empty. Add a fragrance first, then come back to complete your order."
          actionLabel="Browse Fragrances"
          actionTo="/shop"
        />
      </div>
    )
  }

  if (!user) {
    if (status === 'idle' || status === 'restoring') {
      return (
        <div className="shell py-16">
          <div className="mx-auto max-w-md space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      )
    }

    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/sign-in?next=${encodeURIComponent(next)}&reason=checkout`} replace />
  }

  const scrollToSection = (section) => {
    setActiveTab(section)
    const target = section === 'payment' ? paymentRef.current : customerRef.current
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const applySavedAddress = (address) => {
    setShipping({
      line1: address.line1 ?? '',
      line2: address.line2 ?? '',
      area: address.area ?? '',
      city: address.city ?? '',
      district: address.district ?? '',
      state: address.state ?? 'Maharashtra',
      pincode: address.pincode ?? '',
    })
    setErrors((prev) => ({ ...prev, line1: undefined, city: undefined, district: undefined, state: undefined, pincode: undefined }))
    setAddressEditing(false)
  }

  const validate = () => {
    const next = {}
    if (!EMAIL_PATTERN.test(contact.email)) next.email = 'Enter a valid email address.'
    if (!PHONE_PATTERN.test(contact.phone)) next.phone = 'Enter a valid 10-digit mobile number.'
    if (!contact.firstName.trim()) next.firstName = 'Required.'
    if (!shipping.line1.trim()) next.line1 = 'Required.'
    if (!shipping.city.trim()) next.city = 'Required.'
    if (!shipping.district.trim()) next.district = 'Required.'
    if (!shipping.state.trim()) next.state = 'Required.'
    if (!PINCODE_PATTERN.test(shipping.pincode)) next.pincode = 'Enter a 6-digit PIN code.'
    setErrors(next)
    if (next.line1 || next.city || next.district || next.state || next.pincode) {
      setAddressEditing(true)
    }
    if (Object.keys(next).length > 0) {
      scrollToSection('customer')
    }
    return Object.keys(next).length === 0
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    if (placingRef.current) return
    if (!validate()) {
      toast({ title: 'Check your details', description: 'Some required fields need attention.', tone: 'error' })
      return
    }

    placingRef.current = true
    setPlacing(true)

    const draft = {
      items: items.map((item) => ({
        slug: item.slug,
        size: item.volume,
        qty: item.quantity,
        comboId: item.comboId || undefined,
      })),
      address: {
        name: `${contact.firstName} ${contact.lastName}`.trim(),
        phone: contact.phone,
        line1: shipping.line1,
        line2: shipping.line2,
        area: shipping.area,
        city: shipping.city,
        district: shipping.district,
        state: shipping.state,
        pincode: shipping.pincode,
      },
      couponCode: couponCode ?? undefined,
      payment: { method: paymentMethod },
      notes,
    }

    const signature = JSON.stringify(draft)
    if (orderKeyRef.current.signature !== signature || !orderKeyRef.current.key) {
      const token =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
      orderKeyRef.current = { signature, key: `ord-${token}` }
    }

    let result
    try {
      result = await authService.placeOrder(draft, { idempotencyKey: orderKeyRef.current.key })
    } catch (error) {
      placingRef.current = false
      setPlacing(false)

      if (error.status === 401) {
        toast({
          title: 'Please sign in',
          description: 'An order needs an account so you can follow it. Your bag is safe.',
          tone: 'error',
        })
        navigate('/sign-in?next=/checkout', NAV_TRANSITION)
        return
      }

      toast({ title: 'Order not placed', description: error.message, tone: 'error' })
      return
    }

    const order = result.data?.order
    if (!order?.id) {
      placingRef.current = false
      setPlacing(false)
      toast({
        title: 'Order not placed',
        description: 'The confirmation came back without an order number. Nothing has been charged.',
        tone: 'error',
      })
      return
    }

    orderKeyRef.current = { signature: '', key: '' }
    addOrder(order)
    clearCart()
    toast({
      title: `Order ${order.id} confirmed`,
      description: 'Your order email is on its way with delivery details.',
    })
    navigate(`/track-order?order=${order.id}`, NAV_TRANSITION)
  }

  return (
    <div className="shell py-8 lg:py-10">
      {/* Top minimal breadcrumb link matching reference layout */}
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-charcoal transition hover:text-brand-goldDark"
      >
        <Icon name="chevron-left" className="h-4 w-4" strokeWidth={2} />
        <span>Home / Shopping Bag</span>
      </Link>

      <form
        onSubmit={placeOrder}
        className="mt-7 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_25rem] xl:grid-cols-[minmax(0,1fr)_27rem] lg:gap-12"
      >
        {/* ─────────── LEFT COLUMN: Step Tabs + Customer Info + Payment Method ─────────── */}
        <div className="min-w-0 lg:border-r lg:border-brand-border/80 lg:pr-10">
          {/* Two-step horizontal progress tabs */}
          <div className="grid grid-cols-2 border-b border-brand-border">
            <button
              type="button"
              onClick={() => scrollToSection('customer')}
              className={cn(
                '-mb-px flex items-center gap-2.5 border-b-2 pb-3.5 text-left text-sm font-medium transition',
                activeTab === 'customer'
                  ? 'border-brand-charcoal text-brand-charcoal'
                  : 'border-transparent text-brand-muted hover:text-brand-charcoal',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white transition',
                  customerComplete || activeTab === 'customer' ? 'bg-brand-charcoal' : 'bg-brand-border',
                )}
              >
                <Icon name="check" className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <span className="truncate">Customer Information</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('payment')}
              className={cn(
                '-mb-px flex items-center gap-2.5 border-b-2 pb-3.5 text-left text-sm font-medium transition',
                activeTab === 'payment'
                  ? 'border-brand-charcoal text-brand-charcoal'
                  : 'border-transparent text-brand-muted hover:text-brand-charcoal',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white transition',
                  activeTab === 'payment' ? 'bg-brand-charcoal' : 'bg-brand-border',
                )}
              >
                <Icon name="check" className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <span className="truncate">Payment Details</span>
            </button>
          </div>

          {/* Section 1: Customer Information & Delivery */}
          <section ref={customerRef} className="pt-8 scroll-mt-24">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h1 className="text-xl font-semibold text-brand-charcoal sm:text-2xl">Check Out Your Items</h1>
                <p className="mt-1 text-xs text-brand-muted sm:text-sm">
                  For a better experience, verify your details and choose delivery before ordering.
                </p>
              </div>
              {addresses.length > 0 && addressEditing && (
                <button
                  type="button"
                  onClick={() => applySavedAddress(addresses[0])}
                  className="text-xs font-semibold text-brand-goldDark hover:underline"
                >
                  Use Saved Address
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
              <CheckoutFieldCard
                icon="user"
                label="First Name"
                required
                value={contact.firstName}
                error={errors.firstName}
                placeholder="Enter first name"
                onChange={(event) => {
                  setActiveTab('customer')
                  setContact({ ...contact, firstName: event.target.value })
                }}
              />
              <CheckoutFieldCard
                icon="user"
                label="Last Name"
                value={contact.lastName}
                placeholder="Enter last name"
                onChange={(event) => {
                  setActiveTab('customer')
                  setContact({ ...contact, lastName: event.target.value })
                }}
              />
              <CheckoutFieldCard
                icon="mail"
                label="Email"
                type="email"
                required
                value={contact.email}
                error={errors.email}
                placeholder="you@example.com"
                onChange={(event) => {
                  setActiveTab('customer')
                  setContact({ ...contact, email: event.target.value })
                }}
              />
              <CheckoutFieldCard
                icon="phone"
                label="Mobile Number"
                type="tel"
                required
                value={contact.phone}
                error={errors.phone}
                placeholder="10-digit mobile number"
                onChange={(event) => {
                  setActiveTab('customer')
                  setContact({ ...contact, phone: event.target.value })
                }}
              />
            </div>

            {/* Delivery Address card — matches reference box with edit toggle */}
            <div className="mt-4 rounded-xl border border-brand-border bg-white p-4 transition focus-within:border-brand-charcoal">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 text-brand-muted">
                  <Icon name="map-pin" className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium text-brand-muted">Delivery Address</span>
                </div>
                <div className="flex items-center gap-3">
                  {addresses.length > 0 && !addressEditing && (
                    <Link to="/account" className="text-xs font-medium text-brand-goldDark hover:underline">
                      Saved
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('customer')
                      setAddressEditing((open) => !open)
                    }}
                    aria-label={addressEditing ? 'Collapse delivery address form' : 'Edit delivery address'}
                    title={addressEditing ? 'Done editing' : 'Edit delivery address'}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-muted transition hover:bg-neutral-100 hover:text-brand-charcoal"
                  >
                    <Icon name={addressEditing ? 'check' : 'edit'} className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!addressEditing && hasValidAddress ? (
                <div className="mt-2 pl-6 text-sm leading-relaxed text-brand-charcoal">
                  <p className="font-medium">{formattedAddress}</p>
                  {notes && <p className="mt-1 text-xs text-brand-muted">Note: {notes}</p>}
                </div>
              ) : (
                <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                  <Input
                    containerClassName="sm:col-span-2"
                    label="Address line 1"
                    required
                    value={shipping.line1}
                    error={errors.line1}
                    onChange={(event) => setShipping({ ...shipping, line1: event.target.value })}
                    placeholder="House / Flat no., Building, Street"
                  />
                  <Input
                    containerClassName="sm:col-span-2"
                    label="Address line 2"
                    value={shipping.line2}
                    onChange={(event) => setShipping({ ...shipping, line2: event.target.value })}
                    placeholder="Apartment, Suite, Floor (optional)"
                  />
                  <AddressFields
                    value={shipping}
                    onChange={(patch) => setShipping((current) => ({ ...current, ...patch }))}
                    errors={errors}
                  />
                  <Input
                    label="Delivery notes (optional)"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value.slice(0, 200))}
                    placeholder="Instructions for courier (optional)"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 sm:col-span-2">
                    <Checkbox
                      checked={sameAsBilling}
                      onChange={(event) => setSameAsBilling(event.target.checked)}
                      label="Billing address same as delivery"
                    />
                    {hasValidAddress && (
                      <button
                        type="button"
                        onClick={() => setAddressEditing(false)}
                        className="rounded-lg bg-brand-charcoal px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-goldDark"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Compact Delivery Speed Selector */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SHIPPING_METHODS.map((method) => {
                const selected = shippingMethod === method.id
                return (
                  <label
                    key={method.id}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition',
                      selected
                        ? 'border-2 border-brand-charcoal bg-white'
                        : 'border-brand-border bg-white hover:border-brand-charcoal/40',
                    )}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={selected}
                      onChange={() => setShippingMethod(method.id)}
                      className="sr-only"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-brand-charcoal">{method.name}</p>
                      <p className="mt-0.5 text-[11px] text-brand-muted">
                        {method.eta} · {method.price === 0 ? 'Complimentary' : formatPrice(method.price)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                        selected ? 'border-brand-charcoal' : 'border-brand-muted/50',
                      )}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-brand-charcoal" />}
                    </span>
                  </label>
                )
              })}
            </div>
          </section>

          {/* Section 2: Payment Method — stacked selectable rows matching reference */}
          <section ref={paymentRef} className="mt-9 scroll-mt-24">
            <h2 className="text-xl font-semibold text-brand-charcoal sm:text-2xl">Payment Method</h2>
            <p className="mt-1 text-xs text-brand-muted sm:text-sm">
              Select the method for payment of your order. Encrypted end to end.
            </p>

            <div className="mt-5 space-y-3">
              {availablePayments.map((method) => {
                const selected = paymentMethod === method.id
                return (
                  <label
                    key={method.id}
                    onClick={() => setActiveTab('payment')}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3.5 transition-all',
                      selected
                        ? 'border-2 border-brand-charcoal bg-white shadow-xs'
                        : 'border-brand-border bg-white hover:border-brand-charcoal/40',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selected}
                      onChange={() => {
                        setActiveTab('payment')
                        setPaymentMethod(method.id)
                      }}
                      className="sr-only"
                    />
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-brand-charcoal',
                          selected ? 'border-brand-charcoal bg-neutral-50' : 'border-brand-border bg-white',
                        )}
                      >
                        <Icon name={PAYMENT_ICON[method.id] ?? 'card'} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-brand-charcoal">{method.label}</span>
                          {method.badge && (
                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-brand-muted">{method.note}</p>
                      </div>
                    </div>

                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition',
                        selected ? 'border-brand-charcoal' : 'border-brand-muted/50',
                      )}
                    >
                      {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-charcoal" />}
                    </span>
                  </label>
                )
              })}
            </div>

            {!showcase.codEnabled && (
              <p className="mt-3 text-xs text-brand-muted">
                Cash on Delivery is currently turned off. Please pay online with Razorpay.
              </p>
            )}
          </section>
        </div>

        {/* ─────────── RIGHT COLUMN: Current Order Summary Card ─────────── */}
        <aside className="rounded-2xl border border-brand-border/80 bg-[#F6F6F6] p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold text-brand-charcoal">Current Order</h2>
          <p className="mt-1 text-xs text-brand-muted">The sum of all total items & savings for your bag</p>

          {/* Compact Line-Item White Sub-Cards with live + / - steppers */}
          <ul className="mt-5 space-y-3">
            {entries.map((entry) => {
              if (entry.kind === 'single') {
                const { item, comboPairs, comboDiscountAmount } = entry
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-brand-border/70 bg-white p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Link
                        to={`/product/${item.slug}`}
                        className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F9F9F9] p-1"
                      >
                        <FlaconStage
                          tier={item.tier}
                          seed={item.slug}
                          label={item.name}
                          image={productImage(item)}
                          compact
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.slug}`}
                          className="block truncate text-sm font-semibold text-brand-charcoal hover:text-brand-goldDark"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-brand-muted">
                          <span>{item.volume} · Quantity : {item.quantity}</span>
                          {comboPairs > 0 && (
                            <span className="font-semibold text-emerald-700">
                              (Combo Deal)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-sm font-semibold tabular-nums text-brand-charcoal">
                        {formatPrice(item.price * item.quantity - (comboDiscountAmount || 0))}
                      </span>
                      {comboDiscountAmount > 0 && (
                        <span className="text-[11px] text-brand-muted line-through">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      )}
                      <MiniQtyStepper
                        count={item.quantity}
                        itemLabel={item.name}
                        onIncrement={() => increment(item.id)}
                        onDecrement={() => decrement(item.id)}
                      />
                    </div>
                  </li>
                )
              }

              const firstLine = entry.lines[0]
              const comboNames = entry.lines.map((l) => l.name).join(' + ')
              return (
                <li
                  key={entry.comboId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-brand-border/70 bg-white p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F9F9F9] p-1">
                      <FlaconStage
                        tier={firstLine?.tier ?? 'Combo'}
                        seed={firstLine?.slug ?? entry.comboId}
                        label={comboNames}
                        image={productImage(firstLine)}
                        compact
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-charcoal">{comboNames}</p>
                      <p className="mt-0.5 truncate text-xs text-brand-muted">
                        1+1 Combo · Pairs : {entry.pairQty}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-sm font-semibold tabular-nums text-brand-charcoal">
                      {formatPrice(entry.payableTotal)}
                    </span>
                    <MiniQtyStepper
                      count={entry.pairQty}
                      itemLabel={comboNames}
                      onIncrement={() => updateComboQuantity(entry.comboId, entry.pairQty + 1)}
                      onDecrement={() => updateComboQuantity(entry.comboId, entry.pairQty - 1)}
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Optional Gift Wrap toggle */}
          <div className="mt-4 border-t border-brand-border/80 pt-3.5">
            <Checkbox
              checked={giftWrap}
              onChange={(event) => setGiftWrap(event.target.checked)}
              label={`Add satin gift box wrap (+${formatPrice(GIFT_WRAP_FEE)})`}
            />
          </div>

          {/* Subtotal row */}
          <div className="mt-4 flex items-baseline justify-between border-t border-brand-border/80 pt-4">
            <span className="text-base font-medium text-brand-charcoal">Subtotal</span>
            <span className="text-lg font-bold tabular-nums text-brand-charcoal">
              {formatPrice(summary.subtotal)}
            </span>
          </div>

          {/* Breakdown lines */}
          <dl className="mt-3.5 space-y-2 border-t border-brand-border/80 pt-3.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-muted">Items</dt>
              <dd className="font-medium tabular-nums text-brand-charcoal">{summary.itemCount}x</dd>
            </div>
            {summary.comboDiscount > 0 && (
              <div className="flex justify-between">
                <dt className="text-brand-muted">Combo Savings</dt>
                <dd className="font-medium tabular-nums text-emerald-700">-{formatPrice(summary.comboDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-brand-muted">
                Code Promo{couponCode ? ` (${couponCode})` : ''}
              </dt>
              <dd
                className={cn(
                  'font-medium tabular-nums',
                  summary.couponDiscount > 0 ? 'text-emerald-700' : 'text-brand-charcoal',
                )}
              >
                {summary.couponDiscount > 0 ? `-${formatPrice(summary.couponDiscount)}` : formatPrice(0)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-muted">Delivery Service</dt>
              <dd className="font-medium tabular-nums text-brand-charcoal">
                {totalDelivery === 0 ? 'Complimentary' : formatPrice(totalDelivery)}
              </dd>
            </div>
            {summary.giftWrapFee > 0 && (
              <div className="flex justify-between">
                <dt className="text-brand-muted">Gift Box Wrap</dt>
                <dd className="font-medium tabular-nums text-brand-charcoal">{formatPrice(summary.giftWrapFee)}</dd>
              </div>
            )}
            {codFee > 0 && (
              <div className="flex justify-between">
                <dt className="text-brand-muted">COD Handling</dt>
                <dd className="font-medium tabular-nums text-brand-charcoal">{formatPrice(codFee)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-brand-muted">GST (Included)</dt>
              <dd className="font-medium tabular-nums text-brand-charcoal">{formatPrice(summary.gst)}</dd>
            </div>
          </dl>

          {/* Rounded pill Pay / Place Order button */}
          <button
            type="submit"
            disabled={placing}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-charcoal px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-goldDark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placing
              ? 'Processing Order...'
              : `${paymentMethod === 'cod' ? 'Place Order' : 'Pay'} ${formatPrice(payable)}`}
          </button>

          <p className="mt-3.5 flex items-center justify-center gap-1.5 text-xs text-brand-muted">
            <Icon name="lock" className="h-3.5 w-3.5" />
            <span>Secure encrypted checkout</span>
            <span>·</span>
            <Link to="/cart" className="underline underline-offset-2 hover:text-brand-charcoal">
              Edit Bag
            </Link>
          </p>
        </aside>
      </form>
    </div>
  )
}

export default CheckoutPage
