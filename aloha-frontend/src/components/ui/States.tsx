import { RotateCcw, ServerCrash, WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { ParsedError } from '@/lib/errors'
import { IslandScene, PalmTree, Shell } from '../illustrations'
import { Button } from './Button'

type IllustrationName = 'island' | 'shell' | 'palm'

function Illustration({ name }: { name: IllustrationName }) {
  if (name === 'shell') return <Shell className="size-28 animate-float" />
  if (name === 'palm') return <PalmTree className="h-32 w-28 animate-sway origin-bottom" />
  return <IslandScene className="h-36 w-auto" />
}

/** Estado vacío ilustrado. */
export function EmptyState({
  illustration = 'island',
  title,
  description,
  action,
  className,
}: {
  illustration?: IllustrationName
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'card card-stitch flex flex-col items-center gap-3 px-6 py-10 text-center',
        className,
      )}
    >
      <Illustration name={illustration} />
      <h2 className="text-xl">{title}</h2>
      {description && <p className="max-w-md font-semibold text-ink-soft">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Error de carga con botón de reintento; distingue caídas de conexión. */
export function ErrorState({
  error,
  onRetry,
  className,
  compact = false,
}: {
  error: ParsedError | string
  onRetry?: () => void
  className?: string
  compact?: boolean
}) {
  const parsed = typeof error === 'string' ? null : error
  const message = typeof error === 'string' ? error : error.message
  const Icon = parsed?.isNetwork ? WifiOff : ServerCrash

  return (
    <div
      role="alert"
      className={cn(
        'card flex flex-col items-center gap-3 text-center',
        compact ? 'px-4 py-6' : 'px-6 py-10',
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-blush text-coral-deep">
        <Icon className="size-7" aria-hidden />
      </span>
      <h2 className="text-lg">
        {parsed?.isNetwork ? 'Sin conexión con el servidor' : 'Algo no salió como esperábamos'}
      </h2>
      <p className="max-w-md text-sm font-semibold text-ink-soft">{message}</p>
      {onRetry && (
        <Button variant="soft" icon={<RotateCcw className="size-4" aria-hidden />} onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
