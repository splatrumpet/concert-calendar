import Link from 'next/link'
import { deleteConcertAction } from '@/app/actions/concerts'
import ConcertCard from '@/app/components/concert-card'
import { requireUser } from '@/lib/auth'
import { CONCERT_LIST_SELECT } from '@/lib/concerts'

export default async function MyPage() {
  const { supabase, user } = await requireUser()

  const { data: concerts, error } = await supabase
    .from('concerts')
    .select(CONCERT_LIST_SELECT)
    .eq('created_by', user.id)
    .order('event_date', { ascending: true })

  if (error) {
    return <main className="p-6">一覧の取得に失敗しました。</main>
  }

  return (
    <main className="space-y-7 md:space-y-8">
      <section className="panel-strong p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
          Private Collection
        </p>
        <h1 className="section-title mt-2">マイページ</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base">
          投稿した演奏会を一覧で見渡し、そのまま編集や削除へ進めます。
        </p>
      </section>

      <div className="space-y-4 md:space-y-5">
        {concerts?.map((concert) => (
          <ConcertCard
            key={concert.id}
            concert={concert}
            actions={
              <>
                <Link href={`/concerts/${concert.id}/edit`} className="text-link">
                  編集
                </Link>
                <form action={deleteConcertAction}>
                  <input type="hidden" name="id" value={concert.id} />
                  <button type="submit" className="text-link">
                    削除
                  </button>
                </form>
              </>
            }
          />
        ))}
      </div>
    </main>
  )
}
