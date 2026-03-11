import { notFound, redirect } from 'next/navigation'
import ConcertEditForm from './ui'
import { requireUser } from '@/lib/auth'
import { fetchConcertById } from '@/lib/concerts'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditConcertPage({ params }: Props) {
  const { id } = await params
  const { user } = await requireUser()
  const concert = await fetchConcertById(id)

  if (!concert) {
    notFound()
  }

  if (concert.created_by !== user.id) {
    redirect(`/concerts/${concert.id}`)
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 md:space-y-7">
      <section className="panel-strong p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">Edit</p>
        <h1 className="section-title mt-2">Edit Concert</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base">
          Update the concert details and program list.
        </p>
      </section>
      <ConcertEditForm concert={concert} />
    </main>
  )
}
