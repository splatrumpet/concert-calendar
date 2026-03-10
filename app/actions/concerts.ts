'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  buildConcertMutation,
  buildProgramRows,
  type ConcertPayload,
} from '@/lib/concerts'
import type { ConcertInput, ProgramInput } from '@/types/concert'

export type ConcertFormState = {
  error: string | null
}

const CONCERT_PATHS = ['/', '/concerts', '/concerts/calendar', '/mypage'] as const
const DEFAULT_ERROR_MESSAGE = '処理に失敗しました。時間をおいて再試行してください。'
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

function parsePrograms(raw: FormDataEntryValue | null): ProgramInput[] {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(String(raw)) as ProgramInput[]

    return parsed
      .map((program, index) => ({
        title: String(program.title ?? '').trim(),
        composer: String(program.composer ?? '').trim(),
        order_no: Number(program.order_no ?? index + 1),
      }))
      .filter((program) => program.title.length > 0)
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
    start_time: getFormValue(formData, 'start_time'),
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

  if (payload.programs.length === 0) {
    throw new Error('プログラムを1件以上入力してください。')
  }
}

function toErrorState(error: unknown): ConcertFormState {
  if (error instanceof Error) {
    return { error: error.message }
  }

  return { error: DEFAULT_ERROR_MESSAGE }
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
    throw new Error('対象の演奏会が見つかりません。')
  }

  if (data.created_by !== userId) {
    throw new Error('この演奏会を操作する権限がありません。')
  }
}

function revalidateConcertPaths(concertId: string) {
  CONCERT_PATHS.forEach((path) => revalidatePath(path))
  revalidatePath(`/concerts/${concertId}`)
  revalidatePath(`/concerts/${concertId}/edit`)
}

async function replacePrograms(
  supabase: Awaited<ReturnType<typeof createClient>>,
  concertId: string,
  programs: ProgramInput[]
) {
  const { error: deleteProgramsError } = await supabase
    .from('programs')
    .delete()
    .eq('concert_id', concertId)

  if (deleteProgramsError) {
    throw new Error(deleteProgramsError.message)
  }

  const { error: insertProgramsError } = await supabase
    .from('programs')
    .insert(buildProgramRows(concertId, programs))

  if (insertProgramsError) {
    throw new Error(insertProgramsError.message)
  }
}

export async function createConcertAction(
  _prevState: ConcertFormState,
  formData: FormData
): Promise<ConcertFormState> {
  try {
    const payload = buildPayload(formData)
    validatePayload(payload)

    const { supabase, userId } = await getCurrentUserId()
    const { data: concert, error: concertError } = await supabase
      .from('concerts')
      .insert(buildConcertMutation(payload, userId))
      .select('id')
      .single()

    if (concertError || !concert) {
      throw new Error(concertError?.message ?? '演奏会の作成に失敗しました。')
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
  } catch (error) {
    return toErrorState(error)
  }
}

export async function updateConcertAction(
  _prevState: ConcertFormState,
  formData: FormData
): Promise<ConcertFormState> {
  try {
    const payload = buildPayload(formData)

    if (!payload.id) {
      throw new Error('演奏会IDが不正です。')
    }

    validatePayload(payload)

    const { supabase, userId } = await getCurrentUserId()
    await assertOwner(supabase, payload.id, userId)

    const { error: updateError } = await supabase
      .from('concerts')
      .update(buildConcertMutation(payload))
      .eq('id', payload.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    await replacePrograms(supabase, payload.id, payload.programs)

    revalidateConcertPaths(payload.id)
    redirect(`/concerts/${payload.id}`)
  } catch (error) {
    return toErrorState(error)
  }
}

export async function deleteConcertAction(formData: FormData): Promise<void> {
  const concertId = getFormValue(formData, 'id')

  if (!concertId) {
    throw new Error('演奏会IDが不正です。')
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
