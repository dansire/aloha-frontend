import { LogOut, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { LogoMark, Wave } from '../illustrations'
import { LinkButton } from '../ui'
import { NAV_ITEMS } from './navigation'

/** Contenido compartido por la barra lateral de escritorio y el menú móvil. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full flex-col gap-5 p-5">
      <NavLink to="/" onClick={onNavigate} className="flex items-center gap-3 rounded-2xl">
        <LogoMark className="size-12" />
        <span className="leading-tight">
          <span className="block font-display text-2xl font-semibold tracking-wide">ALOHA</span>
          <span className="block text-xs font-extrabold text-ink-soft">My Learning Journal</span>
        </span>
      </NavLink>

      <LinkButton
        to="/cuaderno/nuevo"
        onClick={onNavigate}
        icon={<Plus className="size-5" aria-hidden />}
        className="w-full"
      >
        Nuevo aprendizaje
      </LinkButton>

      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex min-h-11 items-center gap-3 rounded-2xl border-2 px-3 py-2 font-extrabold transition-all duration-200',
                    isActive
                      ? 'border-mint-deep/30 bg-mint shadow-inset'
                      : 'border-transparent text-ink-soft hover:bg-paper hover:text-ink hover:shadow-soft',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'size-5 transition-transform duration-200 group-hover:scale-110',
                        isActive && 'text-mint-deep',
                      )}
                      aria-hidden
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        <Wave className="mb-3 h-3 w-full" />
        <div className="flex items-center gap-3 rounded-2xl border-2 border-line bg-paper p-2.5 shadow-soft">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-2xl" aria-hidden="true">
            {user?.avatar ?? '🌺'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold">{user?.name}</p>
            <p className="truncate text-xs font-semibold text-ink-soft">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              logout()
            }}
            className="grid size-10 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-blush hover:text-coral-deep"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
