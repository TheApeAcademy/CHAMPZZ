-- Faith Quest, the private journal, My Stuff moderation, the collection, Champ Buddy.
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
grant usage on schema tests to authenticated;
grant select, insert on tests.v to authenticated;
create function tests.id(p text) returns uuid language sql stable as $$ select id from tests.v where k = p $$;
grant execute on function tests.id(text) to authenticated;

do $$
declare a uuid; b uuid; c1 uuid; plan uuid;
begin
  select id into plan from public.plans where code = 'starter';
  insert into public.organizations (slug, name, kind, status, faith_mode) values ('dl-a', 'DL A', 'church', 'active', true) returning id into a;
  insert into public.organizations (slug, name, kind, status, faith_mode) values ('dl-b', 'DL B', 'club', 'active', false) returning id into b;
  insert into public.subscriptions (organization_id, plan_id, billing_interval, currency, current_period_start, current_period_end)
    values (a, plan, 'month', 'NGN', now(), now() + interval '30 days'), (b, plan, 'month', 'NGN', now(), now() + interval '30 days');
  insert into public.classes (organization_id, name) values (a, 'One') returning id into c1;
  insert into tests.v values ('a', a), ('b', b), ('c1', c1), ('admin', tests.make_user()), ('teacher', tests.make_user()), ('teacher_b', tests.make_user()),
    ('parent', tests.make_user()), ('parent2', tests.make_user()), ('u_ada', tests.make_user('kid')), ('u_bo', tests.make_user('kid'));
  insert into public.memberships (organization_id, user_id, role) values
    (a, tests.id('admin'), 'org_admin'), (a, tests.id('teacher'), 'teacher'), (b, tests.id('teacher_b'), 'teacher');
  insert into public.class_teachers (organization_id, class_id, user_id) values (a, c1, tests.id('teacher'));
  insert into public.kids (organization_id, user_id, first_name, username, class_id, confirmed_at) values
    (a, tests.id('u_ada'), 'Ada', 'brave-lion-61', c1, now()), (b, tests.id('u_bo'), 'Bo', 'swift-fox-62', null, now());
  insert into tests.v select 'ada', id from public.kids where username = 'brave-lion-61';
  insert into tests.v select 'bo', id from public.kids where username = 'swift-fox-62';
  insert into public.guardians (organization_id, kid_id, user_id) values (a, tests.id('ada'), tests.id('parent'));
  insert into tests.v select 'david', id from public.quests where title = 'Brave like David' and organization_id is null;
  insert into tests.v select 'd1', id from public.quest_steps where quest_id = tests.id('david') and position = 1;
  insert into tests.v select 'd2', id from public.quest_steps where quest_id = tests.id('david') and position = 2;
end $$;

-- ---------- Faith Quest ----------
select tests.act_as(tests.id('u_ada'));
select is((select count(*)::int from public.quests where organization_id is null), 4, 'a faith-mode kid sees all four default quests');
select throws_ok($$select check_answer from public.quest_steps$$, '42501', null, 'checkpoint answers are never readable');
select throws_ok($$select public.complete_quest_step(tests.id('d2'), 1)$$, 'P0001', 'step_locked', 'steps open in order');
select is((public.complete_quest_step(tests.id('d1'), 2) ->> 'correct')::boolean, false, 'a wrong answer does not pass');
select is((public.complete_quest_step(tests.id('d1'), 0) ->> 'points')::int, 10, 'the right answer earns 10 Champ Points');
select is((public.complete_quest_step(tests.id('d1'), 0) ->> 'points')::int, 0, 'replaying a step earns nothing more');
select is((select count(*)::int from public.quest_progress), 1, 'progress recorded');
select tests.reset();
select tests.act_as(tests.id('u_bo'));
select is((select array_agg(title order by title) from public.quests), array['Be a Kind Champ', 'Never Give Up'], 'a club with faith mode off sees only the general quests');
select throws_ok($$select public.complete_quest_step(tests.id('d1'), 0)$$, 'P0001', 'not_allowed', 'and cannot play a faith quest');
select tests.reset();
select tests.act_as(tests.id('teacher'));
select lives_ok($$insert into public.quests (organization_id, title) values (tests.id('a'), 'Our quest')$$, 'staff create a club quest');
select lives_ok($$insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer)
  select id, 1, 'Step one', 'Read this.', 'Did you read it?', array['Yes', 'No', 'Maybe'], 0 from public.quests where title = 'Our quest'$$, 'and add a step');
select tests.reset();
select tests.act_as(tests.id('u_bo'));
select is((select count(*)::int from public.quests where title = 'Our quest'), 0, 'another club cannot see it');
select tests.reset();

-- ---------- journal: private to the child ----------
select tests.act_as(tests.id('u_ada'));
select lives_ok($$insert into public.journal_entries (organization_id, kid_id, kind, body) values (tests.id('a'), tests.id('ada'), 'prayer', 'For my grandma')$$, 'a kid writes a journal entry');
select is((select count(*)::int from public.journal_entries), 1, 'and reads it back');
select throws_ok($$insert into public.journal_entries (organization_id, kid_id, kind, body) values (tests.id('b'), tests.id('bo'), 'note', 'fake')$$, '42501', null, 'not for another child');
select tests.reset();
select tests.act_as(tests.id('parent'));
select is((select count(*)::int from public.journal_entries), 0, 'parents cannot read a child''s private journal');
select tests.reset();
select tests.act_as(tests.id('teacher'));
select is((select count(*)::int from public.journal_entries), 0, 'nor can teachers');
select tests.reset();

-- ---------- My Stuff and moderation ----------
select throws_ok($$select public.svc_register_upload(tests.id('ada'), 'elsewhere/x.png', null)$$, 'P0001', 'bad_path', 'uploads must live in the kid''s own folder');
insert into tests.v select 'up', public.svc_register_upload(tests.id('ada'), tests.id('a') || '/' || tests.id('ada') || '/pic.png', 'My drawing');
select ok(exists (select 1 from public.notifications where recipient_id = tests.id('teacher') and kind = 'upload'), 'the class teacher is asked to check it');
select tests.act_as(tests.id('u_ada'));
select is((select status from public.kid_uploads), 'pending', 'the kid sees it waiting');
select throws_ok($$insert into public.kid_uploads (organization_id, kid_id, path) values (tests.id('a'), tests.id('ada'), 'x')$$, '42501', null, 'kids cannot add rows directly');
select tests.reset();
select tests.act_as(tests.id('parent'));
select is((select count(*)::int from public.kid_uploads), 0, 'parents do not see it until it is approved');
select tests.reset();
select tests.act_as(tests.id('teacher_b'));
select throws_ok($$select public.moderate_upload(tests.id('up'), true)$$, 'P0001', 'not_allowed', 'another club cannot moderate it');
select tests.reset();
select tests.act_as(tests.id('teacher'));
select is(public.moderate_upload(tests.id('up'), true), tests.id('a') || '/' || tests.id('ada') || '/pic.png', 'the teacher approves it');
select tests.reset();
select tests.act_as(tests.id('parent'));
select is((select caption from public.kid_uploads), 'My drawing', 'now the parent sees it');
select tests.reset();

-- ---------- collection ----------
select tests.act_as(tests.id('u_ada'));
select is((select count(*)::int from public.collectibles), 12, 'twelve collectibles');
select tests.reset();

-- ---------- Champ Buddy ----------
select tests.act_as(tests.id('u_ada'));
select is(public.ai_status() ->> 'plan', 'false', 'not on the Starter plan');
select is(public.ai_status() ->> 'club', 'false', 'off by default for the club');
select is(public.ai_status() ->> 'consent', 'false', 'no consent yet');
select tests.reset();
select tests.act_as(tests.id('teacher'));
select throws_ok($$select public.set_ai_consent(tests.id('ada'), true)$$, 'P0001', 'not_allowed', 'only a parent can give consent');
select tests.reset();
select tests.act_as(tests.id('parent2'));
select throws_ok($$select public.set_ai_consent(tests.id('ada'), true)$$, 'P0001', 'not_allowed', 'and only this child''s parent');
select tests.reset();
select tests.act_as(tests.id('parent'));
select lives_ok($$select public.set_ai_consent(tests.id('ada'), true)$$, 'the parent says yes');
select tests.reset();
select tests.act_as(tests.id('u_ada'));
select is(public.ai_status() ->> 'consent', 'true', 'consent recorded');
select tests.reset();
select tests.act_as(tests.id('parent'));
select lives_ok($$select public.set_ai_consent(tests.id('ada'), false)$$, 'the parent can change their mind');
select tests.reset();
select tests.act_as(tests.id('u_ada'));
select is(public.ai_status() ->> 'consent', 'false', 'consent withdrawn');
select throws_ok($$select public.svc_log_ai(tests.id('ada'), 'hi', 'hello', false)$$, '42501', null, 'kids cannot write Buddy logs');
select tests.reset();
select public.svc_log_ai(tests.id('ada'), 'I feel unsafe', 'Please talk to a trusted adult', true);
select ok(exists (select 1 from public.notifications where recipient_id = tests.id('admin') and kind = 'ai_flag' and severity = 'urgent'), 'a flagged chat alerts the club');
select tests.act_as(tests.id('parent'));
select is((select count(*)::int from public.ai_messages), 2, 'parents can read their child''s Buddy history');
select tests.reset();
select tests.act_as(tests.id('teacher_b'));
select is((select count(*)::int from public.ai_messages), 0, 'another club cannot');
select tests.reset();
select tests.act_as(tests.id('admin'));
select lives_ok($$update public.organizations set ai_enabled = true where id = tests.id('a')$$, 'the Org Admin can switch Buddy on');
select tests.reset();
select is((select ai_enabled from public.organizations where id = tests.id('a')), true, 'switched on');

-- ---------- hardening ----------
select tests.act_as(tests.id('teacher'));
select throws_ok($$select public.save_quiz_match(tests.id('a'), (select id from public.question_packs where name = 'General Knowledge'), '[{"score": 5}]', 1, gen_random_uuid())$$, 'P0001', 'bad_teams', 'a team with no name is refused');
select throws_ok($$select public.save_quiz_match(tests.id('a'), (select id from public.question_packs where name = 'General Knowledge'), null, 1, gen_random_uuid())$$, 'P0001', 'bad_teams', 'no teams at all is refused');
select tests.reset();
select tests.act_as(tests.id('u_ada'));
select throws_ok($$select public.update_my_champ(null)$$, 'P0001', 'bad_avatar', 'a null avatar is refused');
select tests.reset();

select * from finish();
rollback;
