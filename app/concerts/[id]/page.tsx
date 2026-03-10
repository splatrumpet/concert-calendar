import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteConcertAction } from '@/app/actions/concerts'
import { getCurrentUser } from '@/lib/auth'
import { fetchConcertById, sortPrograms } from '@/lib/concerts'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ConcertDetailPage({ params }: Props) {
  const { id } = await params
  const [{ user }, concert] = await Promise.all([getCurrentUser(), fetchConcertById(id)])

  if (!concert) {
    notFound()
  }

  const programs = sortPrograms(concert.programs)
  const isOwner = user?.id === concert.created_by

  return (
    <main className="mx-auto max-w-4xl space-y-6 md:space-y-7">
      <section className="panel-strong p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
              Concert Detail
            </p>
            <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-[-0.05em] md:text-[2.8rem]">
              {concert.title}
            </h1>
            <div className="mt-5 space-y-2 text-sm leading-7 text-slate-600 md:text-base">
              <p>開催日: {concert.event_date}</p>
              <p>開演時間: {concert.start_time}</p>
              <p>都道府県: {concert.prefecture}</p>
              <p>会場: {concert.venue}</p>
              <p>団体名: {concert.organization_name}</p>
            </div>
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-3">
              <Link href={`/concerts/${concert.id}/edit`} className="secondary-button">
                編集
              </Link>
              <form action={deleteConcertAction}>
                <input type="hidden" name="id" value={concert.id} />
                <button type="submit" className="primary-button">
                  削除
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <section className="panel p-6 md:p-8">
        <h2 className="section-title text-[1.35rem] md:text-[1.55rem]">プログラム</h2>
        {programs.length === 0 ? (
          <p className="mt-5">プログラム情報はありません。</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {programs.map((program) => (
              <li key={program.id} className="rounded-3xl border border-[var(--line)] bg-white p-4 md:p-5">
                <div className="text-base font-semibold md:text-lg">{program.title}</div>
                <div className="mt-1 text-sm text-slate-600 md:text-[0.96rem]">{program.composer ?? ''}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {concert.note && (
        <section className="panel p-6 md:p-8">
          <h2 className="section-title text-[1.35rem] md:text-[1.55rem]">備考</h2>
          <p className="mt-5 text-sm leading-8 text-slate-700 md:text-base">{concert.note}</p>
        </section>
      )}

      {(concert.official_url || concert.flyer_image_url) && (
        <section className="panel p-6 md:p-8">
          <h2 className="section-title text-[1.35rem] md:text-[1.55rem]">関連情報</h2>
          <div className="mt-5 flex flex-col gap-3">
            {concert.official_url && (
              <a href={concert.official_url} target="_blank" rel="noreferrer" className="text-link">
                公式サイトを見る
              </a>
            )}
            {concert.flyer_image_url && (
              <a href={concert.flyer_image_url} target="_blank" rel="noreferrer" className="text-link">
                チラシ画像を見る
              </a>
            )}
          </div>
        </section>
      )}
    </main>
  )
}
