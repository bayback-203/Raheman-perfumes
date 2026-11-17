import { useEffect, useState } from 'react'
import cn from '@/lib/cn'
import { Link } from '@/components/ui/AppLink'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PILLARS, ANNOUNCEMENTS } from '@/data/content'
import { TIERS } from '@/data/tiers'

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
      className="relative text-[34px] font-medium leading-[1.12] tracking-tight text-brand-charcoal sm:text-[46px] lg:text-display-lg"
      aria-label={`${HERO_LINE_1} ${HERO_LINE_2}`}
    >
      {/* Hidden full text locks the two-line height so surrounding layout never shifts while typing */}
      <span className="invisible select-none" aria-hidden="true">
        {HERO_LINE_1}
        <span className="mt-1 block font-semibold">{HERO_LINE_2}</span>
      </span>

      <span className="absolute inset-0" aria-hidden="true">
        {line1Text}
        {cursorOnLine1 && cursor}
        <span className="mt-1 block font-semibold text-brand-goldDark">
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
 */
export function Hero() {
  return (
    <section className="relative flex min-h-screen min-h-[100dvh] flex-col justify-between overflow-hidden border-b border-brand-border bg-white text-brand-charcoal">
      {/* Ambient botanical left backdrop (tablet/desktop): wet vetiver grass, pampas plumes, ferns & sunlit leaf shadows */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[52px] top-[64px] hidden items-end justify-start overflow-hidden bg-white md:flex lg:top-[68px]"
        aria-hidden="true"
      >
        <div
          className="relative w-auto aspect-[1376/768]"
          style={{ height: 'min(100%, 55.814vw)' }}
        >
          <img
            src="/hero-white.jpg?v=3"
            alt=""
            decoding="async"
            className="h-full w-full object-contain"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, black 8%, rgba(0,0,0,0.72) 22%, rgba(0,0,0,0.28) 33%, transparent 43%)',
              maskImage:
                'linear-gradient(to right, black 8%, rgba(0,0,0,0.72) 22%, rgba(0,0,0,0.28) 33%, transparent 43%)',
            }}
          />
          <div className="absolute inset-x-0 top-0 h-[14%] bg-gradient-to-b from-white to-transparent" />
        </div>
      </div>

      {/* Right crystal flacon & note symphony (tablet/desktop): razor-sharp with zero washout veil */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[52px] top-[64px] hidden items-end justify-end overflow-hidden md:left-[43%] md:flex lg:top-[68px]"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 10%, black 22%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 10%, black 22%)',
        }}
        aria-hidden="true"
      >
        <div
          className="relative h-full w-auto shrink-0 aspect-[1376/768] md:h-[min(115%,62vw)] lg:h-[min(124%,60vw)]"
        >
          <img
            src="/hero-white.jpg?v=3"
            alt="Luxury crystal perfume bottle on white marble framed by ornamental grass, roses, jasmine, blood orange, citrus, fig, aqua splash, oud wood, and cinnamon sticks"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
        {/* Feather the upper edge just under the sticky header without reaching the bottle cap */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/95 to-transparent" />
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
          background:
            'radial-gradient(34% 46% at 25% 50%, rgba(255,253,249,0.92) 0%, rgba(255,251,246,0.68) 45%, rgba(255,255,255,0.2) 76%, rgba(255,255,255,0) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="shell relative my-auto grid gap-8 pb-8 pt-24 sm:pt-28 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12 md:pb-16 lg:gap-16 lg:pb-24 lg:pt-36">
        <div className="animate-rise-lux">
          <TypewriterHeadline />

          <p className="mt-4 hidden max-w-xl text-pretty text-body-md leading-relaxed text-brand-muted sm:mt-6 sm:block sm:text-body-lg">
            Original designer perfumes, inspired blends and pure attars —
            made with pure French oils for a long-lasting scent.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-9">
            <Button variant="primary" size="lg" to="/shop">
              Shop The Collection
              <Icon name="arrow-right" className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" to="/combos">
              Combos
            </Button>
          </div>
        </div>

        {/* Mobile visual stage: crisp, un-blurred full-clarity flacon below CTA; on md+ reserves space over the right backdrop */}
        <div className="relative mx-auto w-full max-w-md md:h-0">
          <img
            src="/hero-white.jpg?v=3"
            alt="Luxury crystal perfume bottle on white marble framed by roses, citrus, fig, oud wood, and cinnamon sticks"
            decoding="async"
            className="w-full rounded-xl object-contain md:hidden"
          />
        </div>
      </div>

      {/* Trust ribbon */}
      <div className="relative border-t border-[#EBDEC9] bg-gradient-to-r from-[#FFFDF9]/95 via-[#FDF4F6]/90 to-[#FBF3E4]/95 backdrop-blur-xs">
        <div className="shell-wide grid grid-cols-2 divide-x divide-[#EDE0CC] lg:grid-cols-4">
          {ANNOUNCEMENTS.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-4 lg:justify-center">
              <Icon name={item.icon} className="h-4 w-4 shrink-0 text-brand-goldDark" />
              <span className="text-label-sm font-semibold uppercase tracking-[0.12em] text-brand-charcoal">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** The four main category tiles: Perfumes, Attars, Combos, Bakhoor. */
export function Pillars() {
  return (
    <section className="bridal-canvas relative border-b border-[#EFE3D0] py-14 lg:py-16">
      <div className="shell">
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
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
