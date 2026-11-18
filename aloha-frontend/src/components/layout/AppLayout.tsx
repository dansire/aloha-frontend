import { Menu, Plus, X } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { env } from '@/lib/env'
import { Hibiscus, PalmTree, Sparkle } from '../illustrations'
import { IconButton, LinkButton, Skeleton } from '../ui'
import { GlobalSearch } from './GlobalSearch'
import { SidebarContent } from './SidebarContent'

/** Decoración de fondo: no interactiva, sin información y con poca opacidad. */
function Decor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Hibiscus
        className="absolute -top-10 -right-10 size-56 rotate-12 animate-float opacity-35"
        petalClass="fill-blush"
      />
      <PalmTree className="absolute -right-6 -bottom-6 hidden h-72 w-60 opacity-30 md:block" />
      <Hibiscus className="absolute bottom-24 left-[19rem] hidden size-20 -rotate-12 opacity-25 xl:block" petalClass="fill-lavender" />
      <Sparkle className="absolute top-28 right-[22%] hidden size-7 animate-twinkle md:block" />
      <Sparkle className="absolute bottom-40 right-[12%] hidden size-5 animate-twinkle [animation-delay:1.2s] md:block" />
    </div>
  )
}

function PageFallback() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Cargando página">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export function AppLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Al navegar: cierra el menú móvil y vuelve arriba.
  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0 })
  }, [pathname])

  // Esc cierra el menú móvil.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="relative min-h-screen">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Decor />

      {/* Barra lateral de escritorio */}
      <aside aria-label="Barra lateral" className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r-2 border-line bg-cream/85 backdrop-blur lg:block">
        <SidebarContent />
      </aside>

      <div className="relative z-10 lg:pl-72">
        <header className="sticky top-0 z-30 border-b-2 border-line/70 bg-cream/85 backdrop-blur">
          {env.demoMode && (
            <p className="bg-vanilla px-4 py-1.5 text-center text-xs font-extrabold">
              Modo demostración: los datos viven solo en este navegador y no hay servidor real conectado.
            </p>
          )}
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
            <IconButton
              label="Abrir menú"
              variant="outline"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
            >
              <Menu />
            </IconButton>
            <GlobalSearch className="min-w-0 flex-1 sm:max-w-xl" />
            <div className="ml-auto hidden items-center gap-3 sm:flex">
              <LinkButton to="/cuaderno/nuevo" size="md" icon={<Plus className="size-5" aria-hidden />}>
                Nuevo
              </LinkButton>
              <Link
                to="/perfil"
                className="grid size-11 place-items-center rounded-full border-2 border-line bg-blush text-2xl transition-transform hover:scale-105"
                aria-label={`Perfil de ${user?.name ?? 'usuario'}`}
              >
                <span aria-hidden="true">{user?.avatar ?? '🌺'}</span>
              </Link>
            </div>
          </div>
        </header>

        <main id="contenido" tabIndex={-1} className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-8 lg:pb-12">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>

          {/* Botón flotante en móvil (dentro de <main> para estar en un landmark) */}
          <Link
            to="/cuaderno/nuevo"
            aria-label="Nuevo aprendizaje"
            className="fixed right-5 bottom-5 z-30 grid size-14 place-items-center rounded-full border-2 border-coral-deep/30 bg-coral shadow-pop transition-transform hover:scale-105 active:scale-95 sm:hidden"
          >
            <Plus className="size-7" aria-hidden />
          </Link>
        </main>
      </div>

      {/* Menú móvil (drawer) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="absolute inset-y-0 left-0 w-[85%] max-w-xs animate-pop border-r-2 border-line bg-cream shadow-pop"
          >
            <IconButton
              label="Cerrar menú"
              variant="ghost"
              className="absolute top-3 right-3 z-10"
              onClick={() => setMenuOpen(false)}
            >
              <X />
            </IconButton>
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
