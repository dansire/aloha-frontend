import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMonthLabel } from '@/lib/format'
import type { MonthlyStat } from '@/types'
import { ChartTooltip } from './ChartTooltip'

/** Aprendizajes por mes. Incluye una tabla solo para lectores de pantalla. */
export function MonthlyChart({ data }: { data: MonthlyStat[] }) {
  const rows = data.map((d) => ({ ...d, label: formatMonthLabel(d.month) }))
  return (
    <figure>
      <div className="h-72 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart accessibilityLayer={false} data={rows} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="var(--color-line)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-ink-soft)', fontWeight: 700, fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-ink-soft)', fontWeight: 700, fontSize: 12 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-mint)', opacity: 0.35 }} />
            <Bar
              dataKey="count"
              fill="var(--color-turquoise)"
              stroke="var(--color-turquoise-deep)"
              strokeWidth={2}
              radius={[12, 12, 4, 4]}
              maxBarSize={56}
              animationDuration={700}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        Aprendizajes por mes:{' '}
        {rows.map((row) => `${row.label}: ${row.count}`).join('; ')}.
      </figcaption>
    </figure>
  )
}
