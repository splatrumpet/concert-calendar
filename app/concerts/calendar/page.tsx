import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type Props = {
  searchParams: Promise<{
    month?: string
    date?: string
  }>
}

type CalendarDay = {
  date: string
  inMonth: boolean
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(value)
}

function parseMonth(month?: string): { year: number; month: number } {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  }

  const [year, monthNumber] = month.split('-').map(Number)
  return { year, month: monthNumber }
}

function makeMonthMeta(year: number, month: number) {
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const firstWeekday = first.getDay()

  const start = new Date(year, month - 1, 1 - firstWeekday)
  const days: CalendarDay[] = []

  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    const date = formatDate(day)

    days.push({
      date,
      inMonth: day.getMonth() === month - 1,
    })
  }

  return {
    monthStart: formatDate(first),
    monthEnd: formatDate(last),
    days,
  }
}

export default async function ConcertCalendarPage({ searchParams }: Props) {
  const params = await searchParams
  const selected = parseMonth(params.month)
  const { monthStart, monthEnd, days } = makeMonthMeta(selected.year, selected.month)
  const selectedDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : undefined

  const supabase = await createClient()

  const { data: monthConcerts, error: monthError } = await supabase
    .from('concerts')
    .select('id,title,event_date,start_time')
    .gte('event_date', monthStart)
    .lte('event_date', monthEnd)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true })

  const counts = new Map<string, number>()
  for (const concert of monthConcerts ?? []) {
    counts.set(concert.event_date, (counts.get(concert.event_date) ?? 0) + 1)
  }

  const { data: selectedDayConcerts, error: dayError } = selectedDate
    ? await supabase
        .from('concerts')
        .select('id,title,event_date,start_time,prefecture,venue')
        .eq('event_date', selectedDate)
        .order('start_time', { ascending: true })
    : { data: [], error: null }

  const monthString = `${selected.year}-${String(selected.month).padStart(2, '0')}`
  const prev = new Date(selected.year, selected.month - 2, 1)
  const next = new Date(selected.year, selected.month, 1)

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">演奏会カレンダー</h1>
        <div className="flex gap-3 text-sm">
          <Link href={`/concerts/calendar?month=${formatDate(prev).slice(0, 7)}`} className="underline">
            前月
          </Link>
          <span>{monthString}</span>
          <Link href={`/concerts/calendar?month=${formatDate(next).slice(0, 7)}`} className="underline">
            次月
          </Link>
        </div>
      </div>

      {monthError && <p>カレンダー表示に失敗しました。</p>}

      {!monthError && (
        <div className="grid grid-cols-7 gap-2 rounded border bg-white p-4 text-sm">
          {['日', '月', '火', '水', '木', '金', '土'].map((weekday) => (
            <div key={weekday} className="font-semibold">
              {weekday}
            </div>
          ))}
          {days.map((day) => {
            const count = counts.get(day.date) ?? 0
            const isSelected = selectedDate === day.date
            return (
              <Link
                key={day.date}
                href={`/concerts/calendar?month=${monthString}&date=${day.date}`}
                className={`min-h-20 rounded border p-2 ${
                  day.inMonth ? 'bg-white' : 'bg-slate-100 text-slate-400'
                } ${isSelected ? 'border-slate-900' : ''}`}
              >
                <div>{day.date.slice(8, 10)}</div>
                {count > 0 && <div className="mt-1 text-xs">{count}件</div>}
              </Link>
            )
          })}
        </div>
      )}

      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 text-xl font-semibold">
          {selectedDate ? `${selectedDate} の演奏会` : '日付を選択してください'}
        </h2>

        {dayError && <p>日付別一覧の取得に失敗しました。</p>}

        {!dayError && selectedDate && (selectedDayConcerts?.length ?? 0) === 0 && <p>この日の演奏会はありません。</p>}

        <div className="space-y-3">
          {selectedDayConcerts?.map((concert) => (
            <article key={concert.id} className="rounded border p-3">
              <h3 className="font-semibold">{concert.title}</h3>
              <p>{concert.event_date} {concert.start_time}</p>
              <p>{concert.prefecture} / {concert.venue}</p>
              <Link href={`/concerts/${concert.id}`} className="underline">
                詳細を見る
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
