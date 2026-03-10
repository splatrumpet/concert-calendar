import ConcertCreateForm from './ui'
import { requireUser } from '@/lib/auth'

export default async function NewConcertPage() {
  await requireUser()

  return (
    <main className="mx-auto max-w-4xl space-y-6 md:space-y-7">
      <section className="panel-strong p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">Create</p>
        <h1 className="section-title mt-2">演奏会を投稿する</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base">
          基本情報とプログラムを入力して、新しい演奏会を公開します。
        </p>
      </section>
      <ConcertCreateForm />
    </main>
  )
}
