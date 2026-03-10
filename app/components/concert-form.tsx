'use client'

import { useActionState, useState } from 'react'
import type { ConcertFormState } from '@/app/actions/concerts'
import AlertMessage from '@/app/components/alert-message'
import { PREFECTURES } from '@/lib/prefectures'
import type { ConcertFormAction, ConcertFormValues, ProgramInput } from '@/types/concert'

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
    setPrograms((current) => [...current, { title: '', composer: '', order_no: current.length + 1 }])
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
    <form action={formAction} className="panel-strong space-y-7 p-6 md:space-y-8 md:p-9">
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}
      {state.error && <AlertMessage>{state.error}</AlertMessage>}

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <div className="md:col-span-2">
          <label className="label-text">演奏会名</label>
          <input name="title" defaultValue={initialValues?.title ?? ''} required className="field" />
        </div>

        <div>
          <label className="label-text">開催日</label>
          <input
            name="event_date"
            type="date"
            defaultValue={initialValues?.event_date ?? ''}
            required
            className="field"
          />
        </div>

        <div>
          <label className="label-text">開演時間</label>
          <input
            name="start_time"
            type="time"
            defaultValue={initialValues?.start_time ?? ''}
            required
            className="field"
          />
        </div>

        <div>
          <label className="label-text">都道府県</label>
          <select
            name="prefecture"
            required
            defaultValue={initialValues?.prefecture ?? ''}
            className="select-field"
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
          <label className="label-text">会場</label>
          <input name="venue" defaultValue={initialValues?.venue ?? ''} required className="field" />
        </div>

        <div className="md:col-span-2">
          <label className="label-text">主催者名</label>
          <input
            name="organization_name"
            defaultValue={initialValues?.organization_name ?? ''}
            required
            className="field"
          />
        </div>

        <div>
          <label className="label-text">公式URL</label>
          <input
            name="official_url"
            type="url"
            defaultValue={initialValues?.official_url ?? ''}
            className="field"
          />
        </div>

        <div>
          <label className="label-text">チラシ画像URL</label>
          <input
            name="flyer_image_url"
            type="url"
            defaultValue={initialValues?.flyer_image_url ?? ''}
            className="field"
          />
        </div>
      </div>

      <div>
        <label className="label-text">備考</label>
        <textarea
          name="note"
          defaultValue={initialValues?.note ?? ''}
          className="textarea-field min-h-36"
          rows={5}
        />
      </div>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Program</p>
            <h2 className="section-title mt-2 text-[var(--primary-strong)]">プログラム</h2>
          </div>
          <button type="button" onClick={addProgram} className="secondary-button">
            曲目を追加
          </button>
        </div>

        {programs.map((program, index) => (
          <div key={index} className="rounded-3xl border border-[var(--line)] bg-white/88 p-5 md:p-6">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--accent)]">
              Program {index + 1}
            </div>

            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_auto] md:items-end">
              <div>
                <label className="label-text">曲名</label>
                <input
                  value={program.title}
                  onChange={(event) => updateProgram(index, 'title', event.target.value)}
                  className="field"
                />
              </div>

              <div>
                <label className="label-text">作曲者</label>
                <input
                  value={program.composer ?? ''}
                  onChange={(event) => updateProgram(index, 'composer', event.target.value)}
                  className="field"
                />
              </div>

              <button type="button" onClick={() => removeProgram(index)} className="secondary-button">
                削除
              </button>
            </div>
          </div>
        ))}
      </section>

      <input type="hidden" name="programs" value={JSON.stringify(programs)} readOnly />

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isPending} className="primary-button min-w-44 disabled:opacity-60">
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}
