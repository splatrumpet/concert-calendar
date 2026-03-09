'use client'

import { useActionState, useMemo, useState } from 'react'
import { updateConcertAction } from '@/app/actions/concerts'
import { PREFECTURES } from '@/lib/prefectures'

type ProgramFormRow = {
  title: string
  composer: string
  order_no: number
}

type ConcertEdit = {
  id: string | number
  title: string
  event_date: string
  start_time: string
  prefecture: string
  venue: string
  organization_name: string
  flyer_image_url: string | null
  official_url: string | null
  note: string | null
  programs: Array<{
    id: string | number
    title: string
    composer: string | null
    order_no: number
  }> | null
}

export default function ConcertEditForm({ concert }: { concert: ConcertEdit }) {
  const [state, formAction, isPending] = useActionState(updateConcertAction, { error: null })
  const initialPrograms = useMemo<ProgramFormRow[]>(() => {
    const sorted = [...(concert.programs ?? [])].sort((a, b) => a.order_no - b.order_no)
    if (sorted.length === 0) {
      return [{ title: '', composer: '', order_no: 1 }]
    }

    return sorted.map((program, index) => ({
      title: program.title,
      composer: program.composer ?? '',
      order_no: index + 1,
    }))
  }, [concert.programs])

  const [programs, setPrograms] = useState<ProgramFormRow[]>(initialPrograms)

  const addProgram = () => {
    setPrograms((prev) => [...prev, { title: '', composer: '', order_no: prev.length + 1 }])
  }

  const removeProgram = (index: number) => {
    setPrograms((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, order_no: i + 1 }))
    )
  }

  const updateProgram = (index: number, key: keyof ProgramFormRow, value: string) => {
    setPrograms((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: key === 'order_no' ? Number(value) : value,
            }
          : item
      )
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={String(concert.id)} />

      {state.error && <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}

      <div>
        <label className="mb-1 block">演奏会名</label>
        <input name="title" defaultValue={concert.title} required className="w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block">開催日</label>
        <input
          name="event_date"
          type="date"
          defaultValue={concert.event_date}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">開演時間</label>
        <input
          name="start_time"
          type="time"
          defaultValue={concert.start_time}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">都道府県</label>
        <select
          name="prefecture"
          defaultValue={concert.prefecture}
          required
          className="w-full rounded border px-3 py-2"
        >
          {PREFECTURES.map((prefecture) => (
            <option key={prefecture} value={prefecture}>
              {prefecture}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block">会場名</label>
        <input name="venue" defaultValue={concert.venue} required className="w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block">団体名</label>
        <input
          name="organization_name"
          defaultValue={concert.organization_name}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">公式URL</label>
        <input
          name="official_url"
          type="url"
          defaultValue={concert.official_url ?? ''}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">チラシ画像URL</label>
        <input
          name="flyer_image_url"
          type="url"
          defaultValue={concert.flyer_image_url ?? ''}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">備考</label>
        <textarea
          name="note"
          defaultValue={concert.note ?? ''}
          className="w-full rounded border px-3 py-2"
          rows={4}
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">曲目</h2>

        {programs.map((program, index) => (
          <div key={index} className="space-y-3 rounded border p-4">
            <div>
              <label className="mb-1 block">曲名</label>
              <input
                value={program.title}
                onChange={(e) => updateProgram(index, 'title', e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block">作曲者</label>
              <input
                value={program.composer}
                onChange={(e) => updateProgram(index, 'composer', e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <button type="button" onClick={() => removeProgram(index)} className="rounded border px-3 py-1">
              曲目を削除
            </button>
          </div>
        ))}

        <button type="button" onClick={addProgram} className="rounded border px-4 py-2">
          曲目を追加
        </button>
      </section>

      <input type="hidden" name="programs" value={JSON.stringify(programs)} readOnly />

      <button type="submit" disabled={isPending} className="rounded border bg-slate-900 px-4 py-2 text-white disabled:opacity-60">
        {isPending ? '更新中...' : '更新する'}
      </button>
    </form>
  )
}
