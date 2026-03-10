import Link from 'next/link'
import type { ConcertListItem } from '@/types/concert'

type Props = {
  concert: ConcertListItem
  actions?: React.ReactNode
}

export default function ConcertCard({ concert, actions }: Props) {
  return (
    <article className="rounded border bg-white p-4">
      <h2 className="text-xl font-semibold">{concert.title}</h2>
      <p>
        {concert.event_date} {concert.start_time}
      </p>
      <p>
        {concert.prefecture} / {concert.venue}
      </p>
      <p>{concert.organization_name}</p>
      <div className="mt-3 flex gap-3">
        <Link href={`/concerts/${concert.id}`} className="underline">
          詳細を見る
        </Link>
        {actions}
      </div>
    </article>
  )
}
