import { Library, Plus } from 'lucide-react'
import { LearningBrowser } from '@/components/learning/LearningBrowser'
import { LinkButton, PageHeader } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function LibraryPage() {
  useDocumentTitle('Biblioteca')
  return (
    <>
      <PageHeader
        title="Biblioteca de conocimientos"
        subtitle="Busca, filtra y repasa todo lo que has aprendido."
        icon={<Library className="size-7 text-lavender-deep" aria-hidden />}
        actions={
          <LinkButton to="/cuaderno/nuevo" icon={<Plus className="size-5" aria-hidden />}>
            Nuevo aprendizaje
          </LinkButton>
        }
      />
      <LearningBrowser layout="grid" pageSize={9} />
    </>
  )
}
