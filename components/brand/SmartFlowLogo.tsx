'use client'

type SmartFlowLogoProps = {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  stacked?: boolean
  className?: string
}

const sizeMap = {
  sm: {
    mark: 'h-9 w-9',
    title: 'text-sm',
    subtitle: 'text-[10px]',
    gap: 'gap-2.5',
  },
  md: {
    mark: 'h-11 w-11',
    title: 'text-base',
    subtitle: 'text-[11px]',
    gap: 'gap-3',
  },
  lg: {
    mark: 'h-14 w-14',
    title: 'text-[1.375rem]',
    subtitle: 'text-xs',
    gap: 'gap-4',
  },
} as const

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function SmartFlowLogo({
  size = 'md',
  showWordmark = true,
  stacked = false,
  className,
}: SmartFlowLogoProps) {
  const styles = sizeMap[size]

  return (
    <div
      className={cn(
        'flex items-center',
        stacked ? 'flex-col text-center' : '',
        styles.gap,
        className
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(155deg,rgba(196,167,109,0.28),rgba(27,37,58,0.96)_40%,rgba(14,21,36,1))] shadow-[0_16px_40px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/20',
          styles.mark
        )}
      >
        <div className="absolute inset-[1px] rounded-[calc(1.35rem-1px)] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_36%)]" />
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className="relative h-full w-full"
        >
          <defs>
            <linearGradient id="sf-gold" x1="14" y1="10" x2="48" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f1dfb4" />
              <stop offset="52%" stopColor="#d5b06a" />
              <stop offset="100%" stopColor="#8d6a35" />
            </linearGradient>
          </defs>

          <path
            d="M18 25.5 32 14l14 11.5"
            fill="none"
            stroke="url(#sf-gold)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 27.5h26v18.5a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4z"
            fill="none"
            stroke="url(#sf-gold)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M21.5 30.5 32 38l10.5-7.5"
            fill="none"
            stroke="url(#sf-gold)"
            strokeWidth="3.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
          <path
            d="M24 45.5h10"
            fill="none"
            stroke="url(#sf-gold)"
            strokeWidth="2.75"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className={cn('min-w-0', stacked ? 'space-y-1' : 'space-y-0.5')}>
          <div className={cn('font-semibold tracking-[0.16em] uppercase text-stone-100', styles.title)}>
            SmartFlow
          </div>
          <div className={cn('tracking-[0.24em] uppercase text-stone-400', styles.subtitle)}>
            Agent Outreach
          </div>
        </div>
      )}
    </div>
  )
}
