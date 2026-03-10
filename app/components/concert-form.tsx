'use client'

import { useActionState, useState } from 'react'
import type { ConcertFormState } from '@/app/actions/concerts'
import { PREFECTURES } from '@/lib/prefectures'
import type { ConcertFormAction, ConcertFormValues, ProgramInput } from '@/types/concert'
import AlertMessage from '@/app/components/alert-message'

type Props = {
  action: ConcertFormAction
  submitLabel: string
  pendingLabel: string
  initialValues?: ConcertFormValues
}

const EMPTY_PROGRAM: ProgramInput = { title: '', composer: '', order_no: 1 }
const INITIAL_STATE: ConcertFormState = { error: null }

function normalizePrograms(programs?: ProgramInput[]): ProgramInput[] {
  if (!programs || programs.length === 0) {
    return [EMPTY_PROGRAM]
  }

  return programs.map((program, index) => ({
    title: program.title,
    composer: program.composer ?? '',
    order_no: index + 1,
  }))
}

export default function ConcertForm({
  action,
  submitLabel,
  pendingLabel,
  initialValues,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)
  const [programs, setPrograms] = useState<ProgramInput[]>(normalizePrograms(initialValues?.programs))

  const addProgram = () => {
    setPrograms((current) => [
      ...current,
      { title: '', composer: '', order_no: current.length + 1 },
    ])
  }

  const removeProgram = (index: number) => {
    setPrograms((current) =>
      current
        .filter((_, currentIndex) => currentIndex !== index)
        .map((program, currentIndex) => ({ ...program, order_no: currentIndex + 1 }))
    )
  }

  const updateProgram = (index: number, key: keyof ProgramInput, value: string) => {
    setPrograms((current) =>
      current.map((program, currentIndex) =>
        currentIndex === index ? { ...program, [key]: value } : program
      )
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}
      {state.error && <AlertMessage>{state.error}</AlertMessage>}

      <div>
        <label className="mb-1 block">演奏会名</label>
        <input
          name="title"
          defaultValue={initialValues?.title ?? ''}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">開催日</label>
        <input
          name="event_date"
          type="date"
          defaultValue={initialValues?.event_date ?? ''}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">開演時間</label>
        <input
          name="start_time"
          type="time"
          defaultValue={initialValues?.start_time ?? ''}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">都道府県</label>
        <select
          name="prefecture"
          required
          defaultValue={initialValues?.prefecture ?? ''}
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
        <input
          name="venue"
          defaultValue={initialValues?.venue ?? ''}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">主催者名</label>
        <input
          name="organization_name"
          defaultValue={initialValues?.organization_name ?? ''}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">公式URL</label>
        <input
          name="official_url"
          type="url"
          defaultValue={initialValues?.official_url ?? ''}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">チラシ画像URL</label>
        <input
          name="flyer_image_url"
          type="url"
          defaultValue={initialValues?.flyer_image_url ?? ''}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block">備考</label>
        <textarea
          name="note"
          defaultValue={initialValues?.note ?? ''}
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
                onChange={(event) => updateProgram(index, 'title', event.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block">作曲者</label>
              <input
                value={program.composer ?? ''}
                onChange={(event) => updateProgram(index, 'composer', event.target.value)}
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

      <button
        type="submit"
        disabled={isPending}
        className="rounded border bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  )
}
