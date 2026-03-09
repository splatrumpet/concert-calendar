'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ConcertInput, ProgramInput } from '@/types/concert'

export type ConcertFormState = {
  error: string | null
}

type ConcertPayload = ConcertInput & { id?: string }

function parsePrograms(raw: FormDataEntryValue | null): ProgramInput[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(String(raw)) as ProgramInput[]
    return parsed
      .map((p, index) => ({
        title: String(p.title ?? '').trim(),
        composer: String(p.composer ?? '').trim(),
        order_no: Number(p.order_no ?? index + 1),
      }))
      .filter((p) => p.title.length > 0)
  } catch {
    return []
  }
}

function buildPayload(formData: FormData): ConcertPayload {
  const id = String(formData.get('id') ?? '').trim()

  return {
    id: id || undefined,
    title: String(formData.get('title') ?? '').trim(),
    event_date: String(formData.get('event_date') ?? '').trim(),
    start_time: String(formData.get('start_time') ?? '').trim(),
    prefecture: String(formData.get('prefecture') ?? '').trim(),
    venue: String(formData.get('venue') ?? '').trim(),
    organization_name: String(formData.get('organization_name') ?? '').trim(),
    flyer_image_url: String(formData.get('flyer_image_url') ?? '').trim(),
    official_url: String(formData.get('official_url') ?? '').trim(),
    note: String(formData.get('note') ?? '').trim(),
    programs: parsePrograms(formData.get('programs')),
  }
}

function validatePayload(payload: ConcertPayload): void {
  if (
    !payload.title ||
    !payload.event_date ||
    !payload.start_time ||
    !payload.prefecture ||
    !payload.venue ||
    !payload.organization_name
  ) {
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

  return { error: '処理に失敗しました。時間をおいて再試行してください。' }
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
  revalidatePath('/')
  revalidatePath('/concerts')
  revalidatePath('/concerts/calendar')
  revalidatePath('/mypage')
  revalidatePath(`/concerts/${concertId}`)
  revalidatePath(`/concerts/${concertId}/edit`)
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
      .insert({
        title: payload.title,
        event_date: payload.event_date,
        start_time: payload.start_time,
        prefecture: payload.prefecture,
        venue: payload.venue,
        organization_name: payload.organization_name,
        flyer_image_url: payload.flyer_image_url || null,
        official_url: payload.official_url || null,
        note: payload.note || null,
        created_by: userId,
      })
      .select('id')
      .single()

    if (concertError || !concert) {
      throw new Error(concertError?.message ?? '演奏会の作成に失敗しました。')
    }

    const { error: programError } = await supabase.from('programs').insert(
      payload.programs.map((program, index) => ({
        concert_id: concert.id,
        title: program.title,
        composer: program.composer || null,
        order_no: program.order_no || index + 1,
      }))
    )

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
      .update({
        title: payload.title,
        event_date: payload.event_date,
        start_time: payload.start_time,
        prefecture: payload.prefecture,
        venue: payload.venue,
        organization_name: payload.organization_name,
        flyer_image_url: payload.flyer_image_url || null,
        official_url: payload.official_url || null,
        note: payload.note || null,
      })
      .eq('id', payload.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    const { error: deleteProgramsError } = await supabase
      .from('programs')
      .delete()
      .eq('concert_id', payload.id)

    if (deleteProgramsError) {
      throw new Error(deleteProgramsError.message)
    }

    const { error: insertProgramsError } = await supabase.from('programs').insert(
      payload.programs.map((program, index) => ({
        concert_id: payload.id,
        title: program.title,
        composer: program.composer || null,
        order_no: program.order_no || index + 1,
      }))
    )

    if (insertProgramsError) {
      throw new Error(insertProgramsError.message)
    }

    revalidateConcertPaths(payload.id)
    redirect(`/concerts/${payload.id}`)
  } catch (error) {
    return toErrorState(error)
  }
}

export async function deleteConcertAction(formData: FormData): Promise<void> {
  const concertId = String(formData.get('id') ?? '').trim()

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
