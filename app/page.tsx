import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PREFECTURES } from '@/lib/prefectures'

function getTodayInJst(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date())
}

export default async function HomePage() {
  const supabase = await createClient()
  const today = getTodayInJst()

  const { data: todayConcerts, error } = await supabase
    .from('concerts')
    .select('id,title,event_date,start_time,prefecture,venue,organization_name')
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
            <article key={concert.id} className="rounded border p-4">
              <h2 className="text-lg font-semibold">{concert.title}</h2>
              <p>{concert.event_date} {concert.start_time}</p>
              <p>{concert.prefecture} / {concert.venue}</p>
              <p>{concert.organization_name}</p>
              <Link href={`/concerts/${concert.id}`} className="underline">
                詳細を見る
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-2xl font-semibold">検索</h2>
        <form action="/concerts" method="get" className="grid gap-3 md:grid-cols-4">
          <input
            type="date"
            name="event_date"
            className="rounded border px-3 py-2"
            aria-label="開催日"
          />
          <select name="prefecture" defaultValue="" className="rounded border px-3 py-2" aria-label="都道府県">
            <option value="">都道府県（すべて）</option>
            {PREFECTURES.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="program"
            placeholder="曲目"
            className="rounded border px-3 py-2"
          />
          <button type="submit" className="rounded border bg-slate-900 px-4 py-2 text-white">
            検索する
          </button>
        </form>
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
