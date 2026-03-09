import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteConcertAction } from '@/app/actions/concerts'

export default async function MyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: concerts, error } = await supabase
    .from('concerts')
    .select('id,title,event_date,start_time,prefecture,venue,organization_name')
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
          <article key={concert.id} className="rounded border bg-white p-4">
            <h2 className="text-xl font-semibold">{concert.title}</h2>
            <p>{concert.event_date} {concert.start_time}</p>
            <p>{concert.prefecture} / {concert.venue}</p>
            <p>{concert.organization_name}</p>
            <div className="mt-3 flex gap-3">
              <Link href={`/concerts/${concert.id}`} className="underline">
                詳細
              </Link>
              <Link href={`/concerts/${concert.id}/edit`} className="underline">
                編集
              </Link>
              <form action={deleteConcertAction}>
                <input type="hidden" name="id" value={concert.id} />
                <button type="submit" className="underline">
                  削除
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
