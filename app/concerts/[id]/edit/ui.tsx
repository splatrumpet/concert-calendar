import { updateConcertAction } from '@/app/actions/concerts'
import ConcertForm from '@/app/components/concert-form'
import { fetchComposerOptions, getProgramComposerName, sortPrograms } from '@/lib/concerts'
import type { ConcertRecord } from '@/types/concert'

export default async function ConcertEditForm({ concert }: { concert: ConcertRecord }) {
  const composerOptions = await fetchComposerOptions()

  return (
    <ConcertForm
      action={updateConcertAction}
      submitLabel="Update"
      pendingLabel="Updating..."
      composerOptions={composerOptions}
      initialValues={{
        id: String(concert.id),
        title: concert.title,
        event_date: concert.event_date,
        open_time: concert.open_time,
        start_time: concert.start_time,
        prefecture: concert.prefecture,
        venue: concert.venue,
        organization_name: concert.organization_name,
        official_url: concert.official_url,
        flyer_image_url: concert.flyer_image_url,
        note: concert.note,
        programs: sortPrograms(concert.programs).map((program, index) => ({
          title: program.title,
          composer_id: program.composer_id ? String(program.composer_id) : '',
          composer_label: program.composer?.display_name ?? '',
          composer_free_text: program.composer_id ? '' : getProgramComposerName(program),
          order_no: index + 1,
        })),
      }}
    />
  )
}
