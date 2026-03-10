import Link from 'next/link'
import type { ConcertListItem } from '@/types/concert'

type Props = {
  concert: ConcertListItem
  actions?: React.ReactNode
}

export default function ConcertCard({ concert, actions }: Props) {
  return (
    <article className="panel group p-6 md:p-7">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)] md:text-[0.8rem]">
        <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1">Concert</span>
        <span>{concert.event_date}</span>
        <span>{concert.start_time}</span>
      </div>

      <h2 className="text-[1.3rem] font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-[1.6rem]">
        {concert.title}
      </h2>

      <div className="mt-4 space-y-1.5 text-sm leading-6 text-slate-600 md:text-[0.96rem]">
        <p>
          {concert.prefecture} / {concert.venue}
        </p>
        <p>{concert.organization_name}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link href={`/concerts/${concert.id}`} className="text-link">
          詳細を見る
        </Link>
        {actions}
      </div>
    </article>
  )
}
