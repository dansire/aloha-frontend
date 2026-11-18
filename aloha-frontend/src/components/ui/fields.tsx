import { ChevronDown } from 'lucide-react'
import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* ---------- Estilos compartidos de controles ---------- */

const CONTROL =
  'w-full min-h-11 rounded-2xl border-2 bg-paper px-4 py-2.5 font-semibold text-ink ' +
  'placeholder:font-medium placeholder:text-ink-soft/75 transition-all duration-200 ' +
  'hover:border-turquoise focus-visible:border-turquoise-deep focus-visible:outline-none ' +
  'focus-visible:ring-4 focus-visible:ring-turquoise/45 disabled:cursor-not-allowed disabled:opacity-60'

export function controlClass(hasError?: boolean, className?: string): string {
  return cn(CONTROL, hasError ? 'border-coral-deep' : 'border-line', className)
}

/* ---------- Estructura de un campo (label + control + ayuda/error) ---------- */

interface FieldShellProps {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

function FieldShell({ id, label, hint, error, required, className, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-extrabold text-ink">
        {label}
        {required && (
          <span className="ml-1 text-coral-deep" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs font-semibold text-ink-soft">
          {hint}
        </p>
      )}
      <p
        id={`${id}-error`}
        role={error ? 'alert' : undefined}
        className={cn('text-xs font-bold text-coral-deep', !error && 'hidden')}
      >
        {error}
      </p>
    </div>
  )
}

interface CommonFieldProps {
  label: string
  hint?: string
  error?: string
  containerClassName?: string
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

/* ---------- Campos ---------- */

export function TextField({
  label,
  hint,
  error,
  containerClassName,
  required,
  className,
  id: idProp,
  leading,
  trailing,
  ...props
}: ComponentProps<'input'> & CommonFieldProps & { leading?: ReactNode; trailing?: ReactNode }) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-ink-soft [&>svg]:size-5">
            {leading}
          </span>
        )}
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={controlClass(Boolean(error), cn(leading && 'pl-11', trailing && 'pr-12', className))}
          {...props}
        />
        {trailing && <span className="absolute inset-y-0 right-1.5 grid place-items-center">{trailing}</span>}
      </div>
    </FieldShell>
  )
}

export function TextAreaField({
  label,
  hint,
  error,
  containerClassName,
  required,
  className,
  id: idProp,
  ...props
}: ComponentProps<'textarea'> & CommonFieldProps) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClass(Boolean(error), cn('resize-y leading-relaxed', className))}
        {...props}
      />
    </FieldShell>
  )
}

export function SelectField({
  label,
  hint,
  error,
  containerClassName,
  required,
  className,
  id: idProp,
  children,
  ...props
}: ComponentProps<'select'> & CommonFieldProps) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={controlClass(Boolean(error), cn('cursor-pointer appearance-none pr-11', className))}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-y-0 right-3.5 my-auto size-5 text-ink-soft"
          aria-hidden
        />
      </div>
    </FieldShell>
  )
}

/** Interruptor accesible (role="switch"). */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div>
        <p id={`${id}-label`} className="font-extrabold">
          {label}
        </p>
        {description && <p className="text-sm font-semibold text-ink-soft">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-8 w-14 shrink-0 rounded-full border-2 transition-colors duration-200',
          checked ? 'border-mint-deep bg-mint' : 'border-line bg-cream',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-6 rounded-full bg-paper shadow-soft ring-1 ring-ink/10 transition-transform duration-200',
            checked && 'translate-x-6',
          )}
        />
      </button>
    </div>
  )
}
