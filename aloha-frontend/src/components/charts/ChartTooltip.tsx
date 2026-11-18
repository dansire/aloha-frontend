/** Tooltip con el estilo ALOHA para Recharts. */
export function ChartTooltip({
  active,
  payload,
  label,
  unit = 'aprendizajes',
}: {
  active?: boolean
  payload?: ReadonlyArray<{ value?: number | string; name?: string | number }>
  label?: string | number
  unit?: string
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-2xl border-2 border-line bg-paper px-3.5 py-2 text-sm font-extrabold shadow-pop">
      <p className="text-ink-soft capitalize">{label ?? entry?.name}</p>
      <p>
        {entry?.value} {unit}
      </p>
    </div>
  )
}
