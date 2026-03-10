import { PREFECTURES } from '@/lib/prefectures'

type Props = {
  eventDate?: string
  prefecture?: string
  program?: string
  action?: string
  submitLabel?: string
}

export default function ConcertSearchForm({
  eventDate,
  prefecture,
  program,
  action = '/concerts',
  submitLabel = '検索',
}: Props) {
  return (
    <form action={action} method="get" className="grid gap-3 rounded border bg-white p-4 md:grid-cols-4">
      <input
        type="date"
        name="event_date"
        defaultValue={eventDate}
        className="rounded border px-3 py-2"
        aria-label="開催日"
      />
      <select
        name="prefecture"
        defaultValue={prefecture ?? ''}
        className="rounded border px-3 py-2"
        aria-label="都道府県"
      >
        <option value="">都道府県（すべて）</option>
        {PREFECTURES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="program"
        defaultValue={program}
        placeholder="曲目"
        className="rounded border px-3 py-2"
      />
      <button type="submit" className="rounded border bg-slate-900 px-4 py-2 text-white">
        {submitLabel}
      </button>
    </form>
  )
}
