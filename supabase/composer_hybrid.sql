-- Run this in the Supabase SQL editor before deploying the app changes.

create table if not exists public.composers (
  id bigint generated always as identity primary key,
  display_name text not null,
  sort_name text,
  search_normalized text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists composers_display_name_key
  on public.composers (display_name);

create index if not exists composers_search_normalized_idx
  on public.composers (search_normalized);

alter table public.programs
  add column if not exists composer_id bigint references public.composers(id) on delete restrict,
  add column if not exists composer_free_text text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'programs_composer_required_check'
  ) then
    alter table public.programs
      add constraint programs_composer_required_check
      check (
        composer_id is not null
        or nullif(btrim(composer_free_text), '') is not null
      );
  end if;
end $$;

insert into public.composers (display_name, sort_name, search_normalized)
select distinct
  p.composer,
  p.composer,
  lower(trim(regexp_replace(p.composer, '\s+', ' ', 'g')))
from public.programs p
where p.composer is not null
  and nullif(btrim(p.composer), '') is not null
on conflict (display_name) do nothing;

update public.programs p
set composer_id = c.id
from public.composers c
where p.composer_id is null
  and p.composer is not null
  and btrim(p.composer) = c.display_name;

update public.programs
set composer_free_text = composer
where composer_id is null
  and composer_free_text is null
  and composer is not null
  and nullif(btrim(composer), '') is not null;
