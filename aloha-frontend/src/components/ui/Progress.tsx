import { cn } from '@/lib/cn'

type Tone = 'mint' | 'coral' | 'turquoise' | 'lavender'

const FILL: Record<Tone, string> = {
  mint: 'bg-mint-deep',
  coral: 'bg-coral-deep',
  turquoise: 'bg-turquoise-deep',
  lavender: 'bg-lavender-deep',
}

export function ProgressBar({
  value,
  max,
  label,
  tone = 'mint',
  className,
}: {
  value: number
  max: number
  label: string
  tone?: Tone
  className?: string
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className={cn('h-3.5 w-full overflow-hidden rounded-full border-2 border-line bg-cream', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', FILL[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
