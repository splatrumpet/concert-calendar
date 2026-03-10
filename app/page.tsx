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

  const todayCount = todayConcerts?.length ?? 0

  return (
    <main className="space-y-10 md:space-y-12">
      <section className="hero-panel px-6 py-10 md:px-10 md:py-14">
        <div className="hero-grid" />
        <div className="relative z-10 flex flex-col gap-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow">Curated Today</span>
              <h1 className="mt-5 max-w-3xl text-[2.8rem] font-bold leading-[0.98] tracking-[-0.075em] md:text-[5.6rem]">
                今日の演奏会を、
                <br />
                静かに美しく探す。
              </h1>
              <p className="mt-5 max-w-2xl text-[0.98rem] leading-8 text-blue-50/86 md:text-[1.08rem]">
                白を基調に、濃い青で輪郭を整えた演奏会カレンダー。開催日、地域、曲目から、気になる公演へ上品にたどり着けます。
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:w-[25rem] lg:grid-cols-1">
              <div className="hero-metric">
                <div className="hero-kicker">Today</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{today}</div>
              </div>
              <div className="hero-metric">
                <div className="hero-kicker">Concerts</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{todayCount}</div>
                <div className="mt-1 text-sm text-blue-100/82">本日掲載されている演奏会</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
            <div className="rounded-[2rem] border border-white/14 bg-white/10 p-5 backdrop-blur md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="hero-kicker">Quick Search</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] md:text-[2rem]">
                    条件を入れて、すぐ探す
                  </h2>
                </div>
                <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-blue-50">
                  Signature Access
                </span>
              </div>
              <ConcertSearchForm submitLabel="検索する" />
            </div>

            <div className="grid gap-4">
              <Link
                href="/concerts"
                className="rounded-[2rem] border border-white/14 bg-white/8 p-5 text-white backdrop-blur transition hover:bg-white/14 md:p-6"
              >
                <div className="hero-kicker">Collection</div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">演奏会一覧を見る</div>
                <p className="mt-3 text-sm leading-7 text-blue-50/82">
                  掲載中の演奏会を一覧で眺めながら、気になる公演を比較できます。
                </p>
              </Link>

              <Link
                href="/concerts/calendar"
                className="rounded-[2rem] bg-white px-5 py-5 text-[var(--primary-strong)] shadow-[0_24px_44px_rgba(7,25,56,0.2)] transition hover:-translate-y-0.5 md:px-6 md:py-6"
              >
                <div className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
                  Calendar View
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">日付から選ぶ</div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  月全体の気配を眺めながら、その日の公演へ静かにアクセスできます。
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="panel-strong surface-grid p-6 md:p-8">
        <div className="mb-6 md:mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Featured</p>
          <h2 className="section-title mt-2">本日の演奏会</h2>
        </div>

        {error && <p>本日の演奏会の取得に失敗しました。</p>}
        {!error && todayCount === 0 && <p>本日開催の演奏会はまだ登録されていません。</p>}

        <div className="space-y-4 md:space-y-5">
          {todayConcerts?.map((concert) => (
            <ConcertCard key={concert.id} concert={concert} />
          ))}
        </div>
      </section>

      <section className="panel p-6 md:p-8">
        <div className="mb-6 md:mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Refine</p>
          <h2 className="section-title mt-2">曲目や地域から、さらに絞り込む</h2>
        </div>
        <ConcertSearchForm submitLabel="検索する" />
      </section>
    </main>
  )
}
