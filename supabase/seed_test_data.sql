-- Supabase SQL Editorで実行してください
-- 目的: ローカル検証用のテストデータ投入（指揮者 / ソリスト対応）
-- 注意: `created_by` は既存の認証ユーザーを使用します。

begin;


do $$
begin
  if not exists (select 1 from auth.users) then
    raise exception 'auth.users にユーザーが存在しないため、テストデータを投入できません。先にサインアップしてください。';
  end if;
end $$;

with target_user as (
  select id
  from auth.users
  order by created_at asc
  limit 1
),
upsert_composers as (
  insert into public.composers (display_name, sort_name, search_normalized)
  values
    ('Ludwig van Beethoven', 'Beethoven, Ludwig van', 'ludwig van beethoven'),
    ('Johannes Brahms', 'Brahms, Johannes', 'johannes brahms'),
    ('Pyotr Ilyich Tchaikovsky', 'Tchaikovsky, Pyotr Ilyich', 'pyotr ilyich tchaikovsky')
  on conflict (display_name) do update
    set sort_name = excluded.sort_name,
        search_normalized = excluded.search_normalized,
        updated_at = now()
  returning id, display_name
),
cleanup as (
  delete from public.concerts
  where title in (
    '【テスト】秋のシンフォニー・ガラ',
    '【テスト】チャイコフスキー・ナイト'
  )
  returning id
),
inserted_concerts as (
  insert into public.concerts (
    title,
    event_date,
    open_time,
    start_time,
    conductor,
    prefecture,
    venue,
    organization_name,
    official_url,
    note,
    created_by
  )
  select *
  from (
    select
      '【テスト】秋のシンフォニー・ガラ'::text as title,
      (current_date + 21)::date as event_date,
      '17:30'::time as open_time,
      '18:30'::time as start_time,
      '山田 太郎'::text as conductor,
      '東京都'::text as prefecture,
      'サントリーホール'::text as venue,
      'テスト交響楽団'::text as organization_name,
      'https://example.com/test-gala'::text as official_url,
      '指揮者・ソリスト表示の確認用データ'::text as note,
      (select id from target_user) as created_by

    union all

    select
      '【テスト】チャイコフスキー・ナイト'::text,
      (current_date + 35)::date,
      '18:00'::time,
      '19:00'::time,
      null::text,
      '大阪府'::text,
      'ザ・シンフォニーホール'::text,
      'テストフィル'::text,
      'https://example.com/test-tchaikovsky'::text,
      '指揮者未設定の表示確認用データ'::text,
      (select id from target_user)
  ) concerts_to_insert
  where (select id from target_user) is not null
  returning id, title
)
insert into public.programs (
  concert_id,
  title,
  composer_id,
  composer_free_text,
  soloist,
  order_no
)
select
  c.id,
  p.title,
  co.id,
  p.composer_free_text,
  p.soloist,
  p.order_no
from inserted_concerts c
join (
  values
    ('【テスト】秋のシンフォニー・ガラ', '交響曲第5番 ハ短調 作品67', 'Ludwig van Beethoven', null::text, null::text, 1),
    ('【テスト】秋のシンフォニー・ガラ', 'ヴァイオリン協奏曲 ニ長調 作品61', 'Ludwig van Beethoven', null::text, 'Vn. 田中 花子', 2),
    ('【テスト】チャイコフスキー・ナイト', 'ヴァイオリン協奏曲 ニ長調 作品35', 'Pyotr Ilyich Tchaikovsky', null::text, 'Vn. 佐藤 一郎', 1),
    ('【テスト】チャイコフスキー・ナイト', 'アンコール（テスト作曲家フリー入力）', null::text, 'テスト作曲家', 'Pf. 鈴木 次郎', 2)
) as p(concert_title, title, composer_display_name, composer_free_text, soloist, order_no)
  on c.title = p.concert_title
left join public.composers co
  on co.display_name = p.composer_display_name;

commit;

-- 実行後確認:
-- select id, title, conductor, event_date from public.concerts where title like '【テスト】%';
-- select concert_id, title, soloist, composer_id, composer_free_text from public.programs
-- where concert_id in (select id from public.concerts where title like '【テスト】%')
-- order by concert_id, order_no;
