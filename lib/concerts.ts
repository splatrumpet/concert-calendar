import { createClient } from '@/lib/supabase/server'
import type { ConcertInput, ConcertRecord, ProgramRecord } from '@/types/concert'

export const CONCERT_LIST_SELECT =
  'id,title,event_date,start_time,prefecture,venue,organization_name'

export const CONCERT_DETAIL_SELECT = `
  id,
  title,
  event_date,
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
    composer,
    order_no
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
    composer: normalizeOptionalText(program.composer ?? ''),
    order_no: program.order_no || index + 1,
  }))
}

export function sortPrograms<T extends Pick<ProgramRecord, 'order_no'>>(programs: T[] | null | undefined): T[] {
  return [...(programs ?? [])].sort((left, right) => left.order_no - right.order_no)
}

export async function fetchConcertById(id: string): Promise<ConcertRecord | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('concerts').select(CONCERT_DETAIL_SELECT).eq('id', id).single()

  if (error || !data) {
    return null
  }

  return data as ConcertRecord
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
    throw new Error('曲目検索に失敗しました。')
  }

  return [...new Set((data ?? []).map((row) => row.concert_id))]
}
