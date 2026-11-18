import { cn } from '@/lib/cn'
import { Card } from './Card'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton h-4 w-full', className)} />
}

/** Texto accesible mientras carga (lectores de pantalla). */
export function LoadingAnnouncer({ label = 'Cargando…' }: { label?: string }) {
  return (
    <p className="sr-only" role="status">
      {label}
    </p>
  )
}

export function LearningCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </Card>
  )
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <LoadingAnnouncer />
      {Array.from({ length: count }, (_, i) => (
        <LearningCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      <LoadingAnnouncer />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-2xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
