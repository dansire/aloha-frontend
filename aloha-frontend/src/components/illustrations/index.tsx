import { cn } from '@/lib/cn'

/**
 * Ilustraciones SVG propias de ALOHA. Todas son decorativas (aria-hidden) y
 * se colorean con los tokens CSS del tema mediante clases de Tailwind (fill / stroke).
 */

interface IllustrationProps {
  className?: string
}

const PETAL = 'M0 -6 C-12 -14 -14 -32 0 -37 C14 -32 12 -14 0 -6Z'

export function Hibiscus({
  className,
  petalClass = 'fill-coral',
}: IllustrationProps & { petalClass?: string }) {
  return (
    <svg viewBox="-42 -42 84 84" className={className} aria-hidden="true" focusable="false">
      {[0, 72, 144, 216, 288].map((angle) => (
        <path
          key={angle}
          d={PETAL}
          transform={`rotate(${angle})`}
          className={cn(petalClass, 'stroke-coral-deep')}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      ))}
      <g className="stroke-coral-deep" strokeWidth={1.2} strokeLinecap="round" opacity={0.45}>
        {[0, 72, 144, 216, 288].map((angle) => (
          <path key={angle} d="M0 -9 L0 -26" transform={`rotate(${angle})`} />
        ))}
      </g>
      <path d="M0 0 C2 -10 6 -18 10 -24" className="stroke-coral-deep fill-none" strokeWidth={1.6} strokeLinecap="round" />
      <g className="fill-vanilla stroke-vanilla-deep" strokeWidth={1}>
        <circle cx="10" cy="-24" r="2.4" />
        <circle cx="7" cy="-19" r="2" />
        <circle cx="4.5" cy="-14" r="1.8" />
      </g>
      <circle r="4.6" className="fill-vanilla stroke-coral-deep" strokeWidth={1.4} />
    </svg>
  )
}

export function Sparkle({ className }: IllustrationProps) {
  return (
    <svg viewBox="-12 -12 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M0 -10 Q1.6 -2 10 0 Q1.6 2 0 10 Q-1.6 2 -10 0 Q-1.6 -2 0 -10Z"
        className="fill-vanilla stroke-vanilla-deep"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Shell({ className }: IllustrationProps) {
  return (
    <svg viewBox="-30 -30 60 60" className={className} aria-hidden="true" focusable="false">
      <path
        d="M-22 14 C-30 -6 -18 -24 0 -26 C18 -24 30 -6 22 14 C14 20 -14 20 -22 14Z"
        className="fill-blush stroke-coral-deep"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <g className="stroke-coral-deep fill-none" strokeWidth={1.4} strokeLinecap="round" opacity={0.6}>
        <path d="M0 16 L0 -22" />
        <path d="M-6 16 C-10 0 -10 -12 -8 -20" />
        <path d="M6 16 C10 0 10 -12 8 -20" />
        <path d="M-12 15 C-18 2 -18 -8 -15 -16" />
        <path d="M12 15 C18 2 18 -8 15 -16" />
      </g>
      <path d="M-9 20 L9 20 L6 25 L-6 25Z" className="fill-coral stroke-coral-deep" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  )
}

export function PalmTree({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden="true" focusable="false">
      <path
        d="M58 148 C62 112 60 86 70 52"
        className="fill-none stroke-vanilla-deep"
        strokeWidth={9}
        strokeLinecap="round"
      />
      <path
        d="M58 148 C62 112 60 86 70 52"
        className="fill-none stroke-vanilla"
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <g className="fill-mint stroke-mint-deep" strokeWidth={1.8} strokeLinejoin="round">
        <path d="M70 52 C54 30 26 34 8 52 C30 44 52 46 70 52Z" />
        <path d="M70 52 C86 28 112 32 114 54 C96 44 82 46 70 52Z" />
        <path d="M70 52 C60 26 66 8 84 2 C80 20 78 36 70 52Z" />
        <path d="M70 52 C48 46 30 62 26 84 C42 66 56 58 70 52Z" />
        <path d="M70 52 C92 46 108 64 106 86 C92 68 82 58 70 52Z" />
      </g>
      <circle cx="68" cy="58" r="5" className="fill-coral stroke-coral-deep" strokeWidth={1.5} />
      <circle cx="77" cy="60" r="4.4" className="fill-coral stroke-coral-deep" strokeWidth={1.5} />
    </svg>
  )
}

export function Wave({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 24" preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
      <path
        d="M0 12 Q15 0 30 12 T60 12 T90 12 T120 12 T150 12 T180 12 T210 12 T240 12"
        className="fill-none stroke-turquoise-deep"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.55}
      />
    </svg>
  )
}

/** Escena principal: isla con palmera, sol, hibisco y conchas. */
export function IslandScene({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 260 190" className={className} aria-hidden="true" focusable="false">
      <circle cx="198" cy="48" r="26" className="fill-vanilla stroke-vanilla-deep" strokeWidth={2} />
      <g className="stroke-vanilla-deep" strokeWidth={2} strokeLinecap="round" opacity={0.7}>
        <path d="M198 10 V0" />
        <path d="M234 24 L242 16" />
        <path d="M244 48 H256" />
      </g>
      <ellipse cx="130" cy="156" rx="118" ry="26" className="fill-turquoise stroke-turquoise-deep" strokeWidth={2} />
      <g className="fill-none stroke-paper" strokeWidth={3} strokeLinecap="round" opacity={0.9}>
        <path d="M30 160 q8 -6 16 0 t16 0" />
        <path d="M190 166 q8 -6 16 0 t16 0" />
      </g>
      <path
        d="M52 148 C60 120 100 108 130 108 C166 108 200 122 210 148 C190 160 70 160 52 148Z"
        className="fill-vanilla stroke-vanilla-deep"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <g transform="translate(92 28) scale(0.62)">
        <path d="M58 148 C62 112 60 86 70 52" className="fill-none stroke-vanilla-deep" strokeWidth={10} strokeLinecap="round" />
        <path d="M58 148 C62 112 60 86 70 52" className="fill-none stroke-paper" strokeWidth={6} strokeLinecap="round" />
        <g className="fill-mint stroke-mint-deep" strokeWidth={2.4} strokeLinejoin="round">
          <path d="M70 52 C54 30 26 34 8 52 C30 44 52 46 70 52Z" />
          <path d="M70 52 C86 28 112 32 114 54 C96 44 82 46 70 52Z" />
          <path d="M70 52 C60 26 66 8 84 2 C80 20 78 36 70 52Z" />
          <path d="M70 52 C48 46 30 62 26 84 C42 66 56 58 70 52Z" />
          <path d="M70 52 C92 46 108 64 106 86 C92 68 82 58 70 52Z" />
        </g>
      </g>
      <g transform="translate(168 140) scale(0.34)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d={PETAL}
            transform={`rotate(${angle})`}
            className="fill-coral stroke-coral-deep"
            strokeWidth={3.4}
            strokeLinejoin="round"
          />
        ))}
        <circle r="6" className="fill-vanilla stroke-coral-deep" strokeWidth={3} />
      </g>
      <g transform="translate(78 146) scale(0.28)">
        <path
          d="M-22 14 C-30 -6 -18 -24 0 -26 C18 -24 30 -6 22 14 C14 20 -14 20 -22 14Z"
          className="fill-blush stroke-coral-deep"
          strokeWidth={4}
        />
      </g>
      <g transform="translate(40 40)" className="animate-twinkle origin-center">
        <path d="M0 -9 Q1.4 -2 9 0 Q1.4 2 0 9 Q-1.4 2 -9 0 Q-1.4 -2 0 -9Z" className="fill-lavender stroke-lavender-deep" strokeWidth={1.2} />
      </g>
      <g transform="translate(232 108)" className="animate-twinkle origin-center">
        <path d="M0 -7 Q1 -1.5 7 0 Q1 1.5 0 7 Q-1 1.5 -7 0 Q-1 -1.5 0 -7Z" className="fill-vanilla stroke-vanilla-deep" strokeWidth={1.2} />
      </g>
    </svg>
  )
}

/** Marca de ALOHA: hibisco dentro de un círculo crema. */
export function LogoMark({ className }: IllustrationProps) {
  return (
    <span
      className={cn(
        'inline-grid place-items-center rounded-2xl border-2 border-line bg-paper shadow-soft',
        className,
      )}
    >
      <Hibiscus className="size-[78%]" />
    </span>
  )
}
