import { BookOpenText, Plus } from 'lucide-react'
import { LearningBrowser } from '@/components/learning/LearningBrowser'
import { LinkButton, PageHeader } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotebookPage() {
  useDocumentTitle('Cuaderno')
  return (
    <>
      <PageHeader
        title="Mi cuaderno"
        subtitle="Tus aprendizajes en orden cronológico, página por página."
        icon={<BookOpenText className="size-7 text-turquoise-deep" aria-hidden />}
        actions={
          <LinkButton to="/cuaderno/nuevo" icon={<Plus className="size-5" aria-hidden />}>
            Nuevo aprendizaje
          </LinkButton>
        }
      />
      <LearningBrowser layout="journal" pageSize={8} />
    </>
  )
}
