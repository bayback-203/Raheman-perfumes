import { Link } from '@/components/ui/AppLink'
import cn from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

/** The wordmark, used by the header and the footer. */
export function Logo({ tone = 'dark', className, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Raheman Perfumes — home"
      className={cn('group flex flex-col leading-none', className)}
    >
      <span
        className={cn(
          'font-serif text-[26px] font-semibold tracking-[0.16em] transition-colors sm:text-[30px]',
          tone === 'light' ? 'text-brand-ivory' : 'text-brand-charcoal',
          'group-hover:text-brand-goldDark',
        )}
      >
        RAHEMAN
      </span>
      <span
        className={cn(
          'mt-1 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.42em]',
          tone === 'light' ? 'text-brand-gold' : 'text-brand-goldDark',
        )}
      >
        <span className={cn('h-px w-4', tone === 'light' ? 'bg-brand-gold/60' : 'bg-brand-goldDark/50')} />
        Perfumes
      </span>
    </Link>
  )
}

/** Small stroked icon button used across the header for account/wishlist/cart. */
export function HeaderAction({ icon, label, to, onClick, badge, tone = 'dark', className }) {
  const content = (
    <>
      <Icon name={icon} className="h-[18px] w-[18px]" strokeWidth={1.7} />
      {badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-goldDark px-1 text-[9px] font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </>
  )

  const classes = cn(
    'relative flex h-10 w-10 items-center justify-center rounded-full transition',
    tone === 'light'
      ? 'text-brand-ivory hover:bg-white/10 hover:text-brand-gold'
      : 'text-brand-charcoal hover:bg-neutral-100 hover:text-brand-goldDark',
    className,
  )

  if (to) {
    return (
      <Link to={to} aria-label={label} title={label} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={classes}>
      {content}
    </button>
  )
}

export default Logo
