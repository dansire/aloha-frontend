import type { CategoryColor, GoalStatus } from '@/types'

/**
 * Forma de los registros del backend DEMO (solo vive en localStorage del navegador).
 * No forma parte del contrato real con la API de Spring Boot.
 */
export interface StoredUser {
  id: number
  name: string
  email: string
  password: string
  bio: string | null
  avatar: string
  createdAt: string
}

export interface StoredCategory {
  id: number
  userId: number
  name: string
  description: string | null
  color: CategoryColor
  icon: string
}

export interface StoredTag {
  id: number
  userId: number
  name: string
}

export interface StoredLearning {
  id: number
  userId: number
  title: string
  summary: string
  content: string
  categoryId: number | null
  tagIds: number[]
  source: string | null
  learnedAt: string
  createdAt: string
  updatedAt: string
  favorite: boolean
}

export interface StoredGoal {
  id: number
  userId: number
  title: string
  description: string | null
  targetCount: number
  deadline: string | null
  status: GoalStatus
  createdAt: string
}

export interface DemoDb {
  users: StoredUser[]
  categories: StoredCategory[]
  tags: StoredTag[]
  learnings: StoredLearning[]
  goals: StoredGoal[]
  seq: { user: number; category: number; tag: number; learning: number; goal: number }
}

export const DEMO_USER_EMAIL = 'demo@aloha.app'
export const DEMO_USER_PASSWORD = 'aloha1234'
