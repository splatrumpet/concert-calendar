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
      <main className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-2xl font-bold">演奏会一覧</h1>
        <ConcertSearchForm eventDate={event_date} prefecture={prefecture} program={program} />
        <p>該当する演奏会はありませんでした。</p>
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
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">演奏会一覧</h1>
      <ConcertSearchForm eventDate={event_date} prefecture={prefecture} program={program} />

      <div className="space-y-4">
        {concerts?.map((concert) => (
          <ConcertCard key={concert.id} concert={concert} />
        ))}
      </div>
    </main>
  )
}
