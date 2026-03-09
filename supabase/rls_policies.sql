-- Supabase SQL Editorで実行してください
-- 目的: concertsは本人のみ update/delete、programsも親concert所有者のみ更新可能

alter table public.concerts enable row level security;
alter table public.programs enable row level security;

drop policy if exists concerts_select_all on public.concerts;
drop policy if exists concerts_insert_own on public.concerts;
drop policy if exists concerts_update_own on public.concerts;
drop policy if exists concerts_delete_own on public.concerts;

create policy concerts_select_all
on public.concerts
for select
using (true);

create policy concerts_insert_own
on public.concerts
for insert
to authenticated
with check (created_by = auth.uid());

create policy concerts_update_own
on public.concerts
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy concerts_delete_own
on public.concerts
for delete
to authenticated
using (created_by = auth.uid());

drop policy if exists programs_select_all on public.programs;
drop policy if exists programs_insert_own_concert on public.programs;
drop policy if exists programs_update_own_concert on public.programs;
drop policy if exists programs_delete_own_concert on public.programs;

create policy programs_select_all
on public.programs
for select
using (true);

create policy programs_insert_own_concert
on public.programs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.concerts c
    where c.id = programs.concert_id
      and c.created_by = auth.uid()
  )
);

create policy programs_update_own_concert
on public.programs
for update
to authenticated
using (
  exists (
    select 1
    from public.concerts c
    where c.id = programs.concert_id
      and c.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.concerts c
    where c.id = programs.concert_id
      and c.created_by = auth.uid()
  )
);

create policy programs_delete_own_concert
on public.programs
for delete
to authenticated
using (
  exists (
    select 1
    from public.concerts c
    where c.id = programs.concert_id
      and c.created_by = auth.uid()
  )
);
