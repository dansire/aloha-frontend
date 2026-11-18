import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Link } from 'react-router-dom'
import { CATEGORY_THEME } from '@/lib/categoryTheme'
import type { CategoryStat } from '@/types'
import { ChartTooltip } from './ChartTooltip'

/** Distribución por categoría: gráfico de dona + leyenda con enlaces (la leyenda es la versión accesible). */
export function CategoryDonut({ data }: { data: CategoryStat[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative size-44 shrink-0" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer={false}>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
              rootTabIndex={-1}
              paddingAngle={3}
              cornerRadius={8}
              stroke="var(--color-paper)"
              strokeWidth={3}
              animationDuration={700}
            >
              {data.map((item) => (
                <Cell key={item.categoryId} fill={CATEGORY_THEME[item.color].solid} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-2xl leading-none font-semibold">{total}</p>
            <p className="text-xs font-extrabold text-ink-soft">en total</p>
          </div>
        </div>
      </div>

      <ul className="grid w-full flex-1 gap-2" aria-label="Aprendizajes por categoría">
        {data.map((item) => (
          <li key={item.categoryId}>
            <Link
              to={`/biblioteca?categoria=${item.categoryId}`}
              className="flex items-center gap-3 rounded-2xl px-2.5 py-1.5 transition-colors hover:bg-mint/40"
            >
              <span
                className="size-4 shrink-0 rounded-full border-2 border-ink/20"
                style={{ background: CATEGORY_THEME[item.color].solid }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate font-extrabold">
                <span aria-hidden="true">{item.icon}</span> {item.name}
              </span>
              <span className="shrink-0 text-sm font-extrabold text-ink-soft">
                {item.count} · {total ? Math.round((item.count / total) * 100) : 0}%
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
