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
declare a uuid; b uuid; d uuid;
begin
  insert into public.organizations (slug, name, kind, status, faith_mode) values ('dir-a', 'Dir A', 'church', 'active', true) returning id into a;
  insert into public.organizations (slug, name, kind, status, faith_mode) values ('dir-b', 'Dir B', 'club', 'active', false) returning id into b;
  insert into public.organizations (slug, name, kind, status, faith_mode, demo) values ('dir-demo', 'Dir Demo', 'club', 'active', false, true) returning id into d;
  insert into public.org_branding (organization_id, listed, city) values (a, true, 'Lagos'), (b, false, null), (d, true, 'Accra');
  insert into public.club_posts (organization_id, title, body) values (a, 'A news', 'Hello from A'), (b, 'B news', 'Hello from B'), (d, 'Demo news', 'Hi');
  insert into tests.v values ('a', a), ('b', b), ('d', d), ('parent', tests.make_user()), ('staff_b', tests.make_user()), ('u_kid', tests.make_user('kid'));
  insert into public.memberships (organization_id, user_id, role) values (b, tests.id('staff_b'), 'teacher');
  insert into public.kids (organization_id, user_id, first_name, username, confirmed_at) values (a, tests.id('u_kid'), 'Ada', 'dir-kid-71', now());
end $$;

-- anon sees only listed clubs, and nothing about kids
set local role anon;
select is((select array_agg(slug order by slug) from public.list_clubs(null)), array['dir-a', 'dir-demo'], 'directory lists only clubs that chose to be listed');
select is((select count(*)::int from public.list_clubs('lagos')), 1, 'directory search matches city');
select is((select joinable from public.get_clubhouse('dir-demo')), false, 'demo clubs never take members');
select throws_ok('select public.follow_club(''dir-a'', true)', '42501', null, 'anon cannot follow');
select throws_ok('select * from public.my_feed()', '42501', null, 'anon has no feed');
select throws_ok('select * from public.club_follows', '42501', null, 'anon cannot read follows');
select tests.reset();

-- a parent follows a listed club and sees its posts; an unlisted club cannot be followed
select tests.act_as(tests.id('parent'));
select is((select count(*)::int from public.my_feed()), 0, 'a new adult has an empty feed');
select ok(public.follow_club('dir-a', true), 'adult follows a listed club');
select is((select array_agg(title) from public.my_feed()), array['A news'], 'feed shows the followed club''s posts');
select throws_ok('select public.follow_club(''dir-b'', true)', 'P0001', 'not_found', 'unlisted clubs cannot be followed');
select is((select count(*)::int from public.club_follows), 1, 'adult reads their own follows');
select throws_ok('insert into public.club_follows (user_id, organization_id) values (auth.uid(), tests.id(''b''))', '42501', null, 'follows are written only through follow_club');
select is(public.follow_club('dir-a', false), false, 'adult unfollows');
select is((select count(*)::int from public.my_feed()), 0, 'unfollowed posts leave the feed');
select tests.reset();

-- staff see their own club's posts even when it is unlisted
select tests.act_as(tests.id('staff_b'));
select is((select array_agg(title) from public.my_feed()), array['B news'], 'staff feed includes their own club');
select is((select count(*)::int from public.club_follows), 0, 'staff cannot see other people''s follows');
select tests.reset();

-- kids cannot follow and get no cross-club feed
select tests.act_as(tests.id('u_kid'));
select throws_ok('select public.follow_club(''dir-a'', true)', 'P0001', 'not_allowed', 'kid accounts cannot follow clubs');
select is((select count(*)::int from public.my_feed()), 0, 'kid accounts get no feed');
select tests.reset();

select * from finish();
rollback;
