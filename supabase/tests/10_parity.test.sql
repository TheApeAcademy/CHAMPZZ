-- Clubhouse posts, reading plans, the Digital Bank and Record-a-verse.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

create schema tests;
create function tests.make_user(p_kind text default 'adult') returns uuid language plpgsql as $$
declare v uuid := gen_random_uuid();
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, email_confirmed_at)
  values (v, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v || '@t.local', jsonb_build_object('kind', p_kind), '{}'::jsonb, now());
  return v;
end $$;
create function tests.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end $$;
create function tests.reset() returns void language plpgsql as $$
begin execute 'reset role'; perform set_config('request.jwt.claims', '', true); end $$;
create table tests.v (k text primary key, id uuid);
grant usage on schema tests to authenticated, anon;
grant select on tests.v to authenticated, anon;
create function tests.id(p text) returns uuid language sql stable as $$ select id from tests.v where k = p $$;
grant execute on function tests.id(text) to authenticated, anon;

do $$
declare a uuid; b uuid; plan uuid;
begin
  select id into plan from public.plans where code = 'starter';
  insert into public.organizations (slug, name, kind, status, faith_mode) values ('pt-a', 'PT A', 'church', 'active', true) returning id into a;
  insert into public.organizations (slug, name, kind, status, faith_mode) values ('pt-b', 'PT B', 'club', 'active', false) returning id into b;
  insert into public.subscriptions (organization_id, plan_id, billing_interval, currency, current_period_start, current_period_end)
    values (a, plan, 'month', 'NGN', now(), now() + interval '30 days'), (b, plan, 'month', 'NGN', now(), now() + interval '30 days');
  insert into tests.v values ('a', a), ('b', b), ('teacher', tests.make_user()), ('teacher_b', tests.make_user()),
    ('parent', tests.make_user()), ('stranger', tests.make_user()), ('u_ada', tests.make_user('kid')), ('u_bo', tests.make_user('kid'));
  insert into public.memberships (organization_id, user_id, role) values (a, tests.id('teacher'), 'teacher'), (b, tests.id('teacher_b'), 'teacher');
  insert into public.kids (organization_id, user_id, first_name, username, confirmed_at) values
    (a, tests.id('u_ada'), 'Ada', 'brave-lion-71', now()), (b, tests.id('u_bo'), 'Bo', 'swift-fox-72', now());
  insert into tests.v select 'ada', id from public.kids where username = 'brave-lion-71';
  insert into tests.v select 'bo', id from public.kids where username = 'swift-fox-72';
  insert into public.guardians (organization_id, kid_id, user_id) values (a, tests.id('ada'), tests.id('parent'));
  insert into tests.v select 'psalms', id from public.reading_plans where title = 'Brave hearts: 5 Psalms' and organization_id is null;
end $$;

-- ---------- Clubhouse posts ----------
select tests.act_as(tests.id('teacher'));
select lives_ok($$insert into public.club_posts (organization_id, title, body) values (tests.id('a'), 'Fun day on Saturday', 'Bring a friend!')$$, 'staff post news');
select lives_ok($$insert into public.club_posts (organization_id, title, body, published) values (tests.id('a'), 'Draft idea', 'Not yet', false)$$, 'and drafts');
select tests.reset();
set local role anon;
select is((select array_agg(title) from public.get_clubhouse_posts('pt-a')), array['Fun day on Saturday'], 'the public Clubhouse shows published posts only');
select throws_ok($$select * from public.club_posts$$, '42501', null, 'anon cannot read the table directly');
reset role;
select tests.act_as(tests.id('teacher_b'));
select throws_ok($$insert into public.club_posts (organization_id, title, body) values (tests.id('a'), 'Hack', 'x')$$, '42501', null, 'another club cannot post here');
select tests.reset();
select tests.act_as(tests.id('u_ada'));
select throws_ok($$insert into public.club_posts (organization_id, title, body) values (tests.id('a'), 'Kid post', 'x')$$, '42501', null, 'kids cannot post');
select tests.reset();

-- ---------- reading plans ----------
select tests.act_as(tests.id('u_ada'));
select is((select count(*)::int from public.reading_plans), 2, 'a faith-mode kid sees the default plans');
do $$
declare d uuid;
begin
  for d in select id from public.reading_plan_days where plan_id = tests.id('psalms') order by day loop
    perform public.mark_reading_day(d);
  end loop;
end $$;
select tests.reset();
select is((select count(*)::int from public.reading_progress where kid_id = tests.id('ada')), 5, 'five days read');
select is((select coalesce(sum(points), 0)::int from public.point_events where kid_id = tests.id('ada') and source = 'reading_day'), 25, 'five points a day');
select ok(exists (select 1 from public.certificates where kid_id = tests.id('ada') and title = 'Reading plan: Brave hearts: 5 Psalms'), 'finishing the plan earns a certificate');
select tests.act_as(tests.id('u_ada'));
select is((public.mark_reading_day((select id from public.reading_plan_days where plan_id = tests.id('psalms') and day = 1)) ->> 'points')::int, 0, 'a day pays once');
select tests.reset();
select is((select count(*)::int from public.certificates where kid_id = tests.id('ada')), 1, 'and the certificate is given once');
select tests.act_as(tests.id('u_bo'));
select is((select count(*)::int from public.reading_plans), 0, 'reading plans are for faith mode only');
select throws_ok($$select public.mark_reading_day((select id from public.reading_plan_days limit 1))$$, 'P0001', 'not_allowed', 'and cannot be ticked off without it');
select tests.reset();

-- ---------- Digital Bank ----------
insert into public.media_items (organization_id, title, path, mime, size_bytes, audience) values
  (tests.id('a'), 'Rota', tests.id('a') || '/rota.pdf', 'application/pdf', 100, 'staff'),
  (tests.id('a'), 'Term letter', tests.id('a') || '/letter.pdf', 'application/pdf', 100, 'families');
select tests.act_as(tests.id('teacher'));
select is((select count(*)::int from public.media_items), 2, 'staff see every file');
select tests.reset();
select tests.act_as(tests.id('parent'));
select is((select array_agg(title) from public.media_items), array['Term letter'], 'families see only what is shared with them');
select tests.reset();
select tests.act_as(tests.id('stranger'));
select is((select count(*)::int from public.media_items), 0, 'others see nothing');
select tests.reset();
select tests.act_as(tests.id('teacher'));
select throws_ok($$insert into public.media_items (organization_id, title, path, mime, size_bytes) values (tests.id('a'), 'x', 'x', 'application/pdf', 1)$$, '42501', null, 'files are added through the server only');
select tests.reset();

-- ---------- Record-a-verse ----------
select throws_ok($$select public.svc_register_verse(tests.id('ada'), 'elsewhere/v.webm', null)$$, 'P0001', 'bad_path', 'recordings must live in the kid''s own folder');
select throws_ok($$select public.svc_register_verse(tests.id('bo'), tests.id('b') || '/' || tests.id('bo') || '/v.webm', null)$$, 'P0001', 'not_allowed', 'Record-a-verse is for faith mode');
insert into tests.v select 'rec', public.svc_register_verse(tests.id('ada'), tests.id('a') || '/' || tests.id('ada') || '/v.webm', null);
select tests.act_as(tests.id('u_ada'));
select is((select count(*)::int from public.verse_recordings), 1, 'the kid sees their recording');
select tests.reset();
select tests.act_as(tests.id('parent'));
select is((select count(*)::int from public.verse_recordings), 0, 'recordings are between the kid and their teachers');
select tests.reset();
select tests.act_as(tests.id('teacher_b'));
select throws_ok($$select public.mark_verse_heard(tests.id('rec'))$$, 'P0001', 'not_allowed', 'another club cannot touch it');
select tests.reset();
select tests.act_as(tests.id('teacher'));
select lives_ok($$select public.mark_verse_heard(tests.id('rec'))$$, 'the teacher listens');
select tests.reset();
select is((select status from public.verse_recordings where id = tests.id('rec')), 'heard', 'marked heard');

select * from finish();
rollback;
