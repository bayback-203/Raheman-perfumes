import { useSearchParams } from 'react-router-dom'
import { Link } from '@/components/ui/AppLink'
import cn from '@/lib/cn'

const BANNER_IMAGES = {
  originals: '/pillar-originals.jpg?v=4',
  inspired: '/pillar-inspired.jpg?v=4',
  celebrities: '/pillar-originals.jpg?v=4',
  celebrity: '/pillar-originals.jpg?v=4',
  'celebrity-perfumes': '/pillar-originals.jpg?v=4',
  'car-perfumes': '/pillar-originals.jpg?v=4',
  'car-perfume': '/pillar-originals.jpg?v=4',
  car: '/pillar-originals.jpg?v=4',
  attars: '/pillar-attars.jpg?v=4',
  attar: '/pillar-attars.jpg?v=4',
  combos: '/pillar-combos.jpg?v=4',
  combo: '/pillar-combos.jpg?v=4',
  bakhoor: '/pillar-bakhoor.jpg?v=3',
  'best-sellers': '/offer-white.jpg?v=3',
  bestsellers: '/offer-white.jpg?v=3',
  bestseller: '/offer-white.jpg?v=3',
  'new-arrivals': '/pillar-inspired.jpg?v=4',
  new: '/pillar-inspired.jpg?v=4',
  unisex: '/cat-unisex.jpg?v=3',
  men: '/pillar-originals.jpg?v=4',
  women: '/hero-white.jpg?v=5',
  everyday: '/occasion-everyday.jpg',
  office: '/occasion-office.jpg',
  party: '/occasion-party.jpg',
  sports: '/occasion-sports.jpg',
  'date-night': '/occasion-date-night.jpg',
  college: '/occasion-college.jpg',
  default: '/hero-white.jpg?v=5',
}

/**
 * Shared hero banner used across the Shop, Original, and Best Sellers pages.
 */
export function ShopBanner({ collection, title, eyebrow, imageOverride }) {
  const [searchParams] = useSearchParams()
  const sort = searchParams.get('sort')
  const visualSrc = imageOverride || BANNER_IMAGES[collection] || BANNER_IMAGES.default

  const pills = [
    { label: 'All', to: '/shop', badgeImage: '/badges/all.png', active: !collection && !sort },
    {
      label: 'Bestseller',
      to: '/shop/best-sellers',
      badgeImage: '/badges/bestseller.png',
      active: collection === 'best-sellers' || collection === 'bestsellers' || collection === 'bestseller',
    },
    {
      label: 'Originals',
      to: '/shop/originals',
      badgeImage: '/badges/original.png',
      active: collection === 'originals' || collection === 'original',
    },
    {
      label: 'Inspired',
      to: '/shop/inspired',
      badgeImage: '/badges/inspired.png',
      active: collection === 'inspired',
    },
    {
      label: 'Pure Attars',
      to: '/shop/attars',
      badgeImage: '/badges/attar.png',
      active: collection === 'attars' || collection === 'attar',
    },
    {
      label: 'Celebrities',
      to: '/shop/celebrities',
      badgeImage: '/badges/celebrity.png',
      active: collection === 'celebrities' || collection === 'celebrity' || collection === 'celebrity-perfumes',
    },
    {
      label: 'Car Perfumes',
      to: '/shop/car-perfumes',
      badgeImage: '/badges/car-perfume.png',
      active: collection === 'car-perfumes' || collection === 'car-perfume' || collection === 'car',
    },
    {
      label: 'Combos',
      to: '/combos',
      badgeImage: '/badges/combo.png',
      active: collection === 'combos' || collection === 'combo',
    },
    {
      label: 'Bakhoor',
      to: '/shop/bakhoor',
      badgeImage: '/badges/bakhoor.png',
      active: collection === 'bakhoor',
    },
    {
      label: 'New Arrivals',
      to: '/shop/new-arrivals',
      badgeImage: '/badges/new-arrivals.png',
      active: collection === 'new-arrivals' || collection === 'new' || sort === 'newest',
    },
  ]

  return (
    <section className="bridal-banner relative overflow-hidden text-brand-charcoal">
      {/* Ambient rose-pearl & champagne-gold soft glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#FAD9E2]/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[38%] -bottom-16 h-60 w-72 rounded-full bg-[#F2DFB6]/35 blur-3xl"
      />

      {/* Right-hand editorial perfume composition blended smoothly into bridal ivory silk */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] overflow-hidden md:block lg:w-[44%]"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 18%, black 55%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 18%, black 55%)',
        }}
      >
        <img
          src={visualSrc}
          alt=""
          decoding="async"
          className="h-full w-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#FFFBF6]/30" />
      </div>

      <div className="shell relative z-20 pb-3.5 pt-[84px] sm:pb-4 sm:pt-[94px] lg:pb-4.5 lg:pt-[108px]">
        {eyebrow && (
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-goldDark sm:text-label-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-goldDark animate-pulse" aria-hidden="true" />
            {eyebrow}
          </p>
        )}

        <h1 className="mt-1 font-cormorant text-2xl font-medium tracking-tight text-brand-charcoal sm:text-3xl lg:text-4xl">
          {title}
        </h1>

        <div className="no-scrollbar -mx-4 mt-3 flex flex-nowrap items-center gap-2.5 overflow-x-auto px-4 pb-1 pt-1 sm:mx-0 sm:mt-3.5 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0">
          {pills.map((pill) => {
            const isActive = pill.active
            return (
              <Link
                key={pill.label}
                to={pill.to}
                aria-label={pill.label}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold',
                  isActive
                    ? 'scale-[1.04] opacity-100 ring-2 ring-brand-gold ring-offset-2 drop-shadow-md'
                    : 'opacity-85 hover:scale-[1.04] hover:opacity-100',
                )}
              >
                <img
                  src={pill.badgeImage}
                  alt={pill.label}
                  loading="eager"
                  decoding="async"
                  className="h-7 w-auto select-none object-contain sm:h-8"
                />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Soft faded separation: softly dissolves at both edges so it mixes seamlessly into the catalogue */}
      <div
        aria-hidden="true"
        className="relative z-10 mx-auto h-[1px] w-full max-w-[1500px] bg-gradient-to-r from-transparent via-[#D4B982]/60 to-transparent"
      />
    </section>
  )
}

export default ShopBanner

