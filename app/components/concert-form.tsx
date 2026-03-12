'use client'

import { useActionState, useState } from 'react'
import type { ConcertFormState } from '@/app/actions/concerts'
import AlertMessage from '@/app/components/alert-message'
import { PREFECTURES } from '@/lib/prefectures'
import { normalizeSearchText } from '@/lib/text'
import type {
  ComposerRecord,
  ConcertFormAction,
  ConcertFormValues,
  ProgramInput,
} from '@/types/concert'

type Props = {
  action: ConcertFormAction
  submitLabel: string
  pendingLabel: string
  composerOptions: ComposerRecord[]
  initialValues?: ConcertFormValues
}

type ProgramFormItem = ProgramInput & {
  clientId: string
}

const EMPTY_PROGRAM: ProgramInput = {
  title: '',
  composer_id: '',
  composer_label: '',
  composer_free_text: '',
  soloist: '',
  order_no: 1,
}

const INITIAL_STATE: ConcertFormState = { error: null }
const COMPOSER_DATALIST_ID = 'composer-options'

function createProgramClientId(): string {
  return crypto.randomUUID()
}

function toProgramFormItem(program: ProgramInput, index: number): ProgramFormItem {
  return {
    title: program.title,
    composer_id: program.composer_id ?? '',
    composer_label: program.composer_label ?? '',
    composer_free_text: program.composer_free_text ?? '',
    soloist: program.soloist ?? '',
    order_no: index + 1,
    clientId: createProgramClientId(),
  }
}

function toProgramInput(program: ProgramFormItem): ProgramInput {
  return {
    title: program.title,
    composer_id: program.composer_id,
    composer_label: program.composer_label,
    composer_free_text: program.composer_free_text,
    soloist: program.soloist,
    order_no: program.order_no,
  }
}

function normalizePrograms(programs?: ProgramInput[]): ProgramFormItem[] {
  if (!programs || programs.length === 0) {
    return [{ ...EMPTY_PROGRAM, clientId: createProgramClientId() }]
  }

  return programs.map(toProgramFormItem)
}

function getComposerInputValue(program: ProgramFormItem): string {
  return program.composer_id ? program.composer_label ?? '' : program.composer_free_text ?? ''
}


function normalizeProgramComposer(program: ProgramFormItem, composerOptions: ComposerRecord[], value: string): ProgramFormItem {
  const matchedComposer = findComposerOption(composerOptions, value)

  if (!value.trim()) {
    return {
      ...program,
      composer_id: '',
      composer_label: '',
      composer_free_text: '',
    }
  }

  if (matchedComposer) {
    return {
      ...program,
      composer_id: String(matchedComposer.id),
      composer_label: matchedComposer.display_name,
      composer_free_text: '',
    }
  }

  return {
    ...program,
    composer_id: '',
    composer_label: '',
    composer_free_text: value,
  }
}

function updateProgramById(
  programs: ProgramFormItem[],
  programId: string,
  updater: (program: ProgramFormItem) => ProgramFormItem
) {
  return programs.map((program) => (program.clientId === programId ? updater(program) : program))
}

function renumberPrograms(programs: ProgramFormItem[]): ProgramFormItem[] {
  return programs.map((program, index) => ({ ...program, order_no: index + 1 }))
}

function findComposerOption(composerOptions: ComposerRecord[], value: string): ComposerRecord | undefined {
  const normalizedValue = normalizeSearchText(value)
  return composerOptions.find((composer) => normalizeSearchText(composer.display_name) === normalizedValue)
}

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'))

function getTimeParts(value?: string | null): { hour: string; minute: string } {
  if (!value) {
    return { hour: '', minute: '' }
  }

  const [hour = '', minute = ''] = value.slice(0, 5).split(':')

  if (!HOURS.includes(hour) || !MINUTES.includes(minute)) {
    return { hour: '', minute: '' }
  }

  return { hour, minute }
}

function toTimeValue(hour: string, minute: string): string {
  return hour && minute ? `${hour}:${minute}` : ''
}

export default function ConcertForm({
  action,
  submitLabel,
  pendingLabel,
  composerOptions,
  initialValues,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)
  const [programs, setPrograms] = useState<ProgramFormItem[]>(normalizePrograms(initialValues?.programs))
  const [openTimeHour, setOpenTimeHour] = useState(getTimeParts(initialValues?.open_time).hour)
  const [openTimeMinute, setOpenTimeMinute] = useState(getTimeParts(initialValues?.open_time).minute)
  const [startTimeHour, setStartTimeHour] = useState(getTimeParts(initialValues?.start_time).hour)
  const [startTimeMinute, setStartTimeMinute] = useState(getTimeParts(initialValues?.start_time).minute)

  const hasInvalidProgram = programs.some(
    (program) => !program.title.trim() || (!program.composer_id && !program.composer_free_text?.trim())
  )
  const programValidationError = hasInvalidProgram
    ? '各プログラムに曲名と作曲家を入力してください。'
    : null

  const addProgram = () => {
    setPrograms((current) => [
      ...current,
      { ...EMPTY_PROGRAM, order_no: current.length + 1, clientId: createProgramClientId() },
    ])
  }

  const removeProgram = (programId: string) => {
    setPrograms((current) => renumberPrograms(current.filter((program) => program.clientId !== programId)))
  }

  const updateProgram = (programId: string, key: keyof ProgramInput, value: string) => {
    setPrograms((current) => updateProgramById(current, programId, (program) => ({ ...program, [key]: value })))
  }

  const updateProgramComposer = (programId: string, value: string) => {
    setPrograms((current) =>
      updateProgramById(current, programId, (program) => normalizeProgramComposer(program, composerOptions, value))
    )
  }

  return (
    <form action={formAction} className="panel-strong space-y-7 p-6 md:space-y-8 md:p-9">
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}
      {state.error && <AlertMessage>{state.error}</AlertMessage>}

      <datalist id={COMPOSER_DATALIST_ID}>
        {composerOptions.map((composer) => (
          <option key={composer.id} value={composer.display_name} />
        ))}
      </datalist>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <div className="md:col-span-2">
          <label className="label-text">タイトル</label>
          <input name="title" defaultValue={initialValues?.title ?? ''} required className="field" />
        </div>

        <div>
          <label className="label-text">日付</label>
          <input
            name="event_date"
            type="date"
            defaultValue={initialValues?.event_date ?? ''}
            required
            className="field"
          />
        </div>

        <div>
          <label className="label-text">主催者</label>
          <input
            name="organization_name"
            defaultValue={initialValues?.organization_name ?? ''}
            required
            className="field"
          />
        </div>

        <div>
          <label className="label-text">指揮者</label>
          <input name="conductor" defaultValue={initialValues?.conductor ?? ''} className="field" />
        </div>

        <div>
          <label className="label-text">開場時間</label>
          <div className="time-field-wrap">
            <select
              value={openTimeHour}
              onChange={(event) => setOpenTimeHour(event.target.value)}
              className="select-field"
              aria-label="開場時間（時）"
            >
              <option value="">時</option>
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
            <span className="time-separator">:</span>
            <select
              value={openTimeMinute}
              onChange={(event) => setOpenTimeMinute(event.target.value)}
              className="select-field"
              aria-label="開場時間（分）"
            >
              <option value="">分</option>
              {MINUTES.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </div>
          <input type="hidden" name="open_time" value={toTimeValue(openTimeHour, openTimeMinute)} readOnly />
        </div>

        <div>
          <label className="label-text">開演時間</label>
          <div className="time-field-wrap">
            <select
              value={startTimeHour}
              onChange={(event) => setStartTimeHour(event.target.value)}
              className="select-field"
              aria-label="開演時間（時）"
              required
            >
              <option value="">時</option>
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
            <span className="time-separator">:</span>
            <select
              value={startTimeMinute}
              onChange={(event) => setStartTimeMinute(event.target.value)}
              className="select-field"
              aria-label="開演時間（分）"
              required
            >
              <option value="">分</option>
              {MINUTES.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </div>
          <input type="hidden" name="start_time" value={toTimeValue(startTimeHour, startTimeMinute)} readOnly />
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
        <label className="label-text">メモ</label>
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
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
              プログラム
            </p>
            <h2 className="section-title mt-2 text-[var(--primary-strong)]">プログラム</h2>
          </div>
          <button type="button" onClick={addProgram} className="secondary-button">
            プログラムを追加
          </button>
        </div>

        {programs.map((program, index) => (
          <div key={program.clientId} className="rounded-3xl border border-[var(--line)] bg-white/88 p-5 md:p-6">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--accent)]">
              プログラム {index + 1}
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end">
              <div>
                <label className="label-text">曲名</label>
                <input
                  value={program.title}
                  onChange={(event) => updateProgram(program.clientId, 'title', event.target.value)}
                  className="field"
                />
              </div>

              <div>
                <label className="label-text">作曲家</label>
                <input
                  value={getComposerInputValue(program)}
                  onChange={(event) => updateProgramComposer(program.clientId, event.target.value)}
                  list={COMPOSER_DATALIST_ID}
                  className="field"
                  placeholder="作曲家名を入力または選択"
                />
              </div>

              <div>
                <label className="label-text">ソリスト（任意）</label>
                <input
                  value={program.soloist ?? ''}
                  onChange={(event) => updateProgram(program.clientId, 'soloist', event.target.value)}
                  className="field"
                  placeholder="例: Vn. 山田 花子"
                />
              </div>

              <button
                type="button"
                onClick={() => removeProgram(program.clientId)}
                className="secondary-button"
                disabled={programs.length === 1}
              >
                削除
              </button>
            </div>
          </div>
        ))}

        {programValidationError && <AlertMessage>{programValidationError}</AlertMessage>}
      </section>

      <input type="hidden" name="programs" value={JSON.stringify(programs.map(toProgramInput))} readOnly />

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending || Boolean(programValidationError)}
          className="primary-button min-w-44 disabled:opacity-60"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}
