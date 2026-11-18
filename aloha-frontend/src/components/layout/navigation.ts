import {
  BookOpenText,
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  Library,
  Shapes,
  Target,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Coincidencia exacta (para la ruta raíz). */
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/cuaderno', label: 'Cuaderno', icon: BookOpenText },
  { to: '/biblioteca', label: 'Biblioteca', icon: Library },
  { to: '/categorias', label: 'Categorías', icon: Shapes },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/objetivos', label: 'Objetivos', icon: Target },
  { to: '/estadisticas', label: 'Estadísticas', icon: ChartColumn },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
]
