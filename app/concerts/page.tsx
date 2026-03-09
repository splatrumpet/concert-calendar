import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PREFECTURES } from '@/lib/prefectures'

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

  if (program) {
    const { data: matchedPrograms, error: programError } = await supabase
      .from('programs')
      .select('concert_id')
      .ilike('title', `%${program}%`)

    if (programError) {
      return <main className="p-6">曲目検索に失敗しました。</main>
    }

    concertIds = [...new Set((matchedPrograms ?? []).map((p) => p.concert_id))]

    if (concertIds.length === 0) {
      return (
        <main className="mx-auto max-w-5xl space-y-6 p-6">
          <h1 className="text-2xl font-bold">演奏会一覧</h1>
          <SearchForm eventDate={event_date} prefecture={prefecture} program={program} />
          <p>該当する演奏会はありませんでした。</p>
        </main>
      )
    }
  }

  let query = supabase
    .from('concerts')
    .select('id,title,event_date,start_time,prefecture,venue,organization_name')
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
      <SearchForm eventDate={event_date} prefecture={prefecture} program={program} />

      <div className="space-y-4">
        {concerts?.map((concert) => (
          <article key={concert.id} className="rounded border bg-white p-4">
            <h2 className="text-xl font-semibold">{concert.title}</h2>
            <p>{concert.event_date} {concert.start_time}</p>
            <p>{concert.prefecture} / {concert.venue}</p>
            <p>{concert.organization_name}</p>
            <Link href={`/concerts/${concert.id}`} className="underline">
              詳細を見る
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}

function SearchForm({
  eventDate,
  prefecture,
  program,
}: {
  eventDate?: string
  prefecture?: string
  program?: string
}) {
  return (
    <form action="/concerts" method="get" className="grid gap-3 rounded border bg-white p-4 md:grid-cols-4">
      <input
        type="date"
        name="event_date"
        defaultValue={eventDate}
        className="rounded border px-3 py-2"
        aria-label="開催日"
      />
      <select
        name="prefecture"
        defaultValue={prefecture ?? ''}
        className="rounded border px-3 py-2"
        aria-label="都道府県"
      >
        <option value="">都道府県（すべて）</option>
        {PREFECTURES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="program"
        defaultValue={program}
        placeholder="曲目"
        className="rounded border px-3 py-2"
      />
      <button type="submit" className="rounded border bg-slate-900 px-4 py-2 text-white">
        検索
      </button>
    </form>
  )
}
