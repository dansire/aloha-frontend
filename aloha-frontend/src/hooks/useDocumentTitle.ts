import { useEffect } from 'react'

/** Título de la pestaña por página (útil para accesibilidad y navegación). */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · ALOHA`
    return () => {
      document.title = previous
    }
  }, [title])
}
