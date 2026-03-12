'use server'

import { revalidatePath } from 'next/cache'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  buildConcertMutation,
  buildProgramRows,
  type ConcertPayload,
} from '@/lib/concerts'
import { normalizeSearchText } from '@/lib/text'
import type { ConcertInput, ProgramInput } from '@/types/concert'

export type ConcertFormState = {
  error: string | null
}

type ProgramMutationInput = {
  title: string
  composer_id: number | null
  composer_free_text: string | null
  soloist: string | null
  order_no: number
}

const CONCERT_PATHS = ['/', '/concerts', '/concerts/calendar', '/mypage'] as const
const DEFAULT_ERROR_MESSAGE = '保存に失敗しました。時間をおいて再度お試しください。'
const REQUIRED_FIELDS: Array<keyof ConcertInput> = [
  'title',
  'event_date',
  'start_time',
  'prefecture',
  'venue',
  'organization_name',
]

function getFormValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

function toOptionalTrimmedString(value: unknown): string | undefined {
  const normalizedValue = String(value ?? '').trim()
  return normalizedValue || undefined
}

function parseProgramInput(program: ProgramInput, index: number): ProgramInput {
  return {
    title: String(program.title ?? '').trim(),
    composer_id: toOptionalTrimmedString(program.composer_id),
    composer_label: toOptionalTrimmedString(program.composer_label),
    composer_free_text: toOptionalTrimmedString(program.composer_free_text),
    soloist: toOptionalTrimmedString(program.soloist),
    order_no: Number(program.order_no ?? index + 1),
  }
}

function hasComposer(program: ProgramInput): boolean {
  return Boolean(program.composer_id || program.composer_free_text)
}

function isFiveMinuteTime(value: string | undefined): boolean {
  if (!value) {
    return true
  }

  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false
  }

  const minutes = Number(value.split(':')[1])
  return minutes % 5 === 0
}

function parsePrograms(raw: FormDataEntryValue | null): ProgramInput[] {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(String(raw)) as ProgramInput[]

    return parsed.map(parseProgramInput).filter((program) => program.title.length > 0)
  } catch {
    return []
  }
}

function buildPayload(formData: FormData): ConcertPayload {
  const id = getFormValue(formData, 'id')

  return {
    id: id || undefined,
    title: getFormValue(formData, 'title'),
    event_date: getFormValue(formData, 'event_date'),
    open_time: getFormValue(formData, 'open_time'),
    start_time: getFormValue(formData, 'start_time'),
    conductor: getFormValue(formData, 'conductor'),
    prefecture: getFormValue(formData, 'prefecture'),
    venue: getFormValue(formData, 'venue'),
    organization_name: getFormValue(formData, 'organization_name'),
    flyer_image_url: getFormValue(formData, 'flyer_image_url'),
    official_url: getFormValue(formData, 'official_url'),
    note: getFormValue(formData, 'note'),
    programs: parsePrograms(formData.get('programs')),
  }
}

function validatePayload(payload: ConcertPayload): void {
  if (REQUIRED_FIELDS.some((field) => !payload[field])) {
    throw new Error('必須項目を入力してください。')
  }

  if (!isFiveMinuteTime(payload.open_time) || !isFiveMinuteTime(payload.start_time)) {
    throw new Error('開場時間と開演時間は5分単位で入力してください。')
  }

  if (payload.programs.length === 0) {
    throw new Error('プログラムを1件以上入力してください。')
  }

  if (payload.programs.some((program) => !hasComposer(program))) {
    throw new Error('各プログラムに作曲家を設定してください。')
  }
}

function toErrorState(error: unknown): ConcertFormState {
  if (error instanceof Error) {
    return { error: error.message }
  }

  return { error: DEFAULT_ERROR_MESSAGE }
}

async function executeConcertAction(action: () => Promise<void>): Promise<ConcertFormState> {
  try {
    await action()
    return { error: null }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    return toErrorState(error)
  }
}

async function getCurrentUserId() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('ログインが必要です。')
  }

  return { supabase, userId: user.id }
}

async function assertComposerIdsExist(
  supabase: Awaited<ReturnType<typeof createClient>>,
  programs: ProgramInput[]
) {
  const composerIds = [...new Set(programs.map((program) => program.composer_id).filter(Boolean))]

  if (composerIds.length === 0) {
    return
  }

  const { data, error } = await supabase
    .from('composers')
    .select('id, display_name')
    .in('id', composerIds)

  if (error) {
    throw new Error(error.message)
  }

  if ((data ?? []).length !== composerIds.length) {
    throw new Error('存在しない作曲家が指定されています。')
  }

  const displayNameById = new Map((data ?? []).map((composer) => [String(composer.id), composer.display_name]))

  for (const program of programs) {
    if (!program.composer_id || !program.composer_label) {
      continue
    }

    const displayName = displayNameById.get(program.composer_id)

    if (displayName && normalizeSearchText(displayName) !== normalizeSearchText(program.composer_label)) {
      throw new Error('作曲家の選択内容が不正です。')
    }
  }
}

async function assertOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  concertId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('concerts')
    .select('created_by')
    .eq('id', concertId)
    .single()

  if (error || !data) {
    throw new Error('対象のコンサートが見つかりません。')
  }

  if (data.created_by !== userId) {
    throw new Error('このコンサートを編集する権限がありません。')
  }
}

function revalidateConcertPaths(concertId: string) {
  CONCERT_PATHS.forEach((path) => revalidatePath(path))
  revalidatePath(`/concerts/${concertId}`)
  revalidatePath(`/concerts/${concertId}/edit`)
}

function buildProgramMutationInput(programs: ProgramInput[]): ProgramMutationInput[] {
  return programs.map((program, index) => ({
    title: program.title,
    composer_id: program.composer_id ? Number(program.composer_id) : null,
    composer_free_text: program.composer_id ? null : program.composer_free_text ?? null,
    soloist: program.soloist ?? null,
    order_no: program.order_no || index + 1,
  }))
}

async function replaceConcertAndPrograms(
  supabase: Awaited<ReturnType<typeof createClient>>,
  concertId: string,
  userId: string,
  payload: ConcertPayload
) {
  const concert = buildConcertMutation(payload)
  const programs = buildProgramMutationInput(payload.programs)

  const { data, error } = await supabase.rpc('replace_concert_and_programs', {
    p_concert_id: Number(concertId),
    p_user_id: userId,
    p_title: concert.title,
    p_event_date: concert.event_date,
    p_open_time: concert.open_time,
    p_start_time: concert.start_time,
    p_conductor: concert.conductor,
    p_prefecture: concert.prefecture,
    p_venue: concert.venue,
    p_organization_name: concert.organization_name,
    p_flyer_image_url: concert.flyer_image_url,
    p_official_url: concert.official_url,
    p_note: concert.note,
    p_programs: programs,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data !== true) {
    throw new Error('コンサート更新に失敗しました。')
  }
}

export async function createConcertAction(
  _prevState: ConcertFormState,
  formData: FormData
): Promise<ConcertFormState> {
  return executeConcertAction(async () => {
    const payload = buildPayload(formData)
    validatePayload(payload)

    const { supabase, userId } = await getCurrentUserId()
    await assertComposerIdsExist(supabase, payload.programs)

    const { data: concert, error: concertError } = await supabase
      .from('concerts')
      .insert(buildConcertMutation(payload, userId))
      .select('id')
      .single()

    if (concertError || !concert) {
      throw new Error(concertError?.message ?? 'コンサートの保存に失敗しました。')
    }

    const { error: programError } = await supabase
      .from('programs')
      .insert(buildProgramRows(concert.id, payload.programs))

    if (programError) {
      await supabase.from('concerts').delete().eq('id', concert.id)
      throw new Error(programError.message)
    }

    revalidateConcertPaths(String(concert.id))
    redirect(`/concerts/${concert.id}`)
  })
}

export async function updateConcertAction(
  _prevState: ConcertFormState,
  formData: FormData
): Promise<ConcertFormState> {
  return executeConcertAction(async () => {
    const payload = buildPayload(formData)

    if (!payload.id) {
      throw new Error('コンサートIDが不正です。')
    }

    validatePayload(payload)

    const { supabase, userId } = await getCurrentUserId()
    await assertComposerIdsExist(supabase, payload.programs)
    await assertOwner(supabase, payload.id, userId)

    await replaceConcertAndPrograms(supabase, payload.id, userId, payload)

    revalidateConcertPaths(payload.id)
    redirect(`/concerts/${payload.id}`)
  })
}

export async function deleteConcertAction(formData: FormData): Promise<void> {
  const concertId = getFormValue(formData, 'id')

  if (!concertId) {
    throw new Error('コンサートIDが不正です。')
  }

  const { supabase, userId } = await getCurrentUserId()
  await assertOwner(supabase, concertId, userId)

  const { error } = await supabase.from('concerts').delete().eq('id', concertId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateConcertPaths(concertId)
  redirect('/mypage')
}
