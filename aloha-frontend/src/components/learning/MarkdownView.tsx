import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/cn'

/**
 * Renderiza el contenido enriquecido (Markdown + tablas/listas de tareas GFM).
 * react-markdown NO interpreta HTML crudo, así que el contenido no puede inyectar scripts.
 */
export function MarkdownView({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn('markdown', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        disallowedElements={['img']}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
