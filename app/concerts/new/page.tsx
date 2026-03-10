import ConcertCreateForm from './ui'
import { requireUser } from '@/lib/auth'

export default async function NewConcertPage() {
  await requireUser()

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">演奏会投稿</h1>
      <ConcertCreateForm />
    </main>
  )
}
