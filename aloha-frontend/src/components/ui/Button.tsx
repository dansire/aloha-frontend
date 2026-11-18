import { LoaderCircle } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-extrabold whitespace-nowrap select-none ' +
  'transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ' +
  'disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-coral text-ink shadow-inset hover:brightness-105 hover:shadow-pop',
  secondary: 'bg-mint text-ink shadow-inset hover:brightness-105 hover:shadow-pop',
  soft: 'bg-lavender text-ink shadow-inset hover:brightness-105 hover:shadow-pop',
  ghost: 'bg-transparent text-ink hover:bg-ink/6',
  outline: 'border-2 border-line bg-paper text-ink hover:border-turquoise hover:shadow-soft',
  danger: 'bg-coral-deep text-white shadow-inset hover:brightness-110 hover:shadow-pop',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-4 text-sm',
  md: 'min-h-11 px-5 text-[0.95rem]',
  lg: 'min-h-12 px-7 text-base',
}

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className)
}

interface ButtonOwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ComponentProps<'button'> & ButtonOwnProps & { loading?: boolean }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: LinkProps & ButtonOwnProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {children}
    </Link>
  )
}

/** Botón circular solo con ícono. `label` es obligatorio para lectores de pantalla. */
export function IconButton({
  label,
  variant = 'ghost',
  className,
  children,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { label: string; variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        BASE,
        VARIANTS[variant],
        'size-11 shrink-0 rounded-full p-0 [&>svg]:size-5',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
