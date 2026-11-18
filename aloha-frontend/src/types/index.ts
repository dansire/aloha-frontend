/**
 * Contrato de datos entre el frontend y la API REST de Spring Boot.
 * Las fechas "solo día" viajan como 'YYYY-MM-DD' y las marcas de tiempo como ISO-8601.
 */

/* ---------- Genéricos ---------- */

/** Forma estándar de `org.springframework.data.domain.Page` serializada a JSON. */
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  /** Número de página, base 0. */
  number: number
  size: number
}

/** Respuesta de error recomendada para el backend (ver README). */
export interface ApiErrorBody {
  message?: string
  error?: string
  /** Errores por campo, p. ej. `{ title: "no puede estar vacío" }`. */
  fieldErrors?: Record<string, string>
}

/* ---------- Usuario y autenticación ---------- */

export interface User {
  id: number
  name: string
  email: string
  bio: string | null
  /** Emoji que se muestra como avatar. */
  avatar: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface ProfileInput {
  name: string
  bio: string | null
  avatar: string
}

export interface PasswordInput {
  currentPassword: string
  newPassword: string
}

/* ---------- Categorías y etiquetas ---------- */

export type CategoryColor = 'mint' | 'turquoise' | 'coral' | 'blush' | 'vanilla' | 'lavender'

export interface Category {
  id: number
  name: string
  description: string | null
  color: CategoryColor
  /** Emoji representativo. */
  icon: string
  learningCount: number
}

export interface CategoryInput {
  name: string
  description: string | null
  color: CategoryColor
  icon: string
}

export interface Tag {
  id: number
  name: string
  learningCount: number
}

/* ---------- Aprendizajes ---------- */

export interface Learning {
  id: number
  title: string
  summary: string
  /** Contenido enriquecido en Markdown (se renderiza sin HTML crudo). */
  content: string
  category: Category | null
  tags: Tag[]
  source: string | null
  /** Día en que se aprendió ('YYYY-MM-DD'). */
  learnedAt: string
  createdAt: string
  updatedAt: string
  favorite: boolean
}

export interface LearningInput {
  title: string
  summary: string
  content: string
  categoryId: number | null
  /** Nombres de etiqueta: el backend crea las que no existan. */
  tags: string[]
  source: string | null
  learnedAt: string
  favorite: boolean
}

export type LearningSort = 'learnedAt,desc' | 'learnedAt,asc' | 'updatedAt,desc' | 'title,asc'

export interface LearningQuery {
  page?: number
  size?: number
  search?: string
  categoryId?: number
  tag?: string
  favorite?: boolean
  /** Rango inclusivo de fecha de aprendizaje ('YYYY-MM-DD'). */
  from?: string
  to?: string
  sort?: LearningSort
}

/* ---------- Objetivos ---------- */

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

export interface Goal {
  id: number
  title: string
  description: string | null
  /** Meta: número de aprendizajes a registrar. */
  targetCount: number
  /** Progreso calculado por el backend (aprendizajes entre creación y fecha límite). */
  currentCount: number
  deadline: string | null
  status: GoalStatus
  createdAt: string
}

export interface GoalInput {
  title: string
  description: string | null
  targetCount: number
  deadline: string | null
  status: GoalStatus
}

/* ---------- Estadísticas ---------- */

export interface StatsSummary {
  totalLearnings: number
  totalFavorites: number
  totalCategories: number
  currentStreak: number
  longestStreak: number
  activeGoals: number
  thisWeek: number
  thisMonth: number
}

export interface ActivityPoint {
  date: string
  count: number
}

export interface CategoryStat {
  categoryId: number
  name: string
  color: CategoryColor
  icon: string
  count: number
}

export interface MonthlyStat {
  /** 'YYYY-MM' */
  month: string
  count: number
}
