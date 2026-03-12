import { PREFECTURES } from '@/lib/prefectures'

type Props = {
  eventDate?: string
  prefecture?: string
  program?: string
  composer?: string
  action?: string
  submitLabel?: string
  formClassName?: string
  programClassName?: string
  composerClassName?: string
  submitClassName?: string
}

export default function ConcertSearchForm({
  eventDate,
  prefecture,
  program,
  composer,
  action = '/concerts',
  submitLabel = '検索',
  formClassName = 'grid gap-3 md:grid-cols-5',
  programClassName = 'field',
  composerClassName = 'field',
  submitClassName = 'primary-button',
}: Props) {
  return (
    <form action={action} method="get" className={formClassName}>
      <input
        type="date"
        name="event_date"
        defaultValue={eventDate}
        className="field"
        aria-label="開催日"
      />
      <select
        name="prefecture"
        defaultValue={prefecture ?? ''}
        className="select-field"
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
        className={programClassName}
      />
      <input
        type="text"
        name="composer"
        defaultValue={composer}
        placeholder="作曲家"
        className={composerClassName}
      />
      <button type="submit" className={submitClassName}>
        {submitLabel}
      </button>
    </form>
  )
}
