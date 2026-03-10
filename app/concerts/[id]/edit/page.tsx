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
    <main className="mx-auto max-w-4xl space-y-6 md:space-y-7">
      <section className="panel-strong p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">Edit</p>
        <h1 className="section-title mt-2">演奏会を編集する</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base">
          内容を更新して、最新の情報をわかりやすく保てます。
        </p>
      </section>
      <ConcertEditForm concert={concert} />
    </main>
  )
}
