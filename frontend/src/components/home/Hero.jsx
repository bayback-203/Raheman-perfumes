import { useEffect, useMemo, useState } from 'react'
import cn from '@/lib/cn'
import { Link } from '@/components/ui/AppLink'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PILLARS, OCCASIONS, GENDER_SEGMENTS } from '@/data/content'
import { resolveImageUrl } from '@/data/productImages'
import { TIERS } from '@/data/tiers'
import { useShowcase } from '@/store/catalogueStore'

const DEFAULT_HERO_IMAGE = '/hero-white.jpg?v=5'
const HERO_ROTATE_MS = 8500

const HERO_LINE_1 = 'Wear a scent that'
const HERO_LINE_2 = 'exists only for you.'
const HERO_TOTAL_CHARS = HERO_LINE_1.length + HERO_LINE_2.length
const TYPE_STEP_MS = 58
const TYPE_PERIOD_MS = 10000

/** Two-line luxury typewriter headline that replays cleanly every 10 seconds with zero layout shift. */
function TypewriterHeadline() {
  const [charCount, setCharCount] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-motion: reduce)') : null
    if (media?.matches) {
      setReducedMotion(true)
      setCharCount(HERO_TOTAL_CHARS)
      return undefined
    }

    let stepTimer = null
    const runCycle = () => {
      clearInterval(stepTimer)
      let current = 0
      setCharCount(0)
      stepTimer = setInterval(() => {
        current += 1
        setCharCount(current)
        if (current >= HERO_TOTAL_CHARS) {
          clearInterval(stepTimer)
        }
      }, TYPE_STEP_MS)
    }

    runCycle()
    const cycleTimer = setInterval(runCycle, TYPE_PERIOD_MS)

    return () => {
      clearInterval(stepTimer)
      clearInterval(cycleTimer)
    }
  }, [])

  const shownCount = reducedMotion ? HERO_TOTAL_CHARS : charCount
  const line1Text = HERO_LINE_1.slice(0, shownCount)
  const line2Text = HERO_LINE_2.slice(0, Math.max(0, shownCount - HERO_LINE_1.length))
  const cursorOnLine1 = !reducedMotion && shownCount <= HERO_LINE_1.length
  const cursorOnLine2 = !reducedMotion && shownCount > HERO_LINE_1.length

  const cursor = (
    <span
      aria-hidden="true"
      className="ml-1 inline-block h-[0.88em] w-[2px] translate-y-[0.06em] animate-pulse bg-brand-goldDark"
    />
  )

  return (
    <h1
      className="relative font-cormorant text-[36px] font-bold leading-[1.12] tracking-tight text-brand-charcoal sm:text-[52px] lg:text-display-lg"
      aria-label={`${HERO_LINE_1} ${HERO_LINE_2}`}
    >
      {/* Hidden full text locks the two-line height so surrounding layout never shifts while typing */}
      <span className="invisible select-none" aria-hidden="true">
        {HERO_LINE_1}
        <span className="mt-1 block font-cormorant font-bold">{HERO_LINE_2}</span>
      </span>

      <span className="absolute inset-0" aria-hidden="true">
        {line1Text}
        {cursorOnLine1 && cursor}
        <span className="mt-1 block font-cormorant font-bold text-brand-goldDark">
          {line2Text}
          {cursorOnLine2 && cursor}
        </span>
      </span>
    </h1>
  )
}

/**
 * Pure-white editorial hero. The left column holds crisp dark typography over
 * negative studio white; the right column features the crystal flacon plate.
 * Supports 1-3 admin-configured hero images with automatic 8.5s rotation.
 */
export function Hero() {
  const showcase = useShowcase()

  const slides = useMemo(() => {
    const custom = Array.isArray(showcase?.heroImages)
      ? showcase.heroImages.map(resolveImageUrl).filter(Boolean).slice(0, 3)
      : []
    return custom.length > 0 ? custom : [DEFAULT_HERO_IMAGE]
  }, [showcase?.heroImages])

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return undefined
    const media = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-motion: reduce)') : null
    if (media?.matches) return undefined

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, HERO_ROTATE_MS)
    return () => clearInterval(timer)
  }, [slides.length, activeIndex])

  const safeIndex = activeIndex % slides.length
  const activeSrc = slides[safeIndex]
  const isCustomActive = activeSrc !== DEFAULT_HERO_IMAGE

  return (
    <section className="relative flex flex-col justify-between overflow-hidden border-b border-brand-border bg-white text-brand-charcoal md:min-h-screen md:min-h-[100dvh]">
      {/* Custom uploaded hero images: clean full-bleed widescreen plate with soft left/top white readability scrim */}
      <div
        className="pointer-events-none absolute inset-0 hidden overflow-hidden bg-white md:block"
        aria-hidden="true"
      >
        {slides.map((src, index) => {
          if (src === DEFAULT_HERO_IMAGE) return null
          const active = index === safeIndex
          return (
            <img
              key={`hero-custom-${src}-${index}`}
              src={src}
              alt="Raheman Perfumes hero showcase"
              decoding="async"
              referrerPolicy="no-referrer"
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out',
                active ? 'opacity-100' : 'opacity-0',
              )}
            />
          )
        })}
        {isCustomActive && (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.36) 28%, rgba(255,255,255,0.12) 48%, rgba(255,255,255,0) 66%)',
              }}
            />
            <div
              className="absolute inset-x-0 top-0 h-24"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.2) 55%, rgba(255,255,255,0) 100%)',
              }}
            />
          </>
        )}
      </div>

      {/* Default studio hero left backdrop (tablet/desktop) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 top-0 hidden items-end justify-start overflow-hidden transition-opacity duration-1000 md:flex',
          isCustomActive ? 'opacity-0' : 'bg-white opacity-100',
        )}
        aria-hidden="true"
      >
        <div
          className="relative w-auto aspect-[1376/768]"
          style={{ height: 'min(100%, 55.814vw)' }}
        >
          {slides.map((src, index) => {
            if (src !== DEFAULT_HERO_IMAGE) return null
            const active = index === safeIndex
            return (
              <img
                key={`hero-left-${src}-${index}`}
                src={src}
                alt=""
                decoding="async"
                className={cn(
                  'absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out',
                  active ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                  WebkitMaskImage:
                    'linear-gradient(to right, black 8%, rgba(0,0,0,0.72) 22%, rgba(0,0,0,0.28) 33%, transparent 43%)',
                  maskImage:
                    'linear-gradient(to right, black 8%, rgba(0,0,0,0.72) 22%, rgba(0,0,0,0.28) 33%, transparent 43%)',
                }}
              />
            )
          })}
          <div className="absolute inset-x-0 top-0 h-[14%] bg-gradient-to-b from-white to-transparent" />
        </div>
      </div>

      {/* Default studio hero right crystal flacon (tablet/desktop) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 top-0 hidden items-end justify-end overflow-hidden transition-opacity duration-1000 md:left-[43%] md:flex',
          isCustomActive ? 'opacity-0' : 'opacity-100',
        )}
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 10%, black 22%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 10%, black 22%)',
        }}
        aria-hidden="true"
      >
        <div
          className="relative h-full w-auto shrink-0 aspect-[1376/768] md:h-[min(115%,62vw)] lg:h-[min(122%,58vw)]"
        >
          {slides.map((src, index) => {
            if (src !== DEFAULT_HERO_IMAGE) return null
            const active = index === safeIndex
            return (
              <img
                key={`hero-right-${src}-${index}`}
                src={src}
                alt="Luxury crystal perfume bottle on white marble framed by ornamental grass, roses, jasmine, blood orange, citrus, fig, aqua splash, oud wood, and cinnamon sticks"
                decoding="async"
                className={cn(
                  'absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
            )
          })}
        </div>
      </div>

      {/* Subtle localized mist glow ONLY behind left-column typography on tablet/desktop — never washes out the crystal bottle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[4%] top-[18%] hidden h-72 w-72 rounded-full bg-[#FADAE3]/35 blur-3xl md:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[24%] bottom-[16%] hidden h-64 w-64 rounded-full bg-[#F4E0B5]/30 blur-3xl md:block"
      />
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          background: isCustomActive
            ? 'radial-gradient(34% 46% at 25% 50%, rgba(255,253,249,0.42) 0%, rgba(255,251,246,0.25) 45%, rgba(255,255,255,0.08) 76%, rgba(255,255,255,0) 100%)'
            : 'radial-gradient(34% 46% at 25% 50%, rgba(255,253,249,0.92) 0%, rgba(255,251,246,0.68) 45%, rgba(255,255,255,0.2) 76%, rgba(255,255,255,0) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-1 flex-col justify-center">
        {/* Mobile full-bleed background for default studio hero */}
        {!isCustomActive && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-0 flex items-end overflow-hidden md:hidden"
            aria-hidden="true"
          >
            {slides.map((src, index) => {
              if (src !== DEFAULT_HERO_IMAGE) return null
              const active = index === safeIndex
              return (
                <img
                  key={`hero-mobile-${src}-${index}`}
                  src={src}
                  alt="Luxury crystal perfume bottle on white marble framed by roses, citrus, fig, oud wood, and cinnamon sticks"
                  decoding="async"
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-[104vw] max-h-[460px] w-full object-cover object-right-bottom transition-opacity duration-1000 ease-in-out',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                  style={{
                    WebkitMaskImage:
                      'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 14%, black 26%)',
                    maskImage:
                      'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 14%, black 26%)',
                  }}
                />
              )
            })}
          </div>
        )}

        {/* Mobile dedicated landscape frame FIRST (above text), keeping desktop layout completely untouched */}
        {isCustomActive && (
          <div className="pt-[72px] sm:pt-[80px] md:hidden" aria-hidden="true">
            <div className="relative w-full aspect-[16/10] overflow-hidden bg-white sm:aspect-[16/9]">
              {slides.map((src, index) => {
                if (src === DEFAULT_HERO_IMAGE) return null
                const active = index === safeIndex
                return (
                  <img
                    key={`hero-mobile-custom-${src}-${index}`}
                    src={src}
                    alt="Raheman Perfumes hero showcase"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className={cn(
                      'absolute inset-0 h-full w-full object-cover object-right transition-opacity duration-1000 ease-in-out',
                      active ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                )
              })}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>
        )}

        <div
          className={cn(
            'shell relative z-10 grid gap-8 text-center md:my-auto md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12 md:pb-16 md:pt-28 md:text-left lg:gap-16 lg:pb-24 lg:pt-36',
            isCustomActive
              ? cn('pt-5 sm:pt-6', slides.length > 1 ? 'pb-14 sm:pb-16' : 'pb-10 sm:pb-12')
              : 'pb-[86vw] pt-[104px] sm:pb-[380px] sm:pt-32',
          )}
        >
          <div className="animate-rise-lux">
            <TypewriterHeadline />

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:mt-7 sm:gap-3 md:mt-8 md:justify-start">
              <Button variant="primary" size="lg" to="/shop" className="px-5 py-3 text-xs sm:px-7 sm:py-3.5 sm:text-label-md">
                Shop The Collection
                <Icon name="arrow-right" className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="hidden md:block" aria-hidden="true" />
        </div>
      </div>

      {slides.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-brand-border/60 bg-white/80 px-3 py-1.5 backdrop-blur-xs"
          role="tablist"
          aria-label="Hero banner slides"
        >
          {slides.map((_, index) => {
            const active = index === safeIndex
            return (
              <button
                key={`hero-dot-${index}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Show hero slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 cursor-pointer',
                  active ? 'w-6 bg-brand-charcoal' : 'w-2 bg-brand-charcoal/25 hover:bg-brand-charcoal/50',
                )}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

/** The four main category tiles: Perfumes, Attars, Combos, Bakhoor. */
export function Pillars() {
  return (
    <section className="bridal-canvas relative border-b border-[#EFE3D0] py-14 lg:py-16">
      <div className="shell">
        <SectionHeading title="Categories" />

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.id}
              to={pillar.to}
              aria-label={pillar.title}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg border border-[#EFE3CF] bg-white">
                <img
                  src={pillar.photo}
                  alt={pillar.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-3 text-left text-[15px] font-medium text-brand-charcoal">
                {pillar.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Three gender showcase tiles: Men, Women, Unisex. */
export function GenderShowcase() {
  return (
    <section className="bridal-canvas relative border-b border-[#EFE3D0] py-14 lg:py-16">
      <div className="shell">
        <h2 className="text-center font-cormorant text-2xl font-semibold tracking-tight text-brand-charcoal sm:text-3xl lg:text-headline-xl">
          Shop by Gender
        </h2>

        <div className="mt-8 grid grid-cols-3 gap-3 sm:mt-10 sm:gap-5 lg:gap-6">
          {GENDER_SEGMENTS.map((segment) => (
            <Link
              key={segment.id}
              to={segment.to}
              aria-label={`Shop ${segment.label} perfumes`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-[#EFE3CF] bg-[#F8F4EE] shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/70 hover:shadow-[0_18px_36px_-12px_rgba(32,22,12,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold sm:aspect-square"
            >
              <img
                src={segment.image}
                alt={segment.label}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
              />
              <div className="absolute inset-x-2 bottom-3 flex items-center justify-center sm:inset-x-5 sm:bottom-5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/95 px-3.5 py-1.5 font-manrope text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-charcoal shadow-md backdrop-blur-xs transition-colors duration-200 group-hover:border-brand-gold/60 group-hover:bg-brand-charcoal group-hover:text-[#F6E2B3] sm:px-6 sm:py-2 sm:text-xs">
                  {segment.label}
                  <Icon name="arrow-right" className="hidden h-3.5 w-3.5 sm:inline-block" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Six occasion tiles: Everyday, Office, Party, Sports, Date Night, College. */
export function OccasionGrid() {
  return (
    <section className="relative border-b border-[#EFE3D0] bg-white py-14 lg:py-16">
      <div className="shell">
        <h2 className="text-center font-cormorant text-2xl font-semibold tracking-tight text-brand-charcoal sm:text-3xl lg:text-headline-xl">
          Shop for Occasion
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3.5 sm:mt-10 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-5">
          {OCCASIONS.map((occasion) => (
            <Link
              key={occasion.id}
              to={occasion.to}
              aria-label={`Shop ${occasion.label} perfumes`}
              className="group relative block aspect-square overflow-hidden rounded-2xl border border-[#EFE3CF] bg-[#F8F4EE] shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/70 hover:shadow-[0_16px_32px_-12px_rgba(32,22,12,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <img
                src={occasion.image}
                alt={occasion.label}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 via-black/15 to-transparent"
              />
              <div className="absolute inset-x-3 bottom-3.5 flex justify-center sm:bottom-4">
                <span className="inline-block whitespace-nowrap rounded-md border border-brand-border/70 bg-white/95 px-3.5 py-1.5 font-manrope text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-charcoal shadow-md backdrop-blur-xs transition-colors duration-200 group-hover:border-brand-gold/60 group-hover:bg-brand-charcoal group-hover:text-[#F6E2B3]">
                  {occasion.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Tier explainer strip — the four provenance levels in one glance. */
export function ProvenanceStrip() {
  return (
    <section className="border-y border-brand-border bg-white">
      <div className="shell py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(TIERS).map((tier) => (
            <div key={tier.id} className="flex gap-3.5">
              <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', tier.surface)}>
                <Icon name="verified" className={cn('h-4 w-4', tier.text)} strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-body-md font-semibold text-brand-charcoal">
                  {tier.label}
                  <span className="ml-2 text-label-sm font-bold uppercase text-brand-muted">{tier.tagline}</span>
                </h3>
                <p className="mt-1 text-body-sm leading-relaxed text-brand-muted">{tier.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
