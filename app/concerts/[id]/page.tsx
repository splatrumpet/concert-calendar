import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteConcertAction } from '@/app/actions/concerts'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ConcertDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: concert, error } = await supabase
    .from('concerts')
    .select(`
      id,
      title,
      event_date,
      start_time,
      prefecture,
      venue,
      organization_name,
      flyer_image_url,
      official_url,
      note,
      created_by,
      programs (
        id,
        title,
        composer,
        order_no
      )
    `)
    .eq('id', id)
    .single()

  if (error || !concert) {
    notFound()
  }

  const programs = [...(concert.programs ?? [])].sort((a, b) => a.order_no - b.order_no)
  const isOwner = user?.id === concert.created_by

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <section className="rounded border bg-white p-6">
        <h1 className="mb-4 text-3xl font-bold">{concert.title}</h1>
        <div className="space-y-1">
          <p>開催日: {concert.event_date}</p>
          <p>開演時間: {concert.start_time}</p>
          <p>都道府県: {concert.prefecture}</p>
          <p>会場: {concert.venue}</p>
          <p>団体名: {concert.organization_name}</p>
        </div>

        {isOwner && (
          <div className="mt-5 flex gap-3">
            <Link href={`/concerts/${concert.id}/edit`} className="rounded border px-3 py-2">
              編集
            </Link>
            <form action={deleteConcertAction}>
              <input type="hidden" name="id" value={concert.id} />
              <button type="submit" className="rounded border px-3 py-2">
                削除
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="rounded border bg-white p-6">
        <h2 className="mb-3 text-2xl font-semibold">曲目</h2>
        {programs.length === 0 ? (
          <p>曲目情報はありません。</p>
        ) : (
          <ul className="space-y-2">
            {programs.map((program) => (
              <li key={program.id} className="rounded border p-3">
                <div>{program.title}</div>
                <div className="text-sm text-gray-600">{program.composer ?? ''}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {concert.note && (
        <section className="rounded border bg-white p-6">
          <h2 className="mb-3 text-2xl font-semibold">備考</h2>
          <p>{concert.note}</p>
        </section>
      )}

      {(concert.official_url || concert.flyer_image_url) && (
        <section className="rounded border bg-white p-6">
          <h2 className="mb-3 text-2xl font-semibold">関連情報</h2>
          <div className="space-y-2">
            {concert.official_url && (
              <a href={concert.official_url} target="_blank" rel="noreferrer" className="block underline">
                公式サイトを見る
              </a>
            )}
            {concert.flyer_image_url && (
              <a href={concert.flyer_image_url} target="_blank" rel="noreferrer" className="block underline">
                チラシ画像を見る
              </a>
            )}
          </div>
        </section>
      )}
    </main>
  )
}
