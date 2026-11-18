import { useId, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/cn'
import { TagChip } from '../ui'

const MAX_TAGS = 10

export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .slice(0, 30)
}

interface TagInputProps {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  error?: string
  hint?: string
}

/** Campo de etiquetas: Enter o coma agregan; Retroceso borra la última. */
export function TagInput({ label, value, onChange, suggestions = [], error, hint }: TagInputProps) {
  const id = useId()
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const tag = normalizeTag(raw)
    if (!tag || value.includes(tag) || value.length >= MAX_TAGS) {
      setDraft('')
      return
    }
    onChange([...value, tag])
    setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit(draft)
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const available = suggestions.filter((s) => !value.includes(s))

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${id}-input`} className="text-sm font-extrabold">
        {label}
      </label>
      <div
        className={cn(
          'flex min-h-11 flex-wrap items-center gap-2 rounded-2xl border-2 bg-paper px-3 py-2 transition-all',
          error
            ? 'border-coral-deep'
            : 'border-line hover:border-turquoise focus-within:border-turquoise-deep focus-within:ring-4 focus-within:ring-turquoise/45',
        )}
      >
        {value.map((tag) => (
          <TagChip key={tag} name={tag} active onRemove={() => onChange(value.filter((t) => t !== tag))} />
        ))}
        <input
          id={`${id}-input`}
          list={`${id}-suggestions`}
          value={draft}
          onChange={(event) => {
            const next = event.target.value
            // Una coma pegada o escrita al final confirma la etiqueta.
            if (next.endsWith(',')) commit(next.slice(0, -1))
            else setDraft(next)
          }}
          onKeyDown={onKeyDown}
          onBlur={() => draft && commit(draft)}
          disabled={value.length >= MAX_TAGS}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          placeholder={value.length === 0 ? 'react, hábitos, inglés…' : value.length >= MAX_TAGS ? '' : 'Otra etiqueta'}
          className="min-w-32 flex-1 bg-transparent py-0.5 font-semibold placeholder:font-medium placeholder:text-ink-soft/75 focus-visible:outline-none"
        />
        <datalist id={`${id}-suggestions`}>
          {available.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-bold text-coral-deep">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="text-xs font-semibold text-ink-soft">
          {hint ?? `Presiona Enter o coma para agregar (máx. ${MAX_TAGS}).`}
        </p>
      )}
    </div>
  )
}
