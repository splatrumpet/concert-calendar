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