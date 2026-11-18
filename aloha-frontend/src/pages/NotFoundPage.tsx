import { Shell } from '@/components/illustrations'
import { LinkButton } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Página no encontrada')
  return (
    <div className="card card-stitch mx-auto mt-10 flex max-w-lg flex-col items-center gap-3 px-6 py-12 text-center">
      <Shell className="size-28 animate-float" />
      <p className="font-display text-5xl font-semibold">404</p>
      <h1 className="text-2xl">Esta playa no existe</h1>
      <p className="font-semibold text-ink-soft">La página que buscas no está aquí. Volvamos a tierra firme.</p>
      <LinkButton to="/" className="mt-2">
        Ir al panel
      </LinkButton>
    </div>
  )
}
