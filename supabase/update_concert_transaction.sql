create or replace function public.replace_concert_and_programs(
  p_concert_id bigint,
  p_user_id uuid,
  p_title text,
  p_event_date date,
  p_open_time time,
  p_start_time time,
  p_conductor text,
  p_prefecture text,
  p_venue text,
  p_organization_name text,
  p_flyer_image_url text,
  p_official_url text,
  p_note text,
  p_programs jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.concerts
  set
    title = p_title,
    event_date = p_event_date,
    open_time = p_open_time,
    start_time = p_start_time,
    conductor = p_conductor,
    prefecture = p_prefecture,
    venue = p_venue,
    organization_name = p_organization_name,
    flyer_image_url = p_flyer_image_url,
    official_url = p_official_url,
    note = p_note
  where id = p_concert_id
    and created_by = p_user_id;

  get diagnostics updated_count = row_count;

  if updated_count = 0 then
    raise exception '対象のコンサートが見つからないか、更新権限がありません。';
  end if;

  delete from public.programs
  where concert_id = p_concert_id;

  insert into public.programs (
    concert_id,
    title,
    composer_id,
    composer_free_text,
    soloist,
    order_no
  )
  select
    p_concert_id,
    rows.title,
    rows.composer_id,
    rows.composer_free_text,
    rows.soloist,
    rows.order_no
  from jsonb_to_recordset(p_programs) as rows(
    title text,
    composer_id bigint,
    composer_free_text text,
    soloist text,
    order_no integer
  );

  return true;
end;
$$;
