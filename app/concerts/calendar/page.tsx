import Link from 'next/link'
import { getAdjacentMonth, getMonthString, isValidDate, makeMonthMeta, parseMonth } from '@/lib/date'
import { createClient } from '@/lib/supabase/server'

type Props = {
  searchParams: Promise<{
    month?: string
    date?: string
  }>
}

export default async function ConcertCalendarPage({ searchParams }: Props) {
  const params = await searchParams
  const selected = parseMonth(params.month)
  const { monthStart, monthEnd, days } = makeMonthMeta(selected.year, selected.month)
  const selectedDate = isValidDate(params.date) ? params.date : undefined

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

  const monthString = getMonthString(selected.year, selected.month)

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">演奏会カレンダー</h1>
        <div className="flex gap-3 text-sm">
          <Link href={`/concerts/calendar?month=${getAdjacentMonth(selected.year, selected.month, -1)}`} className="underline">
            前月
          </Link>
          <span>{monthString}</span>
          <Link href={`/concerts/calendar?month=${getAdjacentMonth(selected.year, selected.month, 1)}`} className="underline">
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
              <p>
                {concert.event_date} {concert.start_time}
              </p>
              <p>
                {concert.prefecture} / {concert.venue}
              </p>
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
