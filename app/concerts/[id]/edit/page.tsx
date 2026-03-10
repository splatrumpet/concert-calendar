import { notFound, redirect } from 'next/navigation'
import ConcertEditForm from './ui'
import { requireUser } from '@/lib/auth'
import { CONCERT_DETAIL_SELECT } from '@/lib/concerts'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditConcertPage({ params }: Props) {
  const { id } = await params
  const { supabase, user } = await requireUser()

  const { data: concert, error } = await supabase
    .from('concerts')
    .select(CONCERT_DETAIL_SELECT)
    .eq('id', id)
    .single()

  if (error || !concert) {
    notFound()
  }

  if (concert.created_by !== user.id) {
    redirect(`/concerts/${concert.id}`)
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">演奏会編集</h1>
      <ConcertEditForm concert={concert} />
    </main>
  )
}
