-- Talk to Someone anonymity, messages, lessons, assignments, events, notifications.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

create schema tests;
create function tests.make_user(p_kind text default 'adult') returns uuid language plpgsql as $$
declare v uuid := gen_random_uuid();
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, email_confirmed_at)
  values (v, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v || '@t.local', jsonb_build_object('kind', p_kind), jsonb_build_object('full_name', 'Teacher T'), now());
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
declare a uuid; b uuid; c1 uuid; c2 uuid; plan uuid;
begin
  select id into plan from public.plans where code = 'starter';
  insert into public.organizations (slug, name, kind, status) values ('cl-a', 'CL A', 'church', 'active') returning id into a;
  insert into public.organizations (slug, name, kind, status) values ('cl-b', 'CL B', 'church', 'active') returning id into b;
  insert into public.subscriptions (organization_id, plan_id, billing_interval, currency, current_period_start, current_period_end)
    values (a, plan, 'month', 'NGN', now(), now() + interval '30 days'), (b, plan, 'month', 'NGN', now(), now() + interval '30 days');
  insert into public.classes (organization_id, name) values (a, 'One') returning id into c1;
  insert into public.classes (organization_id, name) values (a, 'Two') returning id into c2;
  insert into tests.v values ('a', a), ('b', b), ('c1', c1), ('c2', c2),
    ('admin', tests.make_user()), ('t1', tests.make_user()), ('t2', tests.make_user()), ('admin_b', tests.make_user()),
    ('parent', tests.make_user()), ('u_kid', tests.make_user('kid')), ('u_new', tests.make_user('kid'));
  insert into public.memberships (organization_id, user_id, role) values
    (a, tests.id('admin'), 'org_admin'), (a, tests.id('t1'), 'teacher'), (a, tests.id('t2'), 'teacher'), (b, tests.id('admin_b'), 'org_admin'), (a, tests.id('parent'), 'parent');
  insert into public.class_teachers (organization_id, class_id, user_id) values (a, c1, tests.id('t1')), (a, c2, tests.id('t2'));
  insert into public.kids (organization_id, user_id, first_name, last_initial, username, class_id, confirmed_at) values
    (a, tests.id('u_kid'), 'Ada', 'O', 'brave-lion-21', c1, now()),
    (a, tests.id('u_new'), 'Newbie', null, 'calm-otter-22', c1, null);
  insert into tests.v select 'kid', id from public.kids where username = 'brave-lion-21';
  insert into tests.v select 'newkid', id from public.kids where username = 'calm-otter-22';
  insert into public.guardians (organization_id, kid_id, user_id) values (a, tests.id('kid'), tests.id('parent'));
end $$;

-- ---------- Talk to Someone ----------
select tests.act_as(tests.id('u_kid'));
insert into tests.v select 'anon', public.submit_concern('Someone at home scares me', true);
insert into tests.v select 'named', public.submit_concern('I feel left out', false);
select tests.reset();

-- the handlers were told, without a name or the words
select is((select count(*)::int from public.notifications where kind = 'concern_new' and recipient_id = tests.id('t1')), 2, 'class teacher notified');
select is((select count(*)::int from public.notifications where kind = 'concern_new' and recipient_id = tests.id('admin')), 2, 'Org Admin notified');
select is((select count(*)::int from public.notifications where kind = 'concern_new' and recipient_id = tests.id('t2')), 0, 'a teacher of another class is not notified');
select is((select count(*)::int from public.notifications where kind = 'concern_new' and recipient_id in (tests.id('t1'), tests.id('admin')) and (body ilike '%Ada%' or body ilike '%scares%' or title ilike '%Ada%')), 0, 'notifications never contain the name or the message');
select is((select count(*)::int from public.notifications where kind = 'concern_new' and severity = 'urgent' and recipient_id in (tests.id('t1'), tests.id('admin'))), 4, 'Talk to Someone alerts are urgent');

-- anonymity, through every path a teacher has
select tests.act_as(tests.id('t1'));
select throws_ok($$select * from public.concerns$$, '42501', null, 'staff cannot query concerns directly');
select throws_ok($$select * from public.concern_replies$$, '42501', null, 'staff cannot query replies directly');
select is((select kid_label from public.staff_concerns(tests.id('a')) where id = tests.id('anon')), 'Anonymous', 'inbox shows Anonymous');
select is((select class_name from public.staff_concerns(tests.id('a')) where id = tests.id('anon')), null, 'inbox hides the class of an anonymous child');
select is((select kid_label from public.staff_concerns(tests.id('a')) where id = tests.id('named')), 'Ada O.', 'a named message shows the name');
select is((select kid_id from public.staff_concern(tests.id('anon'))), null, 'opening an anonymous message returns no kid id');
select is((select kid_label from public.staff_concern(tests.id('anon'))), 'Anonymous', 'and no name');
select lives_ok($$select public.reply_to_concern(tests.id('anon'), 'Thank you for telling me. You are safe to talk to me.')$$, 'teacher replies');
select tests.reset();
select tests.act_as(tests.id('u_kid'));
select lives_ok($$select public.reply_to_concern(tests.id('anon'), 'ok thank you')$$, 'child replies');
select is((select author from public.my_concern_replies(tests.id('anon')) where from_staff), 'A trusted adult', 'the child sees a trusted adult, not a staff name');
select tests.reset();
select tests.act_as(tests.id('t1'));
select is((select author from public.staff_concern_replies(tests.id('anon')) where not from_staff), 'Anonymous child', 'the child''s reply stays anonymous to staff');
select ok((select bool_and(author <> 'Ada') from public.staff_concern_replies(tests.id('anon'))), 'no reply reveals the name');
select tests.reset();
select ok(exists (select 1 from public.concern_access_log where concern_id = tests.id('anon') and user_id = tests.id('t1') and action = 'opened'), 'opening a message is logged');

-- who can see it
select tests.act_as(tests.id('t2'));
select is((select count(*)::int from public.staff_concerns(tests.id('a'))), 0, 'a teacher of another class sees no concerns');
select throws_ok($$select * from public.staff_concern(tests.id('anon'))$$, 'P0001', 'not_allowed', 'and cannot open one by id');
select tests.reset();
select tests.act_as(tests.id('admin_b'));
select is((select count(*)::int from public.staff_concerns(tests.id('a'))), 0, 'another club sees nothing');
select throws_ok($$select public.reply_to_concern(tests.id('anon'), 'hi')$$, 'P0001', 'not_allowed', 'another club cannot reply');
select tests.reset();
select tests.act_as(tests.id('parent'));
select is((select count(*)::int from public.staff_concerns(tests.id('a'))), 0, 'a parent sees no concerns, not even their own child''s');
select tests.reset();

-- escalation tells the Org Admin
select tests.act_as(tests.id('t1'));
select lives_ok($$select public.set_concern_status(tests.id('anon'), 'escalated')$$, 'teacher escalates');
select lives_ok($$select public.add_concern_note(tests.id('anon'), 'Passed to admin, following policy')$$, 'internal note added');
select tests.reset();
select is((select count(*)::int from public.notifications where kind = 'concern_escalated' and recipient_id = tests.id('admin') and severity = 'urgent'), 1, 'Org Admin gets an urgent escalation alert');
select tests.act_as(tests.id('u_kid'));
select is((select count(*)::int from public.my_concerns()), 2, 'the child sees their own messages');
select tests.reset();

-- read-only clubs still accept Talk to Someone
update public.organizations set status = 'read_only' where id = tests.id('a');
select tests.act_as(tests.id('u_kid'));
select lives_ok($$select public.submit_concern('still here', false)$$, 'Talk to Someone works in a read-only club');
select tests.reset();
update public.organizations set status = 'active' where id = tests.id('a');

-- ---------- messages ----------
select tests.act_as(tests.id('u_new'));
select throws_ok($$select public.send_message('hello')$$, 'P0001', 'messaging_locked', 'a new kid cannot message until confirmed');
select tests.reset();
select tests.act_as(tests.id('u_kid'));
select lives_ok($$select public.send_message('Can I bring my friend?')$$, 'a confirmed kid messages the club');
select tests.reset();
select tests.act_as(tests.id('t2'));
select is((select count(*)::int from public.messages where kid_id = tests.id('kid')), 1, 'any teacher in the club can see the thread (no hidden channels)');
select lives_ok($$select public.send_message('Yes of course!', tests.id('kid'))$$, 'a teacher replies');
select tests.reset();
select tests.act_as(tests.id('admin_b'));
select is((select count(*)::int from public.messages), 0, 'another club sees no messages');
select throws_ok($$select public.send_message('hi', tests.id('kid'))$$, 'P0001', 'not_allowed', 'another club cannot message the kid');
select tests.reset();
select is((select count(*)::int from public.notifications where kind = 'message' and recipient_id = tests.id('u_kid')), 1, 'the kid is notified of the reply');

-- ---------- lessons and assignments ----------
select tests.act_as(tests.id('t1'));
insert into public.lessons (organization_id, class_id, title, body, status) values (tests.id('a'), tests.id('c1'), 'Draft lesson', 'x', 'draft');
insert into public.lessons (organization_id, class_id, title, body, status) values (tests.id('a'), tests.id('c1'), 'David and Goliath', 'Be brave.', 'published');
insert into public.lessons (organization_id, class_id, title, body, status) values (tests.id('a'), tests.id('c2'), 'Class two only', 'x', 'published');
with x as (insert into public.assignments (organization_id, class_id, title, status) values (tests.id('a'), tests.id('c1'), 'Write your memory verse', 'published') returning id) insert into tests.v select 'asg', id from x;
select throws_ok($$insert into public.lessons (organization_id, title) values (tests.id('b'), 'sneaky')$$, '42501', null, 'a teacher cannot post lessons in another club');
select tests.reset();
select is((select count(*)::int from public.notifications where kind = 'assignment' and recipient_id = tests.id('u_kid')), 1, 'publishing work notifies the class');
select tests.act_as(tests.id('u_kid'));
select is((select array_agg(title) from public.lessons), array['David and Goliath'], 'a kid sees only published lessons for their class');
select throws_ok($$insert into public.lessons (organization_id, title) values (tests.id('a'), 'kid lesson')$$, '42501', null, 'a kid cannot write lessons');
select lives_ok($$select public.submit_assignment(tests.id('asg'), 'For God so loved the world')$$, 'kid hands in work');
select lives_ok($$select public.submit_assignment(tests.id('asg'), 'For God so loved the world, that he gave')$$, 'kid can edit before marking');
select tests.reset();
select is((select points_total from public.kid_stats where kid_id = tests.id('kid')), 10, 'handing in work earns 10 points once');
select tests.act_as(tests.id('t1'));
select lives_ok($$select public.grade_submission((select id from public.submissions where assignment_id = tests.id('asg')), 95, 'Brilliant!')$$, 'teacher marks it');
select tests.reset();
select tests.act_as(tests.id('u_kid'));
select throws_ok($$select public.submit_assignment(tests.id('asg'), 'changing it')$$, 'P0001', 'already_graded', 'marked work cannot be changed');
select is((select grade from public.submissions where assignment_id = tests.id('asg')), 95, 'kid sees their grade');
select tests.reset();
select tests.act_as(tests.id('parent'));
select is((select grade from public.submissions where assignment_id = tests.id('asg')), 95, 'the parent sees their child''s grade');
select tests.reset();

-- ---------- events ----------
select tests.act_as(tests.id('t1'));
select throws_ok($$insert into public.events (organization_id, title, starts_at) values (tests.id('a'), 'Party', now() + interval '3 days')$$, '42501', null, 'only Org Admins create events');
select tests.reset();
select tests.act_as(tests.id('admin'));
select lives_ok($$insert into public.events (organization_id, title, starts_at) values (tests.id('a'), 'Christmas party', now() + interval '3 days')$$, 'Org Admin creates an event');
select tests.reset();
select tests.act_as(tests.id('parent'));
select is((select count(*)::int from public.events), 1, 'a parent sees club events');
select tests.reset();
select tests.act_as(tests.id('admin_b'));
select is((select count(*)::int from public.events), 0, 'another club sees no events');
select tests.reset();

-- ---------- notifications are private ----------
select tests.act_as(tests.id('u_kid'));
select ok((select bool_and(recipient_id = tests.id('u_kid')) from public.notifications), 'a user sees only their own notifications');
select throws_ok($$update public.notifications set title = 'hacked'$$, '42501', null, 'notification text cannot be changed');
select throws_ok($$insert into public.notifications (organization_id, recipient_id, kind, title) values (tests.id('a'), tests.id('t1'), 'x', 'A child needs you')$$, '42501', null, 'nobody can forge a notification');
select tests.reset();

select * from finish();
rollback;
