import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConcertEditForm from './ui'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditConcertPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: concert, error } = await supabase
    .from('concerts')
    .select(`
      id,
      title,
      event_date,
      start_time,
      prefecture,
      venue,
      organization_name,
      flyer_image_url,
      official_url,
      note,
      created_by,
      programs (
        id,
        title,
        composer,
        order_no
      )
    `)
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
