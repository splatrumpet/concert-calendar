import { updateConcertAction } from '@/app/actions/concerts'
import ConcertForm from '@/app/components/concert-form'
import { sortPrograms } from '@/lib/concerts'
import type { ConcertRecord } from '@/types/concert'

export default function ConcertEditForm({ concert }: { concert: ConcertRecord }) {
  return (
    <ConcertForm
      action={updateConcertAction}
      submitLabel="更新する"
      pendingLabel="更新中..."
      initialValues={{
        id: String(concert.id),
        title: concert.title,
        event_date: concert.event_date,
        start_time: concert.start_time,
        prefecture: concert.prefecture,
        venue: concert.venue,
        organization_name: concert.organization_name,
        official_url: concert.official_url,
        flyer_image_url: concert.flyer_image_url,
        note: concert.note,
        programs: sortPrograms(concert.programs).map((program, index) => ({
          title: program.title,
          composer: program.composer ?? '',
          order_no: index + 1,
        })),
      }}
    />
  )
}
