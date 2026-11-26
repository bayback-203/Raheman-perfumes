import cn from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

const THEMES = [
  {
    id: 'creamy',
    name: 'Creamy Ivory',
    subtitle: 'Existing warm white, bridal cream & champagne gold theme',
    previewStyle: {
      background:
        'radial-gradient(60% 70% at 15% 20%, rgba(251,226,232,0.55), transparent), radial-gradient(60% 70% at 85% 80%, rgba(247,232,200,0.6), transparent), #FFFDF9',
    },
    textClass: 'text-[#11100F]',
    subClass: 'text-[#6E6E6E]',
  },
  {
    id: 'midnight',
    name: 'Midnight Cosmic',
    subtitle: 'Deep starry midnight sky texture with luminous ivory & gold accents',
    previewStyle: {
      backgroundImage: "linear-gradient(135deg, rgba(6,13,29,0.35), rgba(8,18,40,0.25)), url('/theme-midnight.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    textClass: 'text-[#F7F2E8]',
    subClass: 'text-white/75',
  },
]

/**
 * Owner control to toggle storefront theme between Creamy Ivory (existing)
 * and Midnight Cosmic (dark starry sky).
 */
export function ThemeSelector({ value = 'creamy', onChange, disabled = false }) {
  const isMidnight = value === 'midnight'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-outline-variant/60 bg-surface-low/50 px-4 py-3">
        <div>
          <p className="text-body-sm font-semibold text-ink">
            Active Theme: <span className="text-brand-goldInk">{isMidnight ? 'Midnight Cosmic (Dark)' : 'Creamy Ivory (Light)'}</span>
          </p>
          <p className="text-[12px] text-ink-muted">
            Switch between your existing creamy storefront and the dark starry theme, then click Save.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={cn('text-label-sm font-bold uppercase', !isMidnight ? 'text-ink' : 'text-ink-muted')}>
            Creamy
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isMidnight}
            aria-label="Toggle dark cosmic website theme"
            disabled={disabled}
            onClick={() => onChange(isMidnight ? 'creamy' : 'midnight')}
            className={cn(
              'relative inline-flex h-7 w-13 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold disabled:cursor-not-allowed disabled:opacity-50',
              isMidnight ? 'bg-[#0B1730]' : 'bg-brand-gold',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                isMidnight ? 'translate-x-6' : 'translate-x-0.5',
              )}
            />
          </button>
          <span className={cn('text-label-sm font-bold uppercase', isMidnight ? 'text-ink' : 'text-ink-muted')}>
            Midnight
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {THEMES.map((theme) => {
          const selected = value === theme.id
          return (
            <button
              key={theme.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(theme.id)}
              className={cn(
                'group relative overflow-hidden rounded-lg border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold disabled:cursor-not-allowed disabled:opacity-60',
                selected
                  ? 'border-brand-gold ring-2 ring-brand-gold/40 shadow-md'
                  : 'border-outline-variant hover:border-brand-gold/60',
              )}
              style={theme.previewStyle}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={cn('font-serif text-lg font-semibold', theme.textClass)}>{theme.name}</p>
                  <p className={cn('mt-1 text-body-sm', theme.subClass)}>{theme.subtitle}</p>
                </div>
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                    selected
                      ? 'border-brand-gold bg-brand-gold text-brand-goldInk'
                      : 'border-outline-variant/60 bg-white/80 text-transparent',
                  )}
                >
                  <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ThemeSelector
