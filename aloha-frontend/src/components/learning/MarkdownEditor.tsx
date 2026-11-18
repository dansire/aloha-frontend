import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  type LucideIcon,
} from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { MarkdownView } from './MarkdownView'

type FormatKind = 'bold' | 'italic' | 'heading' | 'bullets' | 'numbers' | 'quote' | 'code' | 'link'

const TOOLS: { kind: FormatKind; label: string; icon: LucideIcon }[] = [
  { kind: 'bold', label: 'Negrita', icon: Bold },
  { kind: 'italic', label: 'Cursiva', icon: Italic },
  { kind: 'heading', label: 'Subtítulo', icon: Heading2 },
  { kind: 'bullets', label: 'Lista con viñetas', icon: List },
  { kind: 'numbers', label: 'Lista numerada', icon: ListOrdered },
  { kind: 'quote', label: 'Cita', icon: Quote },
  { kind: 'code', label: 'Código', icon: Code },
  { kind: 'link', label: 'Enlace', icon: LinkIcon },
]

interface Edit {
  value: string
  selectStart: number
  selectEnd: number
}

function wrap(value: string, start: number, end: number, before: string, after: string, placeholder: string): Edit {
  const selected = value.slice(start, end) || placeholder
  return {
    value: value.slice(0, start) + before + selected + after + value.slice(end),
    selectStart: start + before.length,
    selectEnd: start + before.length + selected.length,
  }
}

/** Aplica un prefijo a cada línea tocada por la selección. */
function prefixLines(value: string, start: number, end: number, prefix: (index: number) => string): Edit {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const nextBreak = value.indexOf('\n', end)
  const lineEnd = nextBreak === -1 ? value.length : nextBreak
  const block = value.slice(lineStart, lineEnd) || 'Elemento'
  const changed = block
    .split('\n')
    .map((line, index) => `${prefix(index)}${line}`)
    .join('\n')
  return {
    value: value.slice(0, lineStart) + changed + value.slice(lineEnd),
    selectStart: lineStart,
    selectEnd: lineStart + changed.length,
  }
}

function applyFormat(kind: FormatKind, value: string, start: number, end: number): Edit {
  switch (kind) {
    case 'bold':
      return wrap(value, start, end, '**', '**', 'texto en negrita')
    case 'italic':
      return wrap(value, start, end, '*', '*', 'texto en cursiva')
    case 'code':
      return value.slice(start, end).includes('\n')
        ? wrap(value, start, end, '```\n', '\n```', 'código')
        : wrap(value, start, end, '`', '`', 'código')
    case 'link':
      return wrap(value, start, end, '[', '](https://)', 'texto del enlace')
    case 'heading':
      return prefixLines(value, start, end, () => '## ')
    case 'bullets':
      return prefixLines(value, start, end, () => '- ')
    case 'numbers':
      return prefixLines(value, start, end, (index) => `${index + 1}. `)
    case 'quote':
      return prefixLines(value, start, end, () => '> ')
  }
}

interface MarkdownEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  maxLength?: number
}

/** Editor de contenido enriquecido: barra de formato + pestañas Escribir / Vista previa. */
export function MarkdownEditor({ label, value, onChange, onBlur, error, hint, maxLength = 20000 }: MarkdownEditorProps) {
  const id = useId()
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  const format = (kind: FormatKind) => {
    const area = areaRef.current
    if (!area) return
    const edit = applyFormat(kind, value, area.selectionStart, area.selectionEnd)
    onChange(edit.value)
    requestAnimationFrame(() => {
      area.focus()
      area.setSelectionRange(edit.selectStart, edit.selectEnd)
    })
  }

  const tabClass = (active: boolean) =>
    cn(
      'rounded-full px-4 py-1.5 text-sm font-extrabold transition-colors',
      active ? 'bg-lavender' : 'text-ink-soft hover:bg-ink/5',
    )

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={`${id}-area`} className="text-sm font-extrabold">
          {label}
        </label>
        <div role="tablist" aria-label="Modo del editor" className="flex gap-1 rounded-full border-2 border-line bg-paper p-1">
          <button type="button" role="tab" id={`${id}-tab-write`} aria-selected={tab === 'write'} aria-controls={`${id}-panel`} className={tabClass(tab === 'write')} onClick={() => setTab('write')}>
            Escribir
          </button>
          <button type="button" role="tab" id={`${id}-tab-preview`} aria-selected={tab === 'preview'} aria-controls={`${id}-panel`} className={tabClass(tab === 'preview')} onClick={() => setTab('preview')}>
            Vista previa
          </button>
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-2xl border-2 bg-paper',
          error ? 'border-coral-deep' : 'border-line focus-within:border-turquoise-deep focus-within:ring-4 focus-within:ring-turquoise/45',
        )}
      >
        {tab === 'write' && (
          <div role="toolbar" aria-label="Formato de texto" className="flex flex-wrap gap-1 border-b-2 border-dashed border-line bg-cream/70 p-1.5">
            {TOOLS.map(({ kind, label: toolLabel, icon: Icon }) => (
              <button
                key={kind}
                type="button"
                onClick={() => format(kind)}
                aria-label={toolLabel}
                title={toolLabel}
                className="grid size-9 place-items-center rounded-xl text-ink-soft transition-colors hover:bg-mint hover:text-ink"
              >
                <Icon className="size-4.5" aria-hidden />
              </button>
            ))}
          </div>
        )}

        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`}>
          {tab === 'write' ? (
            <textarea
              id={`${id}-area`}
              ref={areaRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onBlur={onBlur}
              maxLength={maxLength + 1000}
              rows={12}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
              placeholder="Escribe lo que aprendiste. Puedes usar **negrita**, listas, citas y bloques de código."
              className="block min-h-64 w-full resize-y bg-transparent px-4 py-3 leading-relaxed font-semibold placeholder:font-medium placeholder:text-ink-soft/75 focus-visible:outline-none"
            />
          ) : (
            <div className="min-h-64 px-4 py-3">
              {value.trim() ? (
                <MarkdownView content={value} />
              ) : (
                <p className="font-semibold text-ink-soft">Aún no hay nada que mostrar. ¡Escribe algo!</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-xs font-bold text-coral-deep">
            {error}
          </p>
        ) : (
          <p id={`${id}-hint`} className="text-xs font-semibold text-ink-soft">
            {hint}
          </p>
        )}
        <p className={cn('shrink-0 text-xs font-bold', value.length > maxLength ? 'text-coral-deep' : 'text-ink-soft')}>
          {value.length.toLocaleString('es-CO')} / {maxLength.toLocaleString('es-CO')}
        </p>
      </div>
    </div>
  )
}
