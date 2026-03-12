import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteConcertAction } from '@/app/actions/concerts'
import { getCurrentUser } from '@/lib/auth'
import { fetchConcertById, getProgramComposerName, sortPrograms } from '@/lib/concerts'

type Props = {
  params: Promise<{ id: string }>
}

type DetailCardProps = {
  label: string
  value: string
}

function formatDisplayTime(value: string | null): string {
  if (!value) {
    return '未設定'
  }

  return value.slice(0, 5)
}

function DetailCard({ label, value }: DetailCardProps) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-white/88 px-5 py-4 shadow-sm">
      <div className="text-xs font-semibold tracking-[0.12em] text-[color:var(--accent)]">{label}</div>
      <div className="mt-2 text-base font-semibold leading-7 text-slate-900 md:text-[1.02rem]">{value}</div>
    </div>
  )
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
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.14em] text-[color:var(--accent)]">
              コンサート詳細
            </p>
            <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-[-0.05em] text-slate-900 md:text-[2.8rem]">
              {concert.title}
            </h1>
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

        <div className="mt-6 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailCard label="日付" value={concert.event_date} />
            <DetailCard label="開場時間" value={formatDisplayTime(concert.open_time)} />
            <DetailCard label="開演時間" value={formatDisplayTime(concert.start_time)} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <DetailCard label="主催者" value={concert.organization_name} />
            <DetailCard label="指揮者" value={concert.conductor || '未設定'} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <DetailCard label="都道府県" value={concert.prefecture} />
            <DetailCard label="会場" value={concert.venue} />
          </div>
        </div>
      </section>

      <section className="panel p-6 md:p-8">
        <h2 className="section-title text-[1.35rem] md:text-[1.55rem]">プログラム</h2>
        {programs.length === 0 ? (
          <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base">プログラム情報はありません。</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {programs.map((program) => (
              <li
                key={program.id}
                className="rounded-3xl border border-[var(--line)] bg-white px-5 py-4 shadow-sm md:px-6 md:py-5"
              >
                <div className="text-base font-semibold leading-7 text-slate-900 md:text-lg">
                  {program.title}
                </div>
                <div className="mt-1 text-sm font-medium leading-6 text-slate-600 md:text-[0.96rem]">
                  {getProgramComposerName(program)}
                </div>
                {program.soloist && (
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-600 md:text-[0.96rem]">
                    ソリスト: {program.soloist}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {concert.note && (
        <section className="panel p-6 md:p-8">
          <h2 className="section-title text-[1.35rem] md:text-[1.55rem]">メモ</h2>
          <div className="mt-5 rounded-3xl border border-[var(--line)] bg-white/88 px-5 py-4 shadow-sm">
            <p className="text-sm leading-8 text-slate-700 md:text-base">{concert.note}</p>
          </div>
        </section>
      )}

      {(concert.official_url || concert.flyer_image_url) && (
        <section className="panel p-6 md:p-8">
          <h2 className="section-title text-[1.35rem] md:text-[1.55rem]">関連リンク</h2>
          <div className="mt-5 grid gap-3">
            {concert.official_url && (
              <a
                href={concert.official_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-[var(--line)] bg-white px-5 py-4 text-sm font-semibold text-[var(--primary-strong)] shadow-sm transition hover:border-[var(--primary)]"
              >
                公式サイト
              </a>
            )}
            {concert.flyer_image_url && (
              <a
                href={concert.flyer_image_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-[var(--line)] bg-white px-5 py-4 text-sm font-semibold text-[var(--primary-strong)] shadow-sm transition hover:border-[var(--primary)]"
              >
                チラシ画像
              </a>
            )}
          </div>
        </section>
      )}
    </main>
  )
}
