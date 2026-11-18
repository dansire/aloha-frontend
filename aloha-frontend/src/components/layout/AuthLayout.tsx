import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { env } from '@/lib/env'
import { Hibiscus, IslandScene, LogoMark, Shell, Sparkle } from '../illustrations'

/** Marco de las pantallas de acceso: isla ilustrada + formulario. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="relative grid min-h-screen overflow-hidden lg:grid-cols-[1.05fr_1fr]">
      <a href="#contenido" className="skip-link">
        Saltar al formulario
      </a>

      {/* Panel ilustrado */}
      <aside
        className="relative hidden flex-col items-center justify-center gap-6 overflow-hidden bg-turquoise/45 p-10 lg:flex"
        aria-hidden="true"
      >
        <Hibiscus className="absolute -top-8 -left-8 size-48 -rotate-12 opacity-60" petalClass="fill-blush" />
        <Shell className="absolute right-12 bottom-14 size-20 rotate-12 animate-float opacity-90" />
        <Sparkle className="absolute top-24 right-24 size-8 animate-twinkle" />
        <Sparkle className="absolute bottom-32 left-20 size-6 animate-twinkle [animation-delay:1s]" />
        <IslandScene className="w-full max-w-md drop-shadow-sm" />
        <div className="max-w-sm text-center">
          <p className="font-display text-3xl font-semibold">Tu isla de aprendizajes</p>
          <p className="mt-2 font-semibold text-ink/80">
            Anota lo que descubres cada día y construye, poco a poco, tu propia biblioteca de conocimientos.
          </p>
        </div>
      </aside>

      <main id="contenido" tabIndex={-1} className="relative z-10 flex flex-col items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-8 flex items-center gap-3 rounded-2xl">
            <LogoMark className="size-14" />
            <span className="leading-tight">
              <span className="block font-display text-3xl font-semibold tracking-wide">ALOHA</span>
              <span className="block text-sm font-extrabold text-ink-soft">My Learning Journal</span>
            </span>
          </Link>

          <div className="card card-stitch animate-pop p-7 sm:p-8">
            <h1 className="text-3xl">{title}</h1>
            <p className="mt-1 mb-6 font-semibold text-ink-soft">{subtitle}</p>
            {children}
          </div>

          <div className="mt-6 text-center text-sm font-bold text-ink-soft">{footer}</div>
          {env.demoMode && (
            <p className="mt-4 rounded-2xl bg-vanilla px-4 py-2 text-center text-xs font-extrabold" role="note">
              Modo demostración activo: no se necesita servidor.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
