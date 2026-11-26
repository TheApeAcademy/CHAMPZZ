-- Turns the demo club "Grace Kids Lekki" into a working test club for the
-- platform owner: the first Super Admin becomes its Org Admin, it gets an
-- active Pro plan, two classes, a teacher, two parents, twelve kids with
-- faith usernames, and a few weeks of believable activity.
--
-- Every test adult signs in with the password below. Every test kid signs in
-- at /k/grace-kids-lekki with their username and the picture PIN 1-2-3-4
-- (the 2nd, 3rd, 4th and 5th pictures). All emails are @example.com, which
-- can never receive mail. Run once against a project.

do $$
declare
  pw constant text := 'ChampzzTest-2026';
  o uuid;
  owner uuid;
  teacher uuid := gen_random_uuid();
  parent1 uuid := gen_random_uuid();
  parent2 uuid := gen_random_uuid();
  little uuid;
  stars uuid;
  season uuid;
  asg uuid;
  k record;
  kid uuid;
  kid_user uuid;
  d date;
  today date := (now() at time zone 'Africa/Lagos')::date;
  kids_spec constant jsonb := '[
    {"first":"Kemi","init":"B","class":"little","parent":1,"days":18,"run":6},
    {"first":"Tobi","init":"A","class":"little","parent":0,"days":11,"run":3},
    {"first":"Ife","init":"O","class":"little","parent":0,"days":7,"run":2},
    {"first":"Dami","init":"E","class":"little","parent":0,"days":4,"run":1},
    {"first":"Zara","init":"K","class":"little","parent":0,"days":0,"run":0,"new":true},
    {"first":"David","init":"B","class":"stars","parent":1,"days":20,"run":9},
    {"first":"Emeka","init":"O","class":"stars","parent":2,"days":15,"run":5},
    {"first":"Grace","init":"N","class":"stars","parent":0,"days":19,"run":12},
    {"first":"Amaka","init":"U","class":"stars","parent":0,"days":9,"run":2},
    {"first":"Samuel","init":"T","class":"stars","parent":0,"days":13,"run":4},
    {"first":"Joy","init":"A","class":"stars","parent":0,"days":6,"run":1},
    {"first":"Daniel","init":"I","class":"stars","parent":0,"days":3,"run":0}
  ]';
begin
  select id into o from public.organizations where slug = 'grace-kids-lekki';
  if o is null then raise exception 'grace-kids-lekki not found: run scripts/demo-clubs.sql first'; end if;
  select user_id into owner from public.platform_admins order by created_at limit 1;
  if owner is null then raise exception 'no Super Admin to make Org Admin'; end if;

  -- a real, active club (demo clubs refuse members)
  update public.organizations set demo = false, status = 'active', registration_mode = 'open', joining_paused = false where id = o;
  insert into public.subscriptions (organization_id, plan_id, billing_interval, currency, current_period_start, current_period_end, provider)
  select o, id, 'year', 'NGN', now(), now() + interval '1 year', 'manual' from public.plans where code = 'pro'
  on conflict (organization_id) do nothing;
  update public.org_branding set tagline = 'Test club: Sunday school, Bible quiz nights and a whole lot of joy for ages 4 to 12.' where organization_id = o;
  insert into public.memberships (organization_id, user_id, role) values (o, owner, 'org_admin') on conflict do nothing;
  perform app.new_join_code(o, owner);

  -- test adults (email + password sign-in)
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  select '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
         extensions.crypt(pw, extensions.gen_salt('bf')), now(),
         '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', u.name), now(), now(), '', '', '', ''
  from (values (teacher, 'teacher.grace@example.com', 'Tolu Adeyemi'),
               (parent1, 'parent.bello@example.com', 'Funmi Bello'),
               (parent2, 'parent.okeke@example.com', 'Chinedu Okeke')) u(id, email, name);
  insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), u.id::text, u.id, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now()
  from auth.users u where u.id in (teacher, parent1, parent2);

  insert into public.memberships (organization_id, user_id, role) values
    (o, teacher, 'teacher'), (o, parent1, 'parent'), (o, parent2, 'parent');

  -- classes, both taught by the teacher
  insert into public.classes (organization_id, name, age_band) values (o, 'Little Lights (4 to 7)', 'little') returning id into little;
  insert into public.classes (organization_id, name, age_band) values (o, 'Bright Stars (8 to 12)', 'champ') returning id into stars;
  insert into public.class_teachers (organization_id, class_id, user_id) values (o, little, teacher), (o, stars, teacher);

  insert into public.seasons (organization_id, name, starts_on, ends_on)
  values (o, 'Christmas Term 2026', date_trunc('month', today)::date - 30, (date_trunc('year', today) + interval '1 year - 1 day')::date)
  returning id into season;

  -- kids
  for k in select * from jsonb_array_elements(kids_spec) j(v) loop
    insert into public.kids (organization_id, first_name, last_initial, username, class_id, confirmed_at, confirmed_by, created_by, created_at)
    values (o, k.v->>'first', k.v->>'init', app.new_username(o),
            case k.v->>'class' when 'little' then little else stars end,
            case when (k.v->>'new')::boolean then null else now() - interval '30 days' end,
            case when (k.v->>'new')::boolean then null else teacher end,
            case (k.v->>'parent')::int when 1 then parent1 when 2 then parent2 else null end,
            now() - interval '35 days')
    returning id into kid;
    insert into public.kid_credentials (kid_id, organization_id, pin_hash) values (kid, o, extensions.crypt('1-2-3-4', extensions.gen_salt('bf', 8)));

    -- the kid's own auth user; the real password is re-derived on first PIN sign-in
    kid_user := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                            confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', kid_user, 'authenticated', 'authenticated',
            'kid-' || kid || '@kids.champzz.vercel.app', extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')), now(),
            jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'kind', 'kid', 'kid_id', kid, 'organization_id', o),
            '{}'::jsonb, now(), now(), '', '', '', '');
    insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), kid_user::text, kid_user, jsonb_build_object('sub', kid_user::text, 'email', 'kid-' || kid || '@kids.champzz.vercel.app', 'email_verified', true), 'email', now(), now(), now());
    update public.kids set user_id = kid_user where id = kid;

    if (k.v->>'parent')::int > 0 then
      insert into public.guardians (organization_id, kid_id, user_id) values (o, kid, case (k.v->>'parent')::int when 1 then parent1 else parent2 end);
      insert into public.consents (organization_id, kid_id, guardian_user_id, method, policy_version, scopes)
      values (o, kid, case (k.v->>'parent')::int when 1 then parent1 else parent2 end, 'online', '2026-11-25', '{"photos": false}');
    end if;

    -- visits: an unbroken run up to today, then scattered days before it
    for i in 0 .. greatest((k.v->>'run')::int - 1, -1) loop
      insert into public.activity_days (organization_id, kid_id, day) values (o, kid, today - i) on conflict do nothing;
    end loop;
    for i in 1 .. greatest((k.v->>'days')::int - (k.v->>'run')::int, 0) loop
      insert into public.activity_days (organization_id, kid_id, day)
      values (o, kid, today - (k.v->>'run')::int - 1 - (i * 2)) on conflict do nothing;
    end loop;
    insert into public.point_events (organization_id, kid_id, source, ref, points, at)
    select o, kid, 'daily_visit', a.day::text, 5, a.day + time '16:00' from public.activity_days a where a.kid_id = kid;

    -- Sunday attendance for confirmed kids who visit often
    if not coalesce((k.v->>'new')::boolean, false) then
      for d in select generate_series(today - extract(dow from today)::int - 21, today - extract(dow from today)::int, interval '7 days')::date loop
        if (k.v->>'days')::int > 5 or d = today - extract(dow from today)::int then
          insert into public.attendance (organization_id, kid_id, class_id, day, checked_in_at, checked_in_by, pickup_code, checked_out_at, checked_out_by)
          values (o, kid, case k.v->>'class' when 'little' then little else stars end, d, d + time '09:05', teacher,
                  lpad((floor(random() * 10000))::int::text, 4, '0'), d + time '11:40', teacher);
          insert into public.point_events (organization_id, kid_id, source, ref, points, awarded_by, at)
          values (o, kid, 'attendance', d::text, 10, teacher, d + time '09:05');
        end if;
      end loop;
    end if;

    -- a teacher star for the regulars
    if (k.v->>'days')::int >= 13 then
      insert into public.point_events (organization_id, kid_id, source, ref, points, awarded_by, note, at)
      values (o, kid, 'teacher_star', gen_random_uuid()::text, 10, teacher, 'Said the memory verse word for word!', now() - interval '3 days');
    end if;

    insert into public.kid_stats (kid_id, organization_id, points_total, streak_current, streak_best, last_active_day, visits, stars)
    select kid, o, coalesce(sum(e.points), 0),
           (k.v->>'run')::int, greatest((k.v->>'run')::int, least((k.v->>'days')::int, 7)),
           (select max(day) from public.activity_days where kid_id = kid),
           (select count(*) from public.activity_days where kid_id = kid),
           count(*) filter (where e.source = 'teacher_star')
    from public.point_events e where e.kid_id = kid;
  end loop;

  -- lessons, events, class work
  insert into public.lessons (organization_id, class_id, title, body, memory_verse, lesson_date, status, created_by) values
    (o, null, 'Noah Trusts God', 'Noah built the ark long before any rain came. This week we talk about trusting God when we cannot see the whole plan yet.', 'Noah did everything just as God commanded him. Genesis 6:22', today - extract(dow from today)::int - 7, 'published', teacher),
    (o, stars, 'Joseph Forgives', 'Joseph had every reason to get even with his brothers. Instead he forgave them. What makes forgiving so hard, and why does God ask us to do it?', 'You intended to harm me, but God intended it for good. Genesis 50:20', today - extract(dow from today)::int, 'published', teacher),
    (o, little, 'God Made Everything', 'A colouring and story lesson on the days of creation, with a song for each day.', 'In the beginning God created the heavens and the earth. Genesis 1:1', today - extract(dow from today)::int, 'published', teacher),
    (o, stars, 'David and Goliath', 'Draft: being brave when something looks too big.', null, today - extract(dow from today)::int + 7, 'draft', teacher);

  insert into public.events (organization_id, title, description, starts_at, ends_at, location, created_by) values
    (o, 'Bible Quiz Night', 'Road to Champ, teams of four. Parents welcome to watch.', (today + 2) + time '17:00', (today + 2) + time '19:00', 'Church hall', owner),
    (o, 'Christmas Play Rehearsal', 'Every child with a part, please come in costume if you have one.', (today + 9) + time '10:00', (today + 9) + time '12:00', 'Main auditorium', owner),
    (o, 'Carol Service', 'Our kids sing two carols. Families sit together.', (today + 23) + time '16:00', null, 'Main auditorium', owner);

  insert into public.assignments (organization_id, class_id, title, instructions, due_date, status, created_by)
  values (o, stars, 'Forgiveness in my week', 'Write three sentences about a time you forgave someone, or a time someone forgave you.', today + 4, 'published', teacher)
  returning id into asg;
  insert into public.submissions (organization_id, assignment_id, kid_id, body, submitted_at, grade, feedback, graded_by, graded_at)
  select o, asg, kk.id, b.body, now() - interval '1 day', b.grade, b.feedback, case when b.grade is null then null else teacher end, case when b.grade is null then null else now() end
  from public.kids kk join (values
    ('David', 'My little sister broke my toy car. I was angry but I forgave her and we played together after.', 90, 'Lovely honest answer, David!'),
    ('Grace', 'My friend said something unkind at school. She said sorry the next day and I forgave her like Joseph did.', 95, 'Just like Joseph. Well done.'),
    ('Emeka', 'I forgave my brother for eating my last biscuit.', null, null)
  ) b(first, body, grade, feedback) on kk.first_name = b.first and kk.organization_id = o;

  insert into public.messages (organization_id, kid_id, author_id, from_staff, body, created_at)
  select o, kk.id, x.author, x.staff, x.body, now() - x.ago
  from public.kids kk cross join lateral (values
    (teacher, true, 'Hi ' || kk.first_name || '! Great job in class on Sunday.', interval '2 days'),
    (kk.user_id, false, 'Thank you! Can I read in the play?', interval '1 day')
  ) x(author, staff, body, ago)
  where kk.organization_id = o and kk.first_name in ('David', 'Grace');

  insert into public.certificates (organization_id, kid_id, title, reason, issued_by, issued_at)
  select o, kk.id, 'Memory Verse Champion', 'Learned every memory verse this month.', teacher, now() - interval '5 days'
  from public.kids kk where kk.organization_id = o and kk.first_name in ('Grace', 'David');

  insert into public.quiz_matches (organization_id, pack_id, pack_name, season_id, host_id, teams, questions_played, client_id, played_at)
  select o, p.id, p.name, season, teacher, '[{"name":"Shining Stars","score":2400},{"name":"Mighty Lambs","score":1800},{"name":"Joyful Doves","score":2100}]'::jsonb, 15, gen_random_uuid(), now() - interval '6 days'
  from public.question_packs p where p.organization_id is null and p.name = 'Bible Basics';
end
$$;
