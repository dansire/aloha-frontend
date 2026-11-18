import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  getDayOfYear,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from 'date-fns'
import type {
  ActivityPoint,
  AuthResponse,
  Category,
  CategoryColor,
  CategoryStat,
  Goal,
  GoalInput,
  GoalStatus,
  Learning,
  LearningInput,
  MonthlyStat,
  Page,
  StatsSummary,
  Tag,
  User,
} from '@/types'
import { loadDb, saveDb } from './db'
import type {
  DemoDb,
  StoredCategory,
  StoredGoal,
  StoredLearning,
  StoredTag,
  StoredUser,
} from './types'

/* ==========================================================================
   BACKEND DEMO — simula la API REST de Spring Boot sobre localStorage.
   Solo se instala cuando VITE_DEMO_MODE=true (ver install.ts). Nunca se usa
   como sustituto permanente: es un transporte intercambiable de Axios.
   ========================================================================== */

const DAY = 'yyyy-MM-dd'

/* ---------- Infraestructura HTTP simulada ---------- */

class HttpError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>
  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/** Respuesta con código explícito (201/204). Cualquier otro retorno se interpreta como 200. */
class Reply {
  readonly status: number
  readonly data: unknown
  constructor(status: number, data?: unknown) {
    this.status = status
    this.data = data
  }
}

interface RouteContext {
  db: DemoDb
  user: StoredUser | null
  groups: Record<string, string>
  query: Record<string, unknown>
  body: Record<string, unknown>
}

interface Route {
  method: string
  pattern: RegExp
  isPublic?: boolean
  handler: (ctx: RouteContext) => Reply | unknown
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function createToken(user: StoredUser): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = toBase64Url(
    JSON.stringify({
      sub: String(user.id),
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }),
  )
  return `${header}.${payload}.demo-signature`
}

function fail(
  config: InternalAxiosRequestConfig,
  status: number,
  message: string,
  fieldErrors: Record<string, string> = {},
): AxiosError {
  const response: AxiosResponse = {
    data: { message, fieldErrors },
    status,
    statusText: String(status),
    headers: {},
    config,
  }
  return new AxiosError(message, status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST', config, {}, response)
}

function authenticate(config: InternalAxiosRequestConfig, db: DemoDb): StoredUser | null {
  const header = String(config.headers.get('Authorization') ?? '')
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const payloadPart = token.split('.')[1]
  if (!payloadPart) return null
  try {
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const json = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)))
    const payload = JSON.parse(json) as { sub?: string; exp?: number }
    if (!payload.sub || (payload.exp && payload.exp * 1000 < Date.now())) return null
    return db.users.find((u) => u.id === Number(payload.sub)) ?? null
  } catch {
    return null
  }
}

function parseBody(data: unknown): Record<string, unknown> {
  if (typeof data === 'string' && data.length > 0) {
    try {
      return JSON.parse(data) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  return typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
}

/* ---------- Utilidades de dominio ---------- */

const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const str = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
const nullableStr = (value: unknown): string | null => str(value) || null

function toUserDto(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
  }
}

function toCategoryDto(db: DemoDb, category: StoredCategory): Category {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    color: category.color,
    icon: category.icon,
    learningCount: db.learnings.filter((l) => l.categoryId === category.id).length,
  }
}

function toTagDto(db: DemoDb, tag: StoredTag): Tag {
  return {
    id: tag.id,
    name: tag.name,
    learningCount: db.learnings.filter((l) => l.tagIds.includes(tag.id)).length,
  }
}

function toLearningDto(db: DemoDb, learning: StoredLearning): Learning {
  const category = db.categories.find((c) => c.id === learning.categoryId)
  const tags = learning.tagIds
    .map((id) => db.tags.find((t) => t.id === id))
    .filter((t): t is StoredTag => Boolean(t))
    .map((t) => toTagDto(db, t))
  return {
    id: learning.id,
    title: learning.title,
    summary: learning.summary,
    content: learning.content,
    category: category ? toCategoryDto(db, category) : null,
    tags,
    source: learning.source,
    learnedAt: learning.learnedAt,
    createdAt: learning.createdAt,
    updatedAt: learning.updatedAt,
    favorite: learning.favorite,
  }
}

function toGoalDto(db: DemoDb, goal: StoredGoal): Goal {
  const from = goal.createdAt.slice(0, 10)
  const currentCount = db.learnings.filter(
    (l) =>
      l.userId === goal.userId &&
      l.learnedAt >= from &&
      (!goal.deadline || l.learnedAt <= goal.deadline),
  ).length
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    targetCount: goal.targetCount,
    currentCount,
    deadline: goal.deadline,
    status: goal.status,
    createdAt: goal.createdAt,
  }
}

/** Busca o crea etiquetas por nombre y devuelve sus ids. */
function resolveTags(db: DemoDb, userId: number, names: unknown): number[] {
  const list = Array.isArray(names) ? names : []
  const ids = new Set<number>()
  for (const raw of list) {
    const name = str(raw).toLowerCase().slice(0, 30)
    if (!name) continue
    let tag = db.tags.find((t) => t.userId === userId && t.name === name)
    if (!tag) {
      tag = { id: ++db.seq.tag, userId, name }
      db.tags.push(tag)
    }
    ids.add(tag.id)
  }
  return [...ids]
}

/** Elimina etiquetas que ya no usa ningún aprendizaje. */
function pruneTags(db: DemoDb, userId: number): void {
  const used = new Set(db.learnings.filter((l) => l.userId === userId).flatMap((l) => l.tagIds))
  db.tags = db.tags.filter((t) => t.userId !== userId || used.has(t.id))
}

function datesWithLearnings(db: DemoDb, userId: number): Set<string> {
  return new Set(db.learnings.filter((l) => l.userId === userId).map((l) => l.learnedAt))
}

function computeStreaks(days: Set<string>): { current: number; longest: number } {
  const today = new Date()
  let cursor = days.has(format(today, DAY)) ? today : subDays(today, 1)
  let current = 0
  while (days.has(format(cursor, DAY))) {
    current += 1
    cursor = subDays(cursor, 1)
  }

  const sorted = [...days].sort()
  let longest = 0
  let run = 0
  let previous: Date | null = null
  for (const key of sorted) {
    const date = parseISO(key)
    run = previous && differenceInCalendarDays(date, previous) === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
    previous = date
  }
  return { current, longest }
}

function validateLearning(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!str(body.title)) errors.title = 'El título es obligatorio.'
  if (!str(body.summary)) errors.summary = 'Agrega una descripción breve.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str(body.learnedAt))) errors.learnedAt = 'Fecha inválida.'
  return errors
}

function applyLearning(
  db: DemoDb,
  userId: number,
  target: StoredLearning,
  body: Record<string, unknown>,
): void {
  const input = body as unknown as Partial<LearningInput>
  const categoryId =
    typeof input.categoryId === 'number' &&
    db.categories.some((c) => c.id === input.categoryId && c.userId === userId)
      ? input.categoryId
      : null
  target.title = str(input.title)
  target.summary = str(input.summary)
  target.content = typeof input.content === 'string' ? input.content : ''
  target.categoryId = categoryId
  target.tagIds = resolveTags(db, userId, input.tags)
  target.source = nullableStr(input.source)
  target.learnedAt = str(input.learnedAt)
  target.favorite = Boolean(input.favorite)
  target.updatedAt = new Date().toISOString()
}

function requireOwned<T extends { userId: number; id: number }>(
  list: T[],
  id: string,
  user: StoredUser,
  label: string,
): T {
  const found = list.find((item) => item.id === Number(id) && item.userId === user.id)
  if (!found) throw new HttpError(404, `${label} no encontrado.`)
  return found
}

const need = (user: StoredUser | null): StoredUser => {
  if (!user) throw new HttpError(401, 'Sesión inválida.')
  return user
}

const DEFAULT_CATEGORIES: { name: string; icon: string; color: CategoryColor }[] = [
  { name: 'Programación', icon: '💻', color: 'turquoise' },
  { name: 'Idiomas', icon: '🌍', color: 'coral' },
  { name: 'Bienestar', icon: '🧘', color: 'mint' },
  { name: 'Ideas', icon: '💡', color: 'vanilla' },
]

/* ---------- Tabla de rutas ---------- */

const ROUTES: Route[] = [
  /* ===== Autenticación ===== */
  {
    method: 'post',
    pattern: /^\/auth\/login$/,
    isPublic: true,
    handler: ({ db, body }): AuthResponse => {
      const email = str(body.email).toLowerCase()
      const user = db.users.find((u) => u.email === email && u.password === String(body.password ?? ''))
      if (!user) throw new HttpError(401, 'Correo o contraseña incorrectos.')
      return { token: createToken(user), user: toUserDto(user) }
    },
  },
  {
    method: 'post',
    pattern: /^\/auth\/register$/,
    isPublic: true,
    handler: ({ db, body }): Reply => {
      const name = str(body.name)
      const email = str(body.email).toLowerCase()
      const password = String(body.password ?? '')
      const errors: Record<string, string> = {}
      if (name.length < 2) errors.name = 'Escribe tu nombre.'
      if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Correo inválido.'
      if (password.length < 8) errors.password = 'Mínimo 8 caracteres.'
      if (Object.keys(errors).length) throw new HttpError(400, 'Revisa los datos del formulario.', errors)
      if (db.users.some((u) => u.email === email)) {
        throw new HttpError(409, 'Ya existe una cuenta con ese correo.', { email: 'Correo ya registrado.' })
      }
      const user: StoredUser = {
        id: ++db.seq.user,
        name,
        email,
        password,
        bio: null,
        avatar: '🌺',
        createdAt: new Date().toISOString(),
      }
      db.users.push(user)
      DEFAULT_CATEGORIES.forEach((c) =>
        db.categories.push({ id: ++db.seq.category, userId: user.id, description: null, ...c }),
      )
      return new Reply(201, { token: createToken(user), user: toUserDto(user) } satisfies AuthResponse)
    },
  },
  {
    method: 'get',
    pattern: /^\/auth\/me$/,
    handler: ({ user }): User => toUserDto(need(user)),
  },
  {
    method: 'put',
    pattern: /^\/users\/me$/,
    handler: ({ user, body }): User => {
      const me = need(user)
      const name = str(body.name)
      if (name.length < 2) throw new HttpError(400, 'Revisa los datos.', { name: 'Escribe tu nombre.' })
      me.name = name
      me.bio = nullableStr(body.bio)
      me.avatar = str(body.avatar) || me.avatar
      return toUserDto(me)
    },
  },
  {
    method: 'put',
    pattern: /^\/users\/me\/password$/,
    handler: ({ user, body }): Reply => {
      const me = need(user)
      if (me.password !== String(body.currentPassword ?? '')) {
        throw new HttpError(400, 'La contraseña actual no es correcta.', {
          currentPassword: 'La contraseña actual no es correcta.',
        })
      }
      const next = String(body.newPassword ?? '')
      if (next.length < 8) throw new HttpError(400, 'Revisa los datos.', { newPassword: 'Mínimo 8 caracteres.' })
      me.password = next
      return new Reply(204)
    },
  },

  /* ===== Aprendizajes ===== */
  {
    method: 'get',
    pattern: /^\/learnings\/discovery$/,
    handler: ({ db, user }): Reply | Learning => {
      const me = need(user)
      const mine = db.learnings
        .filter((l) => l.userId === me.id)
        .sort((a, b) => a.id - b.id)
      if (mine.length === 0) return new Reply(204)
      const today = new Date()
      const seed = today.getFullYear() * 1000 + getDayOfYear(today)
      const pick = mine[seed % mine.length]
      return pick ? toLearningDto(db, pick) : new Reply(204)
    },
  },
  {
    method: 'get',
    pattern: /^\/learnings$/,
    handler: ({ db, user, query }): Page<Learning> => {
      const me = need(user)
      const search = normalize(str(query.search))
      const categoryId = query.categoryId ? Number(query.categoryId) : null
      const tag = str(query.tag).toLowerCase()
      const favorite = query.favorite === true || query.favorite === 'true'
      const from = str(query.from)
      const to = str(query.to)
      const sort = str(query.sort) || 'learnedAt,desc'
      const size = Math.min(Math.max(Number(query.size) || 10, 1), 1000)
      const pageNumber = Math.max(Number(query.page) || 0, 0)

      const filtered = db.learnings.filter((l) => {
        if (l.userId !== me.id) return false
        if (categoryId && l.categoryId !== categoryId) return false
        if (favorite && !l.favorite) return false
        if (from && l.learnedAt < from) return false
        if (to && l.learnedAt > to) return false
        const tagNames = l.tagIds.map((id) => db.tags.find((t) => t.id === id)?.name ?? '')
        if (tag && !tagNames.includes(tag)) return false
        if (search) {
          const haystack = normalize([l.title, l.summary, l.content, l.source ?? '', ...tagNames].join(' '))
          if (!haystack.includes(search)) return false
        }
        return true
      })

      const [field, direction] = sort.split(',')
      const factor = direction === 'asc' ? 1 : -1
      filtered.sort((a, b) => {
        if (field === 'title') return a.title.localeCompare(b.title, 'es') * factor
        const key = field === 'updatedAt' ? 'updatedAt' : 'learnedAt'
        const diff = a[key].localeCompare(b[key])
        return (diff !== 0 ? diff : a.id - b.id) * factor
      })

      const start = pageNumber * size
      return {
        content: filtered.slice(start, start + size).map((l) => toLearningDto(db, l)),
        totalElements: filtered.length,
        totalPages: Math.max(Math.ceil(filtered.length / size), 1),
        number: pageNumber,
        size,
      }
    },
  },
  {
    method: 'post',
    pattern: /^\/learnings$/,
    handler: ({ db, user, body }): Reply => {
      const me = need(user)
      const errors = validateLearning(body)
      if (Object.keys(errors).length) throw new HttpError(400, 'Revisa los datos del formulario.', errors)
      const now = new Date().toISOString()
      const created: StoredLearning = {
        id: ++db.seq.learning,
        userId: me.id,
        title: '',
        summary: '',
        content: '',
        categoryId: null,
        tagIds: [],
        source: null,
        learnedAt: '',
        createdAt: now,
        updatedAt: now,
        favorite: false,
      }
      applyLearning(db, me.id, created, body)
      db.learnings.push(created)
      return new Reply(201, toLearningDto(db, created))
    },
  },
  {
    method: 'get',
    pattern: /^\/learnings\/(?<id>\d+)$/,
    handler: ({ db, user, groups }): Learning => {
      const me = need(user)
      return toLearningDto(db, requireOwned(db.learnings, groups.id ?? '', me, 'Aprendizaje'))
    },
  },
  {
    method: 'put',
    pattern: /^\/learnings\/(?<id>\d+)$/,
    handler: ({ db, user, groups, body }): Learning => {
      const me = need(user)
      const target = requireOwned(db.learnings, groups.id ?? '', me, 'Aprendizaje')
      const errors = validateLearning(body)
      if (Object.keys(errors).length) throw new HttpError(400, 'Revisa los datos del formulario.', errors)
      applyLearning(db, me.id, target, body)
      pruneTags(db, me.id)
      return toLearningDto(db, target)
    },
  },
  {
    method: 'patch',
    pattern: /^\/learnings\/(?<id>\d+)\/favorite$/,
    handler: ({ db, user, groups, body }): Learning => {
      const me = need(user)
      const target = requireOwned(db.learnings, groups.id ?? '', me, 'Aprendizaje')
      target.favorite = Boolean(body.favorite)
      return toLearningDto(db, target)
    },
  },
  {
    method: 'delete',
    pattern: /^\/learnings\/(?<id>\d+)$/,
    handler: ({ db, user, groups }): Reply => {
      const me = need(user)
      const target = requireOwned(db.learnings, groups.id ?? '', me, 'Aprendizaje')
      db.learnings = db.learnings.filter((l) => l.id !== target.id)
      pruneTags(db, me.id)
      return new Reply(204)
    },
  },

  /* ===== Categorías ===== */
  {
    method: 'get',
    pattern: /^\/categories$/,
    handler: ({ db, user }): Category[] => {
      const me = need(user)
      return db.categories
        .filter((c) => c.userId === me.id)
        .map((c) => toCategoryDto(db, c))
        .sort((a, b) => a.name.localeCompare(b.name, 'es'))
    },
  },
  {
    method: 'post',
    pattern: /^\/categories$/,
    handler: ({ db, user, body }): Reply => {
      const me = need(user)
      const name = str(body.name)
      if (!name) throw new HttpError(400, 'Revisa los datos.', { name: 'El nombre es obligatorio.' })
      if (db.categories.some((c) => c.userId === me.id && normalize(c.name) === normalize(name))) {
        throw new HttpError(409, 'Ya tienes una categoría con ese nombre.', { name: 'Nombre repetido.' })
      }
      const created: StoredCategory = {
        id: ++db.seq.category,
        userId: me.id,
        name,
        description: nullableStr(body.description),
        color: (str(body.color) as CategoryColor) || 'mint',
        icon: str(body.icon) || '🌺',
      }
      db.categories.push(created)
      return new Reply(201, toCategoryDto(db, created))
    },
  },
  {
    method: 'put',
    pattern: /^\/categories\/(?<id>\d+)$/,
    handler: ({ db, user, groups, body }): Category => {
      const me = need(user)
      const target = requireOwned(db.categories, groups.id ?? '', me, 'Categoría')
      const name = str(body.name)
      if (!name) throw new HttpError(400, 'Revisa los datos.', { name: 'El nombre es obligatorio.' })
      if (
        db.categories.some(
          (c) => c.userId === me.id && c.id !== target.id && normalize(c.name) === normalize(name),
        )
      ) {
        throw new HttpError(409, 'Ya tienes una categoría con ese nombre.', { name: 'Nombre repetido.' })
      }
      target.name = name
      target.description = nullableStr(body.description)
      target.color = (str(body.color) as CategoryColor) || target.color
      target.icon = str(body.icon) || target.icon
      return toCategoryDto(db, target)
    },
  },
  {
    method: 'delete',
    pattern: /^\/categories\/(?<id>\d+)$/,
    handler: ({ db, user, groups }): Reply => {
      const me = need(user)
      const target = requireOwned(db.categories, groups.id ?? '', me, 'Categoría')
      db.learnings.forEach((l) => {
        if (l.categoryId === target.id) l.categoryId = null
      })
      db.categories = db.categories.filter((c) => c.id !== target.id)
      return new Reply(204)
    },
  },

  /* ===== Etiquetas ===== */
  {
    method: 'get',
    pattern: /^\/tags$/,
    handler: ({ db, user }): Tag[] => {
      const me = need(user)
      return db.tags
        .filter((t) => t.userId === me.id)
        .map((t) => toTagDto(db, t))
        .filter((t) => t.learningCount > 0)
        .sort((a, b) => b.learningCount - a.learningCount || a.name.localeCompare(b.name, 'es'))
    },
  },
  {
    method: 'put',
    pattern: /^\/tags\/(?<id>\d+)$/,
    handler: ({ db, user, groups, body }): Tag => {
      const me = need(user)
      const target = requireOwned(db.tags, groups.id ?? '', me, 'Etiqueta')
      const name = str(body.name).toLowerCase().slice(0, 30)
      if (!name) throw new HttpError(400, 'El nombre es obligatorio.')
      target.name = name
      return toTagDto(db, target)
    },
  },
  {
    method: 'delete',
    pattern: /^\/tags\/(?<id>\d+)$/,
    handler: ({ db, user, groups }): Reply => {
      const me = need(user)
      const target = requireOwned(db.tags, groups.id ?? '', me, 'Etiqueta')
      db.learnings.forEach((l) => {
        l.tagIds = l.tagIds.filter((id) => id !== target.id)
      })
      db.tags = db.tags.filter((t) => t.id !== target.id)
      return new Reply(204)
    },
  },

  /* ===== Objetivos ===== */
  {
    method: 'get',
    pattern: /^\/goals$/,
    handler: ({ db, user, query }): Goal[] => {
      const me = need(user)
      const status = str(query.status)
      return db.goals
        .filter((g) => g.userId === me.id && (!status || g.status === status))
        .map((g) => toGoalDto(db, g))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
  },
  {
    method: 'post',
    pattern: /^\/goals$/,
    handler: ({ db, user, body }): Reply => {
      const me = need(user)
      const input = body as unknown as Partial<GoalInput>
      const errors: Record<string, string> = {}
      if (!str(input.title)) errors.title = 'El título es obligatorio.'
      if (!Number.isInteger(input.targetCount) || (input.targetCount ?? 0) < 1) errors.targetCount = 'La meta debe ser al menos 1.'
      if (Object.keys(errors).length) throw new HttpError(400, 'Revisa los datos.', errors)
      const created: StoredGoal = {
        id: ++db.seq.goal,
        userId: me.id,
        title: str(input.title),
        description: nullableStr(input.description),
        targetCount: Number(input.targetCount),
        deadline: nullableStr(input.deadline),
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      }
      db.goals.push(created)
      return new Reply(201, toGoalDto(db, created))
    },
  },
  {
    method: 'put',
    pattern: /^\/goals\/(?<id>\d+)$/,
    handler: ({ db, user, groups, body }): Goal => {
      const me = need(user)
      const target = requireOwned(db.goals, groups.id ?? '', me, 'Objetivo')
      const input = body as unknown as Partial<GoalInput>
      const errors: Record<string, string> = {}
      if (!str(input.title)) errors.title = 'El título es obligatorio.'
      if (!Number.isInteger(input.targetCount) || (input.targetCount ?? 0) < 1) errors.targetCount = 'La meta debe ser al menos 1.'
      if (Object.keys(errors).length) throw new HttpError(400, 'Revisa los datos.', errors)
      target.title = str(input.title)
      target.description = nullableStr(input.description)
      target.targetCount = Number(input.targetCount)
      target.deadline = nullableStr(input.deadline)
      if (input.status) target.status = input.status
      return toGoalDto(db, target)
    },
  },
  {
    method: 'patch',
    pattern: /^\/goals\/(?<id>\d+)\/status$/,
    handler: ({ db, user, groups, body }): Goal => {
      const me = need(user)
      const target = requireOwned(db.goals, groups.id ?? '', me, 'Objetivo')
      const status = str(body.status) as GoalStatus
      if (!['ACTIVE', 'COMPLETED', 'ARCHIVED'].includes(status)) throw new HttpError(400, 'Estado inválido.')
      target.status = status
      return toGoalDto(db, target)
    },
  },
  {
    method: 'delete',
    pattern: /^\/goals\/(?<id>\d+)$/,
    handler: ({ db, user, groups }): Reply => {
      const me = need(user)
      const target = requireOwned(db.goals, groups.id ?? '', me, 'Objetivo')
      db.goals = db.goals.filter((g) => g.id !== target.id)
      return new Reply(204)
    },
  },

  /* ===== Estadísticas ===== */
  {
    method: 'get',
    pattern: /^\/stats\/summary$/,
    handler: ({ db, user }): StatsSummary => {
      const me = need(user)
      const mine = db.learnings.filter((l) => l.userId === me.id)
      const streaks = computeStreaks(datesWithLearnings(db, me.id))
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), DAY)
      const monthStart = format(startOfMonth(new Date()), DAY)
      return {
        totalLearnings: mine.length,
        totalFavorites: mine.filter((l) => l.favorite).length,
        totalCategories: db.categories.filter((c) => c.userId === me.id).length,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        activeGoals: db.goals.filter((g) => g.userId === me.id && g.status === 'ACTIVE').length,
        thisWeek: mine.filter((l) => l.learnedAt >= weekStart).length,
        thisMonth: mine.filter((l) => l.learnedAt >= monthStart).length,
      }
    },
  },
  {
    method: 'get',
    pattern: /^\/stats\/activity$/,
    handler: ({ db, user, query }): ActivityPoint[] => {
      const me = need(user)
      const days = Math.min(Math.max(Number(query.days) || 90, 1), 730)
      const from = format(subDays(new Date(), days - 1), DAY)
      return countByDate(db, me.id, from, format(new Date(), DAY))
    },
  },
  {
    method: 'get',
    pattern: /^\/stats\/calendar$/,
    handler: ({ db, user, query }): ActivityPoint[] => {
      const me = need(user)
      return countByDate(db, me.id, str(query.from), str(query.to))
    },
  },
  {
    method: 'get',
    pattern: /^\/stats\/categories$/,
    handler: ({ db, user }): CategoryStat[] => {
      const me = need(user)
      return db.categories
        .filter((c) => c.userId === me.id)
        .map((c) => ({
          categoryId: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          count: db.learnings.filter((l) => l.categoryId === c.id).length,
        }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count)
    },
  },
  {
    method: 'get',
    pattern: /^\/stats\/monthly$/,
    handler: ({ db, user, query }): MonthlyStat[] => {
      const me = need(user)
      const months = Math.min(Math.max(Number(query.months) || 6, 1), 24)
      const result: MonthlyStat[] = []
      for (let i = months - 1; i >= 0; i -= 1) {
        const date = subMonths(new Date(), i)
        const from = format(startOfMonth(date), DAY)
        const to = format(endOfMonth(date), DAY)
        result.push({
          month: format(date, 'yyyy-MM'),
          count: db.learnings.filter((l) => l.userId === me.id && l.learnedAt >= from && l.learnedAt <= to).length,
        })
      }
      return result
    },
  },
]

function countByDate(db: DemoDb, userId: number, from: string, to: string): ActivityPoint[] {
  const counts = new Map<string, number>()
  for (const l of db.learnings) {
    if (l.userId !== userId || l.learnedAt < from || l.learnedAt > to) continue
    counts.set(l.learnedAt, (counts.get(l.learnedAt) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

/* ---------- Adaptador de Axios ---------- */

function normalizePath(url: string): string {
  const withoutQuery = url.split('?')[0] ?? ''
  return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
}

export const demoAdapter: AxiosAdapter = async (config) => {
  await delay(260 + Math.random() * 240)

  const method = (config.method ?? 'get').toLowerCase()
  const path = normalizePath(config.url ?? '')
  const route = ROUTES.find((r) => r.method === method && r.pattern.test(path))
  if (!route) throw fail(config, 404, 'Ruta no encontrada en el backend demo.')

  const db = loadDb()
  const user = route.isPublic ? null : authenticate(config, db)
  if (!route.isPublic && !user) throw fail(config, 401, 'Sesión inválida o vencida.')

  try {
    const groups = { ...(route.pattern.exec(path)?.groups ?? {}) }
    const result = route.handler({
      db,
      user,
      groups,
      query: (config.params ?? {}) as Record<string, unknown>,
      body: parseBody(config.data),
    })
    // Persistimos tras cada operación (los GET no cambian nada, pero es barato).
    saveDb(db)

    const reply = result instanceof Reply ? result : new Reply(200, result)
    const response: AxiosResponse = {
      data: reply.data ?? '',
      status: reply.status,
      statusText: String(reply.status),
      headers: {},
      config,
    }
    return response
  } catch (error) {
    if (error instanceof HttpError) throw fail(config, error.status, error.message, error.fieldErrors)
    throw fail(config, 500, 'Error interno del backend demo.')
  }
}
