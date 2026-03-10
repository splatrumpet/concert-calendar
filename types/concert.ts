export type ProgramInput = {
  title: string
  composer?: string
  order_no: number
}

export type ConcertInput = {
  title: string
  event_date: string
  start_time: string
  prefecture: string
  venue: string
  organization_name: string
  flyer_image_url?: string
  official_url?: string
  note?: string
  programs: ProgramInput[]
}

export type ProgramRecord = {
  id: string | number
  title: string
  composer: string | null
  order_no: number
}

export type ConcertListItem = {
  id: string | number
  title: string
  event_date: string
  start_time: string
  prefecture: string
  venue: string
  organization_name: string
}

export type ConcertRecord = ConcertListItem & {
  flyer_image_url: string | null
  official_url: string | null
  note: string | null
  created_by: string
  programs: ProgramRecord[] | null
}

export type ConcertFormValues = {
  id?: string
  title?: string
  event_date?: string
  start_time?: string
  prefecture?: string
  venue?: string
  organization_name?: string
  flyer_image_url?: string | null
  official_url?: string | null
  note?: string | null
  programs?: ProgramInput[]
}

export type ConcertFormAction = (
  state: { error: string | null },
  formData: FormData
) => Promise<{ error: string | null }>
