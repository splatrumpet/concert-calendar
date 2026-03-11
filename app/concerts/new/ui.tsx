import { createConcertAction } from '@/app/actions/concerts'
import ConcertForm from '@/app/components/concert-form'
import { fetchComposerOptions } from '@/lib/concerts'

export default async function ConcertCreateForm() {
  const composerOptions = await fetchComposerOptions()

  return (
    <ConcertForm
      action={createConcertAction}
      submitLabel="Create"
      pendingLabel="Creating..."
      composerOptions={composerOptions}
    />
  )
}
