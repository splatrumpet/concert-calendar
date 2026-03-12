export type ProgramInput = {
  title: string
  composer_id?: string
  composer_label?: string
  composer_free_text?: string
  soloist?: string
  order_no: number
}

export type ComposerRecord = {
  id: string | number
  display_name: string
}

export type ConcertInput = {
  title: string
  event_date: string
  open_time?: string
  start_time: string
  conductor?: string
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
  composer_id: string | number | null
  composer_free_text: string | null
  soloist: string | null
  composer: ComposerRecord | null
  order_no: number
}

export type ConcertListItem = {
  id: string | number
  title: string
  event_date: string
  open_time: string | null
  start_time: string
  conductor: string | null
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
  open_time?: string | null
  start_time?: string
  conductor?: string | null
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
