type Props = {
  className?: string
  variant?: 'full' | 'mark'
}

export function Logo({ className, variant = 'full' }: Props) {
  if (variant === 'mark') {
    return (
      <div className={className} aria-hidden>
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <defs>
            <linearGradient id="ax-mark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#040939" />
              <stop offset="100%" stopColor="#4BA2FF" />
            </linearGradient>
          </defs>
          <path
            d="M20 4 L34 32 L26 32 L23 26 L17 26 L14 32 L6 32 Z M19 19 L21 19 L20 16 Z"
            fill="url(#ax-mark)"
          />
        </svg>
      </div>
    )
  }

  return (
    <a
      href="https://asimetrix.co"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Asimetrix"
      className={`inline-flex items-center justify-center rounded-2xl bg-ax-primary px-4 py-2.5 shadow-card ring-1 ring-white/10 ${className ?? ''}`}
    >
      <img
        src="https://asimetrix.co/hs-fs/hubfs/logo-AX-Asimetrix-unlocking-the-power-of-data.webp?width=460&height=132&name=logo-AX-Asimetrix-unlocking-the-power-of-data.webp"
        alt="Asimetrix"
        width={460}
        height={132}
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain"
      />
    </a>
  )
}
