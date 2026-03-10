import Link from 'next/link'
import ConcertCard from '@/app/components/concert-card'
import ConcertSearchForm from '@/app/components/concert-search-form'
import { CONCERT_LIST_SELECT } from '@/lib/concerts'
import { getTodayInJst } from '@/lib/date'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const today = getTodayInJst()

  const { data: todayConcerts, error } = await supabase
    .from('concerts')
    .select(CONCERT_LIST_SELECT)
    .eq('event_date', today)
    .order('start_time', { ascending: true })

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <section className="rounded-lg border bg-white p-6">
        <h1 className="mb-3 text-3xl font-bold">今日の演奏会</h1>
        <p className="mb-4 text-sm text-slate-600">{today}</p>

        {error && <p>今日の演奏会取得に失敗しました。</p>}
        {!error && (todayConcerts?.length ?? 0) === 0 && <p>本日開催の演奏会はありません。</p>}

        <div className="space-y-3">
          {todayConcerts?.map((concert) => (
            <ConcertCard key={concert.id} concert={concert} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-2xl font-semibold">検索</h2>
        <ConcertSearchForm submitLabel="検索する" />
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/concerts" className="rounded border bg-white px-4 py-2">
          演奏会一覧へ
        </Link>
        <Link href="/concerts/calendar" className="rounded border bg-white px-4 py-2">
          カレンダーを見る
        </Link>
      </section>
    </main>
  )
}
