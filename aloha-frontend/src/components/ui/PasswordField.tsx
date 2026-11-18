import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { TextField } from './fields'

/** Campo de contraseña con botón para mostrar/ocultar. */
export function PasswordField(props: Omit<ComponentProps<typeof TextField>, 'type' | 'trailing'>) {
  const [visible, setVisible] = useState(false)
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/6 hover:text-ink"
        >
          {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      }
    />
  )
}
