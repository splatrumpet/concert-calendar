import { createClient } from '@/lib/supabase/server'
import type { ComposerRecord, ConcertInput, ConcertRecord, ProgramRecord } from '@/types/concert'

type ProgramRow = Omit<ProgramRecord, 'composer'> & {
  composer: ComposerRecord[] | ComposerRecord | null
}

type ConcertRow = Omit<ConcertRecord, 'programs'> & {
  programs: ProgramRow[] | null
}

export const CONCERT_LIST_SELECT =
  'id,title,event_date,open_time,start_time,prefecture,venue,organization_name'

export const CONCERT_DETAIL_SELECT = `
  id,
  title,
  event_date,
  open_time,
  start_time,
  prefecture,
  venue,
  organization_name,
  flyer_image_url,
  official_url,
  note,
  created_by,
  programs (
    id,
    title,
    composer_id,
    composer_free_text,
    order_no,
    composer:composers!programs_composer_id_fkey (
      id,
      display_name
    )
  )
`

export type ConcertPayload = ConcertInput & { id?: string }

export function normalizeOptionalText(value: string): string | null {
  return value || null
}

export function buildConcertMutation(payload: ConcertInput, createdBy?: string) {
  return {
    title: payload.title,
    event_date: payload.event_date,
    open_time: normalizeOptionalText(payload.open_time ?? ''),
    start_time: payload.start_time,
    prefecture: payload.prefecture,
    venue: payload.venue,
    organization_name: payload.organization_name,
    flyer_image_url: normalizeOptionalText(payload.flyer_image_url ?? ''),
    official_url: normalizeOptionalText(payload.official_url ?? ''),
    note: normalizeOptionalText(payload.note ?? ''),
    ...(createdBy ? { created_by: createdBy } : {}),
  }
}

export function buildProgramRows(concertId: string | number, programs: ConcertInput['programs']) {
  return programs.map((program, index) => ({
    concert_id: concertId,
    title: program.title,
    composer_id: program.composer_id ? Number(program.composer_id) : null,
    composer_free_text: program.composer_id
      ? null
      : normalizeOptionalText(program.composer_free_text ?? ''),
    order_no: program.order_no || index + 1,
  }))
}

export function sortPrograms<T extends Pick<ProgramRecord, 'order_no'>>(
  programs: T[] | null | undefined
): T[] {
  return [...(programs ?? [])].sort((left, right) => left.order_no - right.order_no)
}

export function getProgramComposerName(
  program: Pick<ProgramRecord, 'composer' | 'composer_free_text'>
): string {
  return program.composer?.display_name ?? program.composer_free_text ?? ''
}

export async function fetchComposerOptions(): Promise<ComposerRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('composers')
    .select('id, display_name')
    .order('display_name', { ascending: true })

  if (error) {
    throw new Error('作曲家一覧の取得に失敗しました。')
  }

  return (data ?? []) as ComposerRecord[]
}

export async function fetchConcertById(id: string): Promise<ConcertRecord | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('concerts')
    .select(CONCERT_DETAIL_SELECT)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  const concert = data as ConcertRow

  return {
    ...concert,
    programs: (concert.programs ?? []).map((program) => ({
      ...program,
      composer: Array.isArray(program.composer) ? program.composer[0] ?? null : program.composer,
    })),
  }
}

export async function fetchConcertIdsByProgram(program?: string): Promise<number[] | null> {
  if (!program) {
    return null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('programs')
    .select('concert_id')
    .ilike('title', `%${program}%`)

  if (error) {
    throw new Error('プログラム検索に失敗しました。')
  }

  return [...new Set((data ?? []).map((row) => row.concert_id))]
}
