import { createConcertAction } from '@/app/actions/concerts'
import ConcertForm from '@/app/components/concert-form'

export default function ConcertCreateForm() {
  return <ConcertForm action={createConcertAction} submitLabel="投稿する" pendingLabel="投稿中..." />
}
