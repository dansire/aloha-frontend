import type { CategoryColor } from '@/types'

export interface CategoryThemeTokens {
  /** Fondo pastel de la pegatina. */
  bg: string
  /** Texto/ícono con contraste AA sobre el fondo. */
  text: string
  /** Color sólido para gráficos (variable CSS del tema). */
  solid: string
  label: string
}

/** Cada color de categoría se apoya en los tokens CSS definidos en styles/index.css. */
export const CATEGORY_THEME: Record<CategoryColor, CategoryThemeTokens> = {
  mint: { bg: 'bg-mint', text: 'text-mint-deep', solid: 'var(--color-mint)', label: 'Menta' },
  turquoise: {
    bg: 'bg-turquoise',
    text: 'text-turquoise-deep',
    solid: 'var(--color-turquoise)',
    label: 'Turquesa',
  },
  coral: { bg: 'bg-coral', text: 'text-coral-deep', solid: 'var(--color-coral)', label: 'Coral' },
  blush: { bg: 'bg-blush', text: 'text-coral-deep', solid: 'var(--color-blush)', label: 'Rosa' },
  vanilla: {
    bg: 'bg-vanilla',
    text: 'text-vanilla-deep',
    solid: 'var(--color-vanilla)',
    label: 'Vainilla',
  },
  lavender: {
    bg: 'bg-lavender',
    text: 'text-lavender-deep',
    solid: 'var(--color-lavender)',
    label: 'Lavanda',
  },
}

export const CATEGORY_COLORS = Object.keys(CATEGORY_THEME) as CategoryColor[]

export const CATEGORY_ICONS = [
  '💻', '🌍', '🎨', '🧘', '🔬', '💰', '📚', '🎵', '🍳', '🌱', '✈️', '🧠', '🛠️', '📝', '🌺', '🐚',
]

export const AVATARS = ['🌺', '🐚', '🌴', '🍍', '🥥', '🐠', '🌊', '⭐', '🦋', '🐢', '🌈', '🍉']
