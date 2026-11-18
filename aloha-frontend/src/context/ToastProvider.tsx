import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ToastContext, type ToastApi, type ToastTone } from './toast-context'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

const TONE_STYLE: Record<ToastTone, { box: string; icon: typeof Info }> = {
  success: { box: 'bg-mint border-mint-deep/40', icon: CircleCheck },
  error: { box: 'bg-blush border-coral-deep/50', icon: CircleAlert },
  info: { box: 'bg-lavender border-lavender-deep/40', icon: Info },
}

const DURATION_MS = 4800

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++
      setToasts((list) => [...list.slice(-3), { id, tone, message }])
      window.setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const { box, icon: Icon } = TONE_STYLE[toast.tone]
          return (
            <div
              key={toast.id}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm animate-pop items-start gap-3 rounded-2xl border-2 px-4 py-3 text-sm font-semibold shadow-pop',
                box,
              )}
            >
              <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
              <p className="flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-m-1 rounded-full p-1 hover:bg-ink/10"
                aria-label="Cerrar mensaje"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
