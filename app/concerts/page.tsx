import ConcertCard from '@/app/components/concert-card'
import ConcertSearchForm from '@/app/components/concert-search-form'
import { CONCERT_LIST_SELECT, fetchConcertIdsByProgram } from '@/lib/concerts'
import { createClient } from '@/lib/supabase/server'

type Props = {
  searchParams: Promise<{
    event_date?: string
    prefecture?: string
    program?: string
  }>
}

export default async function ConcertListPage({ searchParams }: Props) {
  const { event_date, prefecture, program } = await searchParams
  const supabase = await createClient()

  let concertIds: number[] | null = null

  try {
    concertIds = await fetchConcertIdsByProgram(program)
  } catch {
    return <main className="p-6">曲目検索に失敗しました。</main>
  }

  if (program && concertIds?.length === 0) {
    return (
      <main className="space-y-7">
        <section className="panel-strong p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Concerts</p>
          <h1 className="section-title mt-2">演奏会一覧</h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base">
            ご指定の条件に合う演奏会は見つかりませんでした。検索条件を少し広げてお試しください。
          </p>
        </section>
        <section className="panel p-6 md:p-8">
          <ConcertSearchForm eventDate={event_date} prefecture={prefecture} program={program} />
        </section>
      </main>
    )
  }

  let query = supabase
    .from('concerts')
    .select(CONCERT_LIST_SELECT)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (event_date) {
    query = query.eq('event_date', event_date)
  }

  if (prefecture) {
    query = query.eq('prefecture', prefecture)
  }

  if (concertIds) {
    query = query.in('id', concertIds)
  }

  const { data: concerts, error } = await query

  if (error) {
    return <main className="p-6">一覧の取得に失敗しました。</main>
  }

  return (
    <main className="space-y-7 md:space-y-8">
      <section className="panel-strong p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Concerts</p>
        <h1 className="section-title mt-2">演奏会一覧</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base">
          開催日、都道府県、曲目から演奏会を横断して探せます。
        </p>
      </section>

      <section className="panel p-6 md:p-8">
        <ConcertSearchForm eventDate={event_date} prefecture={prefecture} program={program} />
      </section>

      <section className="space-y-4 md:space-y-5">
        {concerts?.map((concert) => (
          <ConcertCard key={concert.id} concert={concert} />
        ))}
      </section>
    </main>
  )
}
