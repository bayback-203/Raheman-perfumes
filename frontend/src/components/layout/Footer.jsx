import { Link } from '@/components/ui/AppLink'
import cn from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import {
  FOOTER_COLUMNS,
  SOCIAL_LINKS,
  PAYMENT_BADGES,
  HOUSE_BLURB,
  COPYRIGHT,
  TAGLINE,
} from '@/data/content'
import { Logo } from './Brand'
import { useShowcase } from '@/store/catalogueStore'

export function Footer({ flush = false }) {
  const showcase = useShowcase()
  const badges = showcase.codEnabled ? PAYMENT_BADGES : PAYMENT_BADGES.filter((b) => b !== 'COD')
  return (
    <footer className={cn(flush ? 'mt-0' : 'mt-20', 'bg-brand-charcoal text-brand-cream')}>
      {/* Link columns */}
      <div className="shell grid gap-10 py-14 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Logo size="lg" />
          <p className="mt-5 max-w-sm text-body-sm leading-relaxed text-brand-cream/65">{HOUSE_BLURB}</p>

          <div className="mt-6 flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-brand-cream/70 transition hover:border-brand-gold hover:text-brand-gold"
              >
                <Icon name={social.icon} className="h-4 w-4" />
              </a>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <a
              href="tel:+919820112345"
              className="flex items-center gap-2 text-body-sm text-brand-cream/65 transition hover:text-brand-gold"
            >
              <Icon name="phone" className="h-3.5 w-3.5" />
              +91 98201 12345
            </a>
            <a
              href="mailto:atelier@rehmanperfume.in"
              className="flex items-center gap-2 text-body-sm text-brand-cream/65 transition hover:text-brand-gold"
            >
              <Icon name="mail" className="h-3.5 w-3.5" />
              atelier@rehmanperfume.in
            </a>
          </div>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.id} aria-label={column.title}>
            <h3 className="text-label-sm font-bold uppercase tracking-[0.18em] text-brand-gold">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={`${column.id}-${link.label}`}>
                  <Link
                    to={link.to}
                    className="text-body-sm text-brand-cream/65 transition-colors hover:text-brand-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-body-sm text-brand-cream/55">{COPYRIGHT}</p>
            <p className="text-body-sm text-brand-cream/45">{TAGLINE}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-label-sm font-bold uppercase text-brand-cream/45">We Accept</span>
            {badges.map((badge) => (
              <span
                key={badge}
                className={cn(
                  'rounded border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-cream/70',
                )}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
