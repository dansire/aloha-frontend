import { es } from 'date-fns/locale'
import { useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/cn'
import { fromDateKey } from '@/lib/format'

interface ActivityCalendarProps {
  month: Date
  onMonthChange: (month: Date) => void
  selected?: Date
  onSelect: (date: Date) => void
  /** Claves 'YYYY-MM-DD' con aprendizajes: se marcan con un punto. */
  activeDates: Iterable<string>
  compact?: boolean
  className?: string
}

/** Calendario en español con los días de aprendizaje resaltados (react-day-picker). */
export function ActivityCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  activeDates,
  compact = false,
  className,
}: ActivityCalendarProps) {
  const marked = useMemo(() => [...activeDates].map(fromDateKey), [activeDates])

  return (
    <DayPicker
      mode="single"
      locale={es}
      weekStartsOn={1}
      month={month}
      onMonthChange={onMonthChange}
      selected={selected}
      onSelect={(date) => date && onSelect(date)}
      modifiers={{ hasLearning: marked }}
      modifiersClassNames={{ hasLearning: 'has-learning' }}
      className={cn(compact && 'rdp-compact', className)}
    />
  )
}
