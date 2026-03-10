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
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">マイページ</h1>

      <div className="space-y-4">
        {concerts?.map((concert) => (
          <ConcertCard
            key={concert.id}
            concert={concert}
            actions={
              <>
                <Link href={`/concerts/${concert.id}/edit`} className="underline">
                  編集
                </Link>
                <form action={deleteConcertAction}>
                  <input type="hidden" name="id" value={concert.id} />
                  <button type="submit" className="underline">
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
