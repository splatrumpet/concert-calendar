import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConcertCreateForm from './ui'

export default async function NewConcertPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">演奏会投稿</h1>
      <ConcertCreateForm />
    </main>
  )
}
