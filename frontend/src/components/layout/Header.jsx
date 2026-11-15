import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NAV_TRANSITION, Link, NavLink, useLocation, useNavigate } from '@/components/ui/AppLink'
import { useLenis } from 'lenis/react'
import cn from '@/lib/cn'
import { formatPrice } from '@/lib/format'
import useUiStore from '@/store/uiStore'
import useCartStore from '@/store/cartStore'
import useWishlistStore from '@/store/wishlistStore'
import { Icon } from '@/components/ui/Icon'
import { MAIN_NAV } from '@/data/content'
import { searchCatalogue } from '@/services/productService'
import { useCatalogueProducts } from '@/store/catalogueStore'
import { FlaconStage } from '@/components/product/FlaconArt'
import { productImage } from '@/data/productImages'
import { Logo, HeaderAction } from './Brand'

const MAX_SUGGESTIONS = 5

/**
 * Sticky site header: wordmark, primary nav, instant search and the
 * account/wishlist/bag actions. Search suggestions come from the same local
 * catalogue search the results page uses, so the two never disagree.
 */
export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const searchRef = useRef(null)
  const blurTimer = useRef(null)
  const progressRef = useRef(null)

  const products = useCatalogueProducts()

  const { openMobileMenu, openCartDrawer, toggleSearch } = useUiStore()
  const cartCount = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0))
  const wishlistCount = useWishlistStore((state) => state.items.length)

  const suggestions = useMemo(
    () => (query.trim().length > 1 ? searchCatalogue(query, { limit: MAX_SUGGESTIONS, products }) : []),
    [query, products],
  )
  const showSuggestions = focused && query.trim().length > 1

  // Lenis emits `scroll` from inside its own frame loop, so the header stays in
  // step with the animation instead of trailing it the way a native scroll
  // listener does. The callback must be stable — `useLenis` keeps it in a
  // dependency array, so an inline arrow would resubscribe on every render.
  const onScroll = useCallback((lenis) => {
    const next = lenis.scroll > 8
    setScrolled((previous) => (previous === next ? previous : next))

    // Written straight to the node. Driving a progress bar through state would
    // re-render the entire header on every frame of every scroll.
    const bar = progressRef.current
    if (bar) bar.style.transform = `scaleX(${lenis.progress || 0})`
  }, [])

  useLenis(onScroll)

  // Any navigation closes the suggestion panel.
  useEffect(() => {
    setQuery('')
    setFocused(false)
  }, [location.pathname, location.search])

  useEffect(() => () => clearTimeout(blurTimer.current), [])

  const submitSearch = (event) => {
    if (event?.preventDefault) event.preventDefault()
    clearTimeout(blurTimer.current)
    const trimmed = query.trim()
    if (!trimmed) return
    setFocused(false)
    setQuery('')
    searchRef.current?.blur()
    navigate(`/search?q=${encodeURIComponent(trimmed)}`, NAV_TRANSITION)
  }

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  const isDarkHero = false
  const isLightHero =
    location.pathname === '/' ||
    location.pathname === '/shop' ||
    location.pathname.startsWith('/shop/') ||
    location.pathname === '/offers'
  const isHeroPage = isDarkHero || isLightHero
  const isTransparent = isHeroPage && !scrolled
  const isLightTone = isTransparent && isDarkHero
  const tone = isLightTone ? 'light' : 'dark'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        isHeroPage && '-mb-[68px] lg:-mb-[76px]',
        isTransparent
          ? 'border-transparent bg-transparent shadow-none'
          : 'border-b border-brand-border/80 bg-white/95 backdrop-blur-md shadow-card',
      )}
    >
      <div className="shell-wide">
        <div className="flex h-[68px] items-center justify-between gap-4 lg:h-[76px]">
          {/* Left — mobile menu + wordmark */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openMobileMenu}
              aria-label="Open menu"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition lg:hidden',
                isLightTone
                  ? 'text-brand-ivory hover:bg-white/15'
                  : 'text-brand-charcoal hover:bg-neutral-100',
              )}
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <Logo tone={tone} />
          </div>

          {/* Centre — primary nav */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {MAIN_NAV.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                className={cn(
                  'relative whitespace-nowrap py-1 text-label-sm font-bold uppercase tracking-[0.14em] transition-colors',
                  isLightTone
                    ? (isActive(item.to) ? 'text-brand-gold' : 'text-brand-ivory/90 hover:text-white')
                    : (isActive(item.to) ? 'text-brand-goldDark' : 'text-ink-variant hover:text-brand-charcoal'),
                  item.accent === 'red' &&
                    !isActive(item.to) &&
                    (isLightTone ? 'text-red-300 hover:text-red-200' : 'text-tier-original hover:text-tier-original'),
                )}
              >
                {item.label}
                {item.badge && (
                  <span
                    className={cn(
                      'ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                      isLightTone ? 'bg-brand-gold/30 text-brand-gold' : 'bg-brand-gold/25 text-brand-goldDark',
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive(item.to) && (
                  <span
                    className={cn(
                      'absolute -bottom-[9px] left-0 right-0 h-px',
                      isLightTone ? 'bg-brand-gold' : 'bg-brand-goldDark',
                    )}
                    aria-hidden="true"
                  />
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right — instant search + actions */}
          <div className="flex items-center gap-1">
            <form onSubmit={submitSearch} className="relative hidden md:block">
              <Icon
                name="search"
                className={cn(
                  'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors',
                  isLightTone ? 'text-brand-ivory/70' : 'text-brand-muted',
                )}
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => {
                  clearTimeout(blurTimer.current)
                  setFocused(true)
                }}
                onBlur={(e) => {
                  if (e.relatedTarget && searchRef.current?.form?.contains(e.relatedTarget)) {
                    return
                  }
                  blurTimer.current = setTimeout(() => setFocused(false), 250)
                }}
                placeholder="Search perfumes, notes, brands…"
                aria-label="Search the catalogue"
                className={cn(
                  'w-44 rounded-full border py-2 pl-9 pr-3 text-body-sm outline-none transition-all xl:w-56',
                  isLightTone
                    ? 'border-white/20 bg-black/25 text-brand-ivory placeholder:text-white/60 focus:w-64 focus:border-brand-gold focus:bg-brand-charcoal/90 focus:text-white focus:ring-1 focus:ring-brand-gold'
                    : 'border-brand-border bg-white/80 text-brand-charcoal placeholder:text-brand-muted/80 focus:w-64 focus:border-brand-gold focus:bg-white focus:ring-1 focus:ring-brand-gold',
                )}
              />

              {showSuggestions && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] z-50 w-[22rem] animate-fade-in overflow-hidden rounded border border-brand-border bg-white shadow-overlay"
                >
                  {suggestions.length === 0 ? (
                    <p className="px-4 py-5 text-body-sm text-brand-muted">
                      No fragrance matches “{query.trim()}”. Try a note like <em>oud</em> or <em>bergamot</em>.
                    </p>
                  ) : (
                    <>
                      <ul className="max-h-[22rem] overflow-y-auto">
                        {suggestions.map((product) => (
                          <li key={product.id}>
                            <Link
                              to={`/product/${product.slug}`}
                              onClick={() => {
                                clearTimeout(blurTimer.current)
                                setFocused(false)
                                setQuery('')
                              }}
                              className="flex items-center gap-3 border-b border-brand-border/60 px-4 py-3 transition hover:bg-neutral-50"
                            >
                              <div className="h-11 w-11 shrink-0 overflow-hidden rounded border border-brand-border/50 bg-[#F9F9F9] p-0.5">
                                <FlaconStage
                                  tier={product.tier}
                                  seed={product.slug}
                                  label={product.name}
                                  image={productImage(product)}
                                  compact
                                />
                              </div>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-body-sm font-semibold text-brand-charcoal">
                                  {product.name}
                                </span>
                                <span className="mt-0.5 block truncate text-xs text-brand-muted">
                                  {product.brand} · {product.concentration}
                                </span>
                              </span>
                              <span className="shrink-0 text-body-sm font-semibold tabular-nums text-brand-charcoal">
                                {formatPrice(product.price)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={submitSearch}
                        className="flex w-full items-center justify-between gap-2 bg-neutral-50 px-4 py-3 text-label-sm font-bold uppercase text-brand-goldDark transition hover:bg-neutral-100"
                      >
                        See all results for “{query.trim()}”
                        <Icon name="arrow-right" className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </form>

            <button
              type="button"
              onClick={() => toggleSearch(true)}
              aria-label="Search"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition md:hidden',
                isLightTone
                  ? 'text-brand-ivory hover:bg-white/15 hover:text-brand-gold'
                  : 'text-brand-charcoal hover:bg-neutral-100 hover:text-brand-goldDark',
              )}
            >
              <Icon name="search" className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </button>

            <HeaderAction icon="user" label="My account" to="/account" tone={tone} />
            <HeaderAction icon="heart" label="Wishlist" to="/wishlist" badge={wishlistCount} tone={tone} />
            <HeaderAction icon="bag" label="Shopping bag" onClick={openCartDrawer} badge={cartCount} tone={tone} />
          </div>
        </div>
      </div>

      {/* Reading progress — one gold hairline along the bottom edge. Scaled
          rather than resized so it stays on the compositor. */}
      <div
        ref={progressRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px origin-left bg-brand-gold"
        style={{ transform: 'scaleX(0)' }}
      />
    </header>
  )
}

export default Header
