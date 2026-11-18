import type { ComponentProps, CSSProperties } from 'react'
import { cn } from '@/lib/cn'

type TapeColor = 'vanilla' | 'mint' | 'blush' | 'lavender' | 'turquoise' | 'coral'

interface CardProps extends ComponentProps<'div'> {
  /** Costura punteada interior (estilo scrapbook). */
  stitch?: boolean
  /** Eleva la tarjeta al pasar el cursor. */
  hover?: boolean
  /** Cinta washi decorativa en el borde superior. */
  tape?: TapeColor
  tapeRotation?: number
}

export function Card({
  stitch = false,
  hover = false,
  tape,
  tapeRotation = -3,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn('card', stitch && 'card-stitch', hover && 'card-hover', className)}
      {...props}
    >
      {tape && (
        <span
          aria-hidden="true"
          className="washi"
          style={{ '--tape': `var(--color-${tape})`, '--tape-rot': `${tapeRotation}deg` } as CSSProperties}
        />
      )}
      {children}
    </div>
  )
}
