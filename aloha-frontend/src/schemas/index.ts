import { z } from 'zod'
import { todayKey } from '@/lib/format'

/* Mensajes en español y reglas compartidas entre formularios. */

const dateString = (label: string) =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `Elige una ${label} válida`)

const emailField = z.string().trim().min(1, 'Escribe tu correo').pipe(z.email('Ese correo no parece válido'))

const passwordField = z
  .string()
  .min(8, 'Usa al menos 8 caracteres')
  .max(72, 'Máximo 72 caracteres')
  .regex(/[A-Za-z]/, 'Incluye al menos una letra')
  .regex(/\d/, 'Incluye al menos un número')

/* ---------- Autenticación ---------- */

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Escribe tu contraseña'),
  remember: z.boolean(),
})
export type LoginForm = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Escribe tu nombre').max(60, 'Máximo 60 caracteres'),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Repite tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
export type RegisterForm = z.infer<typeof registerSchema>

/* ---------- Aprendizajes ---------- */

export const learningSchema = z.object({
  title: z.string().trim().min(3, 'El título necesita al menos 3 caracteres').max(120, 'Máximo 120 caracteres'),
  summary: z
    .string()
    .trim()
    .min(3, 'Cuéntalo en una frase corta')
    .max(240, 'Máximo 240 caracteres'),
  content: z.string().max(20000, 'El contenido es demasiado largo (máx. 20.000 caracteres)'),
  /** Valor del <select>: '' = sin categoría. */
  categoryId: z.string(),
  tags: z.array(z.string().min(1).max(30)).max(10, 'Máximo 10 etiquetas'),
  source: z
    .string()
    .trim()
    .max(300, 'Máximo 300 caracteres')
    .refine((value) => value === '' || /^https?:\/\/\S+$/i.test(value) || value.length >= 3, {
      message: 'Escribe una URL (https://…) o el nombre de la fuente',
    }),
  learnedAt: dateString('fecha').refine((value) => value <= todayKey(), {
    message: 'La fecha de aprendizaje no puede ser futura',
  }),
  favorite: z.boolean(),
})
export type LearningForm = z.infer<typeof learningSchema>

/* ---------- Categorías ---------- */

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(30, 'Máximo 30 caracteres'),
  description: z.string().trim().max(120, 'Máximo 120 caracteres'),
  color: z.enum(['mint', 'turquoise', 'coral', 'blush', 'vanilla', 'lavender']),
  icon: z.string().min(1, 'Elige un ícono'),
})
export type CategoryForm = z.infer<typeof categorySchema>

/* ---------- Objetivos ---------- */

export const goalSchema = z.object({
  title: z.string().trim().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().trim().max(200, 'Máximo 200 caracteres'),
  targetCount: z
    .number({ error: 'Escribe un número' })
    .int('Debe ser un número entero')
    .min(1, 'La meta mínima es 1')
    .max(1000, 'La meta máxima es 1000'),
  deadline: z
    .string()
    .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Fecha inválida'),
})
export type GoalForm = z.infer<typeof goalSchema>

/* ---------- Perfil ---------- */

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre').max(60, 'Máximo 60 caracteres'),
  bio: z.string().trim().max(200, 'Máximo 200 caracteres'),
  avatar: z.string().min(1, 'Elige un avatar'),
})
export type ProfileForm = z.infer<typeof profileSchema>

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Escribe tu contraseña actual'),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, 'Repite la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
export type PasswordChangeForm = z.infer<typeof passwordChangeSchema>
