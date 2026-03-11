import Link from 'next/link'
import { getAdjacentMonth, getMonthString, isValidDate, makeMonthMeta, parseMonth } from '@/lib/date'
import { createClient } from '@/lib/supabase/server'

type Props = {
  searchParams: Promise<{
    month?: string
    date?: string
  }>
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default async function ConcertCalendarPage({ searchParams }: Props) {
  const params = await searchParams
  const selected = parseMonth(params.month)
  const { monthStart, monthEnd, days } = makeMonthMeta(selected.year, selected.month)
  const selectedDate = isValidDate(params.date) ? params.date : undefined

  const supabase = await createClient()

  const { data: monthConcerts, error: monthError } = await supabase
    .from('concerts')
    .select('id,title,event_date,open_time,start_time')
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
        .select('id,title,event_date,open_time,start_time,prefecture,venue')
        .eq('event_date', selectedDate)
        .order('start_time', { ascending: true })
    : { data: [], error: null }

  const monthString = getMonthString(selected.year, selected.month)
  const prevMonth = getAdjacentMonth(selected.year, selected.month, -1)
  const nextMonth = getAdjacentMonth(selected.year, selected.month, 1)

  return (
    <main className="space-y-7 md:space-y-8">
      <section className="panel-strong p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Calendar</p>
            <h1 className="section-title mt-2">演奏会カレンダー</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/concerts/calendar?month=${prevMonth}`} className="secondary-button">
              前月
            </Link>
            <span className="rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--primary-strong)]">
              {monthString}
            </span>
            <Link href={`/concerts/calendar?month=${nextMonth}`} className="secondary-button">
              次月
            </Link>
          </div>
        </div>
      </section>

      {monthError && <p>カレンダー表示に失敗しました。</p>}

      {!monthError && (
        <section className="panel p-4 md:p-6">
          <div className="grid grid-cols-7 gap-2 md:gap-3 text-sm">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="pb-2 text-center text-xs font-semibold tracking-[0.08em] text-[var(--primary)] md:text-sm">
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
                  className={`min-h-24 rounded-2xl border p-3 md:min-h-28 md:p-4 ${
                    day.inMonth
                      ? 'border-[var(--line)] bg-white text-slate-900'
                      : 'border-transparent bg-slate-100/70 text-slate-400'
                  } ${isSelected ? 'border-[var(--primary)] ring-4 ring-blue-100' : ''}`}
                >
                  <div className="text-sm font-semibold md:text-base">{day.date.slice(8, 10)}</div>
                  {count > 0 && (
                    <div className="mt-3 inline-flex rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--primary-strong)]">
                      {count}件
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="panel p-6 md:p-8">
        <h2 className="section-title text-[1.35rem] md:text-[1.55rem]">
          {selectedDate ? `${selectedDate} の演奏会` : '日付を選択してください'}
        </h2>

        {dayError && <p className="mt-5">日付別一覧の取得に失敗しました。</p>}
        {!dayError && selectedDate && (selectedDayConcerts?.length ?? 0) === 0 && (
          <p className="mt-5">この日の演奏会はありません。</p>
        )}

        <div className="mt-6 space-y-4">
          {selectedDayConcerts?.map((concert) => (
            <article key={concert.id} className="rounded-3xl border border-[var(--line)] bg-white p-5">
              <h3 className="text-lg font-semibold md:text-xl">{concert.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {concert.event_date}
                {concert.open_time ? ` / 開場 ${concert.open_time}` : ''}
                {` / 開演 ${concert.start_time}`}
              </p>
              <p className="text-sm leading-6 text-slate-600">
                {concert.prefecture} / {concert.venue}
              </p>
              <Link href={`/concerts/${concert.id}`} className="text-link mt-4 inline-flex">
                詳細を見る
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
