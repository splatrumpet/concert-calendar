'use client'

import { useActionState, useState } from 'react'
import { createConcertAction } from '@/app/actions/concerts'
import { PREFECTURES } from '@/lib/prefectures'

type ProgramFormRow = {
  title: string
  composer: string
  order_no: number
}

export default function ConcertCreateForm() {
  const [state, formAction, isPending] = useActionState(createConcertAction, { error: null })
  const [programs, setPrograms] = useState<ProgramFormRow[]>([
    { title: '', composer: '', order_no: 1 },
  ])

  const addProgram = () => {
    setPrograms((prev) => [
      ...prev,
      { title: '', composer: '', order_no: prev.length + 1 },
    ])
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
      {state.error && <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}

      <div>
        <label className="mb-1 block">コンサート名</label>
        <input name="title" required className="w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block">開催日</label>
        <input name="event_date" type="date" required className="w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block">開演時間</label>
        <input name="start_time" type="time" required className="w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block">都道府県</label>
        <select
          name="prefecture"
          required
          defaultValue=""
          className="w-full rounded border px-3 py-2"
        >
          <option value="" disabled>
            都道府県を選択
          </option>
          {PREFECTURES.map((prefecture) => (
            <option key={prefecture} value={prefecture}>
              {prefecture}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block">会場</label>
        <input name="venue" required className="w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block">主催者名</label>
        <input name="organization_name" required className="w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block">公式URL</label>
        <input name="official_url" type="url" className="w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block">チラシ画像URL</label>
        <input name="flyer_image_url" type="url" className="w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block">メモ</label>
        <textarea name="note" className="w-full rounded border px-3 py-2" rows={4} />
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">プログラム</h2>

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

            <button
              type="button"
              onClick={() => removeProgram(index)}
              className="rounded border px-3 py-1"
            >
              プログラムを削除
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addProgram}
          className="rounded border px-4 py-2"
        >
          プログラムを追加
        </button>
      </section>

      <input type="hidden" name="programs" value={JSON.stringify(programs)} readOnly />

      <button type="submit" disabled={isPending} className="rounded border px-4 py-2 disabled:opacity-60">
        {isPending ? '投稿中...' : '投稿する'}
      </button>
    </form>
  )
}
