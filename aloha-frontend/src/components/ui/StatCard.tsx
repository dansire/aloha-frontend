import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Card } from './Card'
import { Skeleton } from './Skeleton'

const TONES = {
  mint: 'bg-mint',
  coral: 'bg-coral',
  turquoise: 'bg-turquoise',
  lavender: 'bg-lavender',
  vanilla: 'bg-vanilla',
  blush: 'bg-blush',
} as const

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'mint',
  loading = false,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  hint?: string
  tone?: keyof typeof TONES
  loading?: boolean
}) {
  return (
    <Card className="flex items-center gap-4 p-4 sm:p-5">
      <span
        className={cn(
          'grid size-14 shrink-0 place-items-center rounded-2xl text-ink [&>svg]:size-7',
          TONES[tone],
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-ink-soft">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-8 w-16" />
        ) : (
          <p className="font-display text-3xl leading-tight font-semibold">{value}</p>
        )}
        {hint && !loading && <p className="text-xs font-semibold text-ink-soft">{hint}</p>}
      </div>
    </Card>
  )
}
