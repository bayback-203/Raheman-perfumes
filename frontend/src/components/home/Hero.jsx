import { useEffect, useState } from 'react'
import cn from '@/lib/cn'
import { Link } from '@/components/ui/AppLink'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { FlaconStage } from '@/components/product/FlaconArt'
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
      {/* Ambient botanical left backdrop: wet vetiver grass, pampas plumes, ferns & sunlit leaf shadows */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[52px] top-[64px] flex items-end justify-start overflow-hidden bg-white lg:top-[68px]"
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

      {/* Right crystal flacon & note symphony scaled to fill the right visual stage cleanly below the header */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[52px] top-[64px] flex items-end justify-end overflow-hidden lg:left-[43%] lg:top-[68px]"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 10%, black 22%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 10%, black 22%)',
        }}
        aria-hidden="true"
      >
        <div
          className="relative h-full w-auto shrink-0 aspect-[1376/768] lg:h-[min(124%,60vw)]"
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

      {/* Full-bleed edge-free mist glow centered behind typography — never clipped to a box */}
      <div className="pointer-events-none absolute inset-0 bg-white/75 lg:hidden" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[4%] top-[18%] h-72 w-72 rounded-full bg-[#FADAE3]/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[24%] bottom-[16%] h-64 w-64 rounded-full bg-[#F4E0B5]/30 blur-3xl"
      />
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            'radial-gradient(34% 46% at 25% 50%, rgba(255,253,249,0.92) 0%, rgba(255,251,246,0.68) 45%, rgba(255,255,255,0.2) 76%, rgba(255,255,255,0) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="shell relative my-auto grid gap-12 pb-16 pt-24 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-36">
        <div className="animate-rise-lux">
          <TypewriterHeadline />

          <p className="mt-6 max-w-xl text-pretty text-body-lg leading-relaxed text-brand-muted">
            Original designer perfumes, inspired blends and pure attars —
            made with pure French oils for a long-lasting scent.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" to="/shop">
              Shop The Collection
              <Icon name="arrow-right" className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" to="/combos">
              Combos
            </Button>
          </div>
        </div>

        {/* Right-hand plate. The grid reserves this column over the crystal bottle. */}
        <div className="relative mx-auto w-full max-w-md" aria-hidden="true" />
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

/** The three shopping pillars: Originals, Inspired/Mixing, Attars. */
export function Pillars() {
  const toneStyles = {
    dark: 'bg-brand-charcoal text-brand-ivory border-neutral-800',
    gold: 'bg-brand-gold text-brand-charcoal border-brand-goldDark/30',
    emerald: 'bg-tier-custom text-brand-ivory border-emerald-900',
    amber: 'bg-tier-mixed text-brand-ivory border-amber-950',
    burgundy: 'bg-tier-original text-brand-ivory border-red-950',
  }
  const eyebrowTone = {
    dark: 'text-brand-gold',
    gold: 'text-brand-charcoal/70',
    emerald: 'text-emerald-300',
    amber: 'text-amber-300',
    burgundy: 'text-brand-gold',
  }
  const bodyTone = {
    dark: 'text-brand-cream/70',
    gold: 'text-brand-charcoal/80',
    emerald: 'text-emerald-50/75',
    amber: 'text-amber-50/80',
    burgundy: 'text-rose-50/75',
  }
  const buttonVariant = {
    dark: 'gold',
    gold: 'primary',
    emerald: 'outline-inverse',
    amber: 'gold',
    burgundy: 'gold',
  }

  // A photographed card puts a charcoal veil over its picture, so its copy is
  // light whatever the pillar's flat tone would have called for — the `gold`
  // tone's near-black type, in particular, would vanish into the veil. The tone
  // maps only dress a card that has no picture to stand on.
  const eyebrowFor = (pillar) =>
    pillar.photo ? 'text-brand-gold' : (eyebrowTone[pillar.tone] ?? eyebrowTone.dark)
  const bodyFor = (pillar) =>
    pillar.photo ? 'text-brand-cream/75' : (bodyTone[pillar.tone] ?? bodyTone.dark)
  const buttonFor = (pillar) =>
    pillar.photo ? 'gold' : (buttonVariant[pillar.tone] ?? buttonVariant.dark)

  return (
    <section className="bridal-canvas relative border-b border-[#EFE3D0] py-16 lg:py-20">
      <div className="shell">
      {/* All five pillars share one row from `lg`, each card a fixed 3:4 box.
          Five across is a narrow column — 227px at the widest, so ~303px tall
          on a 3:4 — and that is the whole budget. Everything in the card is
          sized to fit inside it: one-line eyebrows, the description run in
          full, and the note/CTA pair stacked rather than set side by side,
          which the three-up design could afford and five-up cannot.

          The picture is the card, so the copy has to earn its place on top of
          it: it arrives on hover, and the description is unclamped because
          there is no flacon below it competing for the space. A pillar without
          a picture falls back to a flat tone, a clamped description and a
          ghosted flacon, which is what the five-across sizing was built for.

          The ratio is held from `xl` only. At `lg` the cards are 179px wide,
          so a 3:4 box would be 239px tall — too short for the title, copy
          and CTA together, and `overflow-hidden` would crop the button off.
          Below `xl` the cards keep a natural height instead; they are still
          uniform, because grid stretches every card in a row to the tallest. */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 xl:gap-5">
        {PILLARS.map((pillar) => (
          <Link
            key={pillar.id}
            to={pillar.cta.to}
            aria-label={`${pillar.title} — ${pillar.cta.label}`}
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-xl border p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold lg:min-h-[21rem] lg:p-5 xl:aspect-[3/4] xl:min-h-0',
              pillar.photo
                ? 'border-[#E8DAC2] bg-white text-brand-ivory shadow-card hover:border-brand-gold hover:shadow-[0_18px_38px_-12px_rgba(200,155,60,0.32)]'
                : (toneStyles[pillar.tone] ?? toneStyles.dark),
            )}
          >
            {/* A photographed pillar wears its picture as the card's ground,
                bare: no tint over it, and no dot grid, which over a photograph
                would read as a screen door. The veil arrives with the copy
                instead, and is the only thing standing between ivory type and
                a bright frame. */}
            {pillar.photo ? (
              <>
                <img
                  src={pillar.photo}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                />
                <div
                  className="pillar-veil pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-charcoal/95 via-brand-charcoal/75 to-brand-charcoal/85"
                  aria-hidden="true"
                />
              </>
            ) : null}

            <div className={cn('relative', pillar.photo && 'pillar-copy')}>
              <p className={cn('text-label-sm font-bold uppercase tracking-[0.18em]', eyebrowFor(pillar))}>
                {pillar.eyebrow}
              </p>
              <h2 className="mt-2.5 text-balance text-headline-sm font-medium xl:text-headline-md">{pillar.title}</h2>
              <p
                className={cn(
                  'mt-2.5 text-body-sm leading-relaxed',
                  // A photographed pillar has the room the others spend on a
                  // flacon, so its copy runs the full length instead of being
                  // clamped to whatever fits beside one — nothing on the card
                  // ends in an ellipsis.
                  pillar.photo ? 'text-pretty' : 'lg:line-clamp-3 xl:line-clamp-2 xl:text-body-md',
                  bodyFor(pillar),
                )}
              >
                {pillar.description}
              </p>
            </div>

            {/* A ghosted bottle standing in for the design's product placeholder.
                The photographed pillar skips it: its flacon is already in the
                frame behind the copy. */}
            {!pillar.photo && (
              <div className="relative mx-auto mt-4 h-24 w-20 opacity-90 lg:h-20 lg:w-16 xl:h-16 xl:w-14">
                <FlaconStage
                  tier={pillar.tier}
                  seed={pillar.id}
                  label={pillar.placeholder}
                  compact
                  className="border-white/10"
                />
              </div>
            )}

            <div className={cn('relative mt-auto flex flex-col gap-2.5 pt-4', pillar.photo && 'pillar-copy')}>
              <span className={cn('text-label-sm font-bold uppercase tracking-wider', eyebrowFor(pillar))}>
                {pillar.note}
              </span>
              <span
                className={cn(
                  'btn btn-sm w-full pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]',
                  buttonFor(pillar) === 'gold' && 'btn-gold',
                  buttonFor(pillar) === 'primary' && 'btn-primary',
                  buttonFor(pillar) === 'outline-inverse' && 'btn-outline-inverse',
                )}
              >
                {pillar.cta.label}
                <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
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
