alter table public.concerts
  add column if not exists conductor text;

alter table public.programs
  add column if not exists soloist text;
