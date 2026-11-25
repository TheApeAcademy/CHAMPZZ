-- Games: Road to Champ (question packs, host matches, Training Ground) and
-- the Arena (six games, club-extendable content, daily-capped points).
--
-- Answers are never readable by kids. Training Ground serves one question at
-- a time without its answer and checks every answer in the database.

-- ---------------------------------------------------------------------------
-- question packs and questions
-- ---------------------------------------------------------------------------

-- organization_id null = a Champzz default pack, shared by every club
create table public.question_packs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  faith boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index question_packs_org on public.question_packs (organization_id);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  pack_id uuid not null references public.question_packs (id) on delete cascade,
  tier smallint not null check (tier between 1 and 5),
  prompt text not null check (char_length(prompt) between 3 and 300),
  choices text[] not null check (array_length(choices, 1) = 4 and array_position(choices, null) is null
                                 and char_length(choices[1]) between 1 and 120 and char_length(choices[2]) between 1 and 120
                                 and char_length(choices[3]) between 1 and 120 and char_length(choices[4]) between 1 and 120),
  answer_index smallint not null check (answer_index between 0 and 3),
  explanation text check (explanation is null or char_length(explanation) <= 300),
  created_at timestamptz not null default now()
);
create index questions_pack on public.questions (pack_id, tier);

-- a question always belongs to its pack's club; the client cannot choose
create function app.question_org() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.organization_id := (select organization_id from public.question_packs where id = new.pack_id);
  return new;
end;
$$;
create trigger questions_org before insert or update on public.questions
for each row execute function app.question_org();

create function app.is_staff_anywhere() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.memberships m where m.user_id = auth.uid() and m.status = 'active' and m.role in ('org_admin', 'teacher'))
$$;

-- ---------------------------------------------------------------------------
-- host matches (Road to Champ on one big screen)
-- ---------------------------------------------------------------------------

create table public.quiz_matches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  pack_id uuid references public.question_packs (id) on delete set null,
  pack_name text not null,
  season_id uuid references public.seasons (id) on delete set null,
  host_id uuid references auth.users (id) on delete set null,
  teams jsonb not null,
  questions_played integer not null check (questions_played between 0 and 200),
  -- generated on the host's device so an offline result uploaded twice is saved once
  client_id uuid not null unique,
  played_at timestamptz not null default now()
);
create index quiz_matches_org on public.quiz_matches (organization_id, played_at desc);

create function app.current_season_id(p_org uuid) returns uuid
language sql stable security definer set search_path = ''
as $$
  select s.id from public.seasons s
  where s.organization_id = p_org and app.org_today(p_org) between s.starts_on and s.ends_on
  order by s.starts_on desc limit 1
$$;

create function public.save_quiz_match(p_org uuid, p_pack uuid, p_teams jsonb, p_questions integer, p_client_id uuid, p_played_at timestamptz default null)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid; v_name text; t jsonb;
begin
  if not app.has_org_role(p_org, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(p_org) then raise exception 'organization_not_active'; end if;
  select id into v_id from public.quiz_matches where client_id = p_client_id;
  if v_id is not null then return v_id; end if;
  select name into v_name from public.question_packs where id = p_pack and (organization_id is null or organization_id = p_org);
  if v_name is null then raise exception 'bad_pack'; end if;
  if jsonb_typeof(p_teams) <> 'array' or jsonb_array_length(p_teams) not between 1 and 6 then raise exception 'bad_teams'; end if;
  for t in select * from jsonb_array_elements(p_teams) loop
    if jsonb_typeof(t -> 'name') <> 'string' or char_length(t ->> 'name') not between 1 and 30
       or jsonb_typeof(t -> 'score') <> 'number' or (t ->> 'score')::numeric not between 0 and 100000 then
      raise exception 'bad_teams';
    end if;
  end loop;
  insert into public.quiz_matches (organization_id, pack_id, pack_name, season_id, host_id, teams, questions_played, client_id, played_at)
  values (p_org, p_pack, v_name, app.current_season_id(p_org), auth.uid(),
          (select jsonb_agg(jsonb_build_object('name', left(x ->> 'name', 30), 'score', (x ->> 'score')::int)) from jsonb_array_elements(p_teams) x),
          greatest(0, least(coalesce(p_questions, 0), 200)), p_client_id,
          case when p_played_at is not null and p_played_at between now() - interval '30 days' and now() then p_played_at else now() end)
  returning id into v_id;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Training Ground (a kid plays solo; the database checks every answer)
-- ---------------------------------------------------------------------------

create table public.training_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  kid_id uuid not null,
  pack_id uuid references public.question_packs (id) on delete set null,
  question_ids uuid[] not null,
  idx integer not null default 0,
  correct integer not null default 0,
  half_time_used boolean not null default false,
  half_time_question integer,
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index training_runs_kid on public.training_runs (kid_id, created_at desc);

create function app.kid_can_use_pack(p_kid public.kids, p_pack uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.question_packs p join public.organizations o on o.id = p_kid.organization_id
    where p.id = p_pack and (p.organization_id = p_kid.organization_id or (p.organization_id is null and (not p.faith or o.faith_mode))))
$$;

create function public.start_training(p_pack uuid) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; v_ids uuid[]; v_id uuid; v_recent integer;
begin
  select * into k from public.kids where user_id = auth.uid() and status = 'active';
  if k.id is null then raise exception 'not_allowed'; end if;
  if app.org_status(k.organization_id) in ('pending', 'suspended') then raise exception 'organization_not_active'; end if;
  if not app.kid_can_use_pack(k, p_pack) then raise exception 'bad_pack'; end if;
  select count(*) into v_recent from public.training_runs where kid_id = k.id and created_at > now() - interval '1 hour';
  if v_recent >= 30 then raise exception 'slow_down'; end if;
  -- two random questions from each tier, easiest first
  select array_agg(id order by tier, r) into v_ids from (
    select q.id, q.tier, random() as r, row_number() over (partition by q.tier order by random()) as n
    from public.questions q where q.pack_id = p_pack
  ) x where n <= 2;
  if coalesce(array_length(v_ids, 1), 0) < 5 then raise exception 'pack_too_small'; end if;
  insert into public.training_runs (organization_id, kid_id, pack_id, question_ids)
  values (k.organization_id, k.id, p_pack, v_ids) returning id into v_id;
  return v_id;
end;
$$;

create function app.my_run(p_run uuid) returns public.training_runs
language plpgsql security definer set search_path = ''
as $$
declare r public.training_runs%rowtype;
begin
  select tr.* into r from public.training_runs tr join public.kids k on k.id = tr.kid_id
  where tr.id = p_run and k.user_id = auth.uid() and k.status = 'active';
  if r.id is null then raise exception 'not_allowed'; end if;
  return r;
end;
$$;

-- the current question, never with its answer
create function public.training_state(p_run uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare r public.training_runs; q public.questions%rowtype; v_total integer;
begin
  r := app.my_run(p_run);
  v_total := array_length(r.question_ids, 1);
  if r.finished_at is not null or r.idx >= v_total then
    return jsonb_build_object('finished', true, 'index', v_total, 'total', v_total, 'correct', r.correct);
  end if;
  select * into q from public.questions where id = r.question_ids[r.idx + 1];
  return jsonb_build_object('finished', false, 'index', r.idx, 'total', v_total, 'correct', r.correct,
    'half_time_available', not r.half_time_used,
    'question', jsonb_build_object('tier', q.tier, 'prompt', q.prompt, 'choices', to_jsonb(q.choices)));
end;
$$;

-- Half Time: hide two wrong answers, once per run
create function public.training_half_time(p_run uuid) returns integer[]
language plpgsql security definer set search_path = ''
as $$
declare r public.training_runs; q public.questions%rowtype;
begin
  r := app.my_run(p_run);
  if r.finished_at is not null then raise exception 'run_finished'; end if;
  if r.half_time_used then raise exception 'power_up_used'; end if;
  select * into q from public.questions where id = r.question_ids[r.idx + 1];
  update public.training_runs set half_time_used = true, half_time_question = r.idx where id = r.id;
  return (select array_agg(i order by r2) from (
    select i, random() as r2 from generate_series(0, 3) i where i <> q.answer_index order by random() limit 2) x);
end;
$$;

-- p_choice is 0 to 3, or -1 when the Shot Clock ran out
create function public.training_answer(p_run uuid, p_choice integer) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare r public.training_runs; q public.questions%rowtype; v_ok boolean; v_total integer; v_done boolean; v_points integer := 0;
begin
  r := app.my_run(p_run);
  v_total := array_length(r.question_ids, 1);
  if r.finished_at is not null or r.idx >= v_total then raise exception 'run_finished'; end if;
  select * into q from public.questions where id = r.question_ids[r.idx + 1];
  v_ok := p_choice is not null and p_choice = q.answer_index;
  v_done := r.idx + 1 >= v_total;
  update public.training_runs set idx = idx + 1, correct = correct + case when v_ok then 1 else 0 end,
    finished_at = case when v_done then now() else null end
  where id = r.id;
  if v_done then
    -- Champ Points for finishing a round, once a day
    v_points := app.award_points(r.kid_id, 'training_round', app.org_today(r.organization_id)::text);
  end if;
  return jsonb_build_object('correct', v_ok, 'answer_index', q.answer_index, 'explanation', q.explanation,
    'finished', v_done, 'correct_total', r.correct + case when v_ok then 1 else 0 end, 'total', v_total, 'points', v_points);
end;
$$;

-- ---------------------------------------------------------------------------
-- the Arena
-- ---------------------------------------------------------------------------

create table public.arena_content (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  game text not null check (game in ('scramble', 'whoami', 'wordsearch')),
  faith boolean not null default false,
  title text not null check (char_length(title) between 1 and 80),
  data jsonb not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  -- coalesce: a missing key makes these null, and a null CHECK would pass
  check (coalesce(
    (game = 'scramble' and jsonb_typeof(data -> 'text') = 'string' and char_length(data ->> 'text') between 5 and 200)
    or (game = 'whoami' and jsonb_typeof(data -> 'answer') = 'string' and char_length(data ->> 'answer') between 1 and 40
        and jsonb_typeof(data -> 'clues') = 'array' and jsonb_array_length(data -> 'clues') between 2 and 5)
    or (game = 'wordsearch' and jsonb_typeof(data -> 'words') = 'array' and jsonb_array_length(data -> 'words') between 4 and 10),
    false))
);
create index arena_content_org on public.arena_content (organization_id, game);

create table public.arena_plays (
  id bigint generated always as identity primary key,
  organization_id uuid not null,
  kid_id uuid not null,
  game text not null check (game in ('scramble', 'memory', 'whoami', 'wordsearch', 'jigsaw', 'catch')),
  score integer not null check (score between 0 and 100000),
  played_at timestamptz not null default now(),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index arena_plays_kid on public.arena_plays (kid_id, played_at desc);

-- A finished game. Points once per game per day, so replaying for points does not pay.
create function public.finish_arena_game(p_game text, p_score integer) returns integer
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; v_recent integer;
begin
  select * into k from public.kids where user_id = auth.uid() and status = 'active';
  if k.id is null then raise exception 'not_allowed'; end if;
  if p_game not in ('scramble', 'memory', 'whoami', 'wordsearch', 'jigsaw', 'catch') then raise exception 'bad_game'; end if;
  if app.org_status(k.organization_id) in ('pending', 'suspended') then raise exception 'organization_not_active'; end if;
  select count(*) into v_recent from public.arena_plays where kid_id = k.id and played_at > now() - interval '1 hour';
  if v_recent >= 60 then raise exception 'slow_down'; end if;
  insert into public.arena_plays (organization_id, kid_id, game, score) values (k.organization_id, k.id, p_game, greatest(0, least(coalesce(p_score, 0), 100000)));
  perform app.record_activity(k.id, app.org_today(k.organization_id));
  return app.award_points(k.id, 'arena_play', p_game || ':' || app.org_today(k.organization_id)::text);
end;
$$;

insert into public.point_rules (organization_id, source, points) values (null, 'training_round', 15), (null, 'arena_play', 5);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.question_packs enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_matches enable row level security;
alter table public.training_runs enable row level security;
alter table public.arena_content enable row level security;
alter table public.arena_plays enable row level security;

revoke all on public.question_packs, public.questions, public.quiz_matches, public.training_runs, public.arena_content, public.arena_plays from anon;
revoke insert, update, delete on public.quiz_matches, public.training_runs, public.arena_plays from authenticated;

create policy question_packs_read on public.question_packs for select to authenticated using (
  organization_id is null or app.is_org_member(organization_id) or app.my_kid_org() = organization_id
);
create policy question_packs_insert on public.question_packs for insert to authenticated with check (
  organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy question_packs_update on public.question_packs for update to authenticated
  using (organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id))
  with check (organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id));
create policy question_packs_delete on public.question_packs for delete to authenticated
  using (organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id));

-- answers are staff-only: kids never read this table
create policy questions_read on public.questions for select to authenticated using (
  (organization_id is null and app.is_staff_anywhere())
  or (organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]))
);
create policy questions_insert on public.questions for insert to authenticated with check (
  organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy questions_update on public.questions for update to authenticated
  using (organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id))
  with check (organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id));
create policy questions_delete on public.questions for delete to authenticated
  using (organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id));

create policy quiz_matches_read on public.quiz_matches for select to authenticated
  using (app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]));
create policy training_runs_read on public.training_runs for select to authenticated using (app.can_see_kid(organization_id, kid_id));
create policy arena_plays_read on public.arena_plays for select to authenticated using (app.can_see_kid(organization_id, kid_id));

create policy arena_content_read on public.arena_content for select to authenticated using (
  organization_id is null or app.is_org_member(organization_id) or app.my_kid_org() = organization_id
);
create policy arena_content_insert on public.arena_content for insert to authenticated with check (
  organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy arena_content_delete on public.arena_content for delete to authenticated
  using (organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id));

-- ---------------------------------------------------------------------------
-- Champzz default content (original; verses from public-domain translations)
-- ---------------------------------------------------------------------------

do $$
declare bible uuid; general uuid;
begin
  insert into public.question_packs (name, faith) values ('Bible Champs', true) returning id into bible;
  insert into public.question_packs (name, faith) values ('General Knowledge', false) returning id into general;

  insert into public.questions (pack_id, tier, prompt, choices, answer_index, explanation) values
  (bible, 1, 'Who built a giant ark before the flood?', array['Moses', 'Noah', 'David', 'Peter'], 1, 'Genesis 6 to 9.'),
  (bible, 1, 'Who was swallowed by a big fish?', array['Jonah', 'Elijah', 'Paul', 'Samuel'], 0, 'Jonah 1:17.'),
  (bible, 1, 'Which young shepherd beat the giant Goliath?', array['Saul', 'Joseph', 'David', 'Daniel'], 2, '1 Samuel 17.'),
  (bible, 1, 'In which town was Jesus born?', array['Nazareth', 'Jerusalem', 'Rome', 'Bethlehem'], 3, 'Luke 2:4 to 7.'),
  (bible, 1, 'At a wedding, what did Jesus turn water into?', array['Wine', 'Milk', 'Honey', 'Oil'], 0, 'John 2, at Cana.'),
  (bible, 1, 'On which day did God rest after making the world?', array['The first', 'The third', 'The seventh', 'The tenth'], 2, 'Genesis 2:2.'),
  (bible, 2, 'Who was thrown into a den of lions?', array['Daniel', 'Jonah', 'Samson', 'Elisha'], 0, 'Daniel 6.'),
  (bible, 2, 'How many disciples did Jesus choose?', array['7', '10', '12', '40'], 2, 'Mark 3:14.'),
  (bible, 2, 'Who led the Israelites out of Egypt?', array['Abraham', 'Moses', 'Joshua', 'Aaron'], 1, 'Exodus 12 to 14.'),
  (bible, 2, 'What was the name of the first man?', array['Abel', 'Noah', 'Adam', 'Seth'], 2, 'Genesis 2.'),
  (bible, 2, 'Which sea did God part so His people could cross?', array['The Red Sea', 'The Dead Sea', 'The Black Sea', 'The North Sea'], 0, 'Exodus 14.'),
  (bible, 2, 'What was the name of Jesus''s mother?', array['Martha', 'Ruth', 'Sarah', 'Mary'], 3, 'Luke 1:30 to 31.'),
  (bible, 3, 'How many books are in the New Testament?', array['27', '39', '50', '12'], 0, 'Matthew to Revelation.'),
  (bible, 3, 'Who was sold by his brothers and later helped rule Egypt?', array['Benjamin', 'Joseph', 'Reuben', 'Isaac'], 1, 'Genesis 37 to 41.'),
  (bible, 3, 'Which disciple said three times that he did not know Jesus?', array['John', 'Thomas', 'Peter', 'Andrew'], 2, 'Luke 22:54 to 62.'),
  (bible, 3, 'What did God give Moses on Mount Sinai?', array['A golden crown', 'A shepherd''s staff', 'The Ten Commandments', 'A silver trumpet'], 2, 'Exodus 20.'),
  (bible, 3, 'Whose great strength was linked to his long hair?', array['Gideon', 'Samson', 'Goliath', 'Jacob'], 1, 'Judges 16.'),
  (bible, 3, 'Which book comes first in the New Testament?', array['Matthew', 'Mark', 'Acts', 'Romans'], 0, 'The four Gospels open the New Testament.'),
  (bible, 4, 'Which tax collector climbed a tree to see Jesus?', array['Matthew', 'Nicodemus', 'Zacchaeus', 'Lazarus'], 2, 'Luke 19:1 to 10.'),
  (bible, 4, 'Which queen bravely spoke to the king to save her people?', array['Esther', 'Jezebel', 'Sheba', 'Vashti'], 0, 'Esther 4 to 7.'),
  (bible, 4, 'How many loaves did a boy share when Jesus fed 5,000 people?', array['Two', 'Five', 'Seven', 'Twelve'], 1, 'John 6:9. Five loaves and two fish.'),
  (bible, 4, 'Who was the first king of Israel?', array['David', 'Solomon', 'Samuel', 'Saul'], 3, '1 Samuel 10.'),
  (bible, 4, 'Which apostle, once called Saul, wrote many letters in the New Testament?', array['Paul', 'James', 'Jude', 'Philip'], 0, 'Acts 13:9.'),
  (bible, 4, 'Which famous verse is the shortest in many English Bibles?', array['God is love.', 'Jesus wept.', 'Pray continually.', 'Rejoice always.'], 1, 'John 11:35.'),
  (bible, 5, 'Who was chosen to replace Judas as one of the twelve apostles?', array['Barnabas', 'Stephen', 'Matthias', 'Timothy'], 2, 'Acts 1:26.'),
  (bible, 5, 'Which prophet went up to heaven in a whirlwind?', array['Elisha', 'Isaiah', 'Jeremiah', 'Elijah'], 3, '2 Kings 2:11.'),
  (bible, 5, 'On which island was Paul shipwrecked?', array['Malta', 'Crete', 'Cyprus', 'Patmos'], 0, 'Acts 28:1.'),
  (bible, 5, 'Who was Ruth''s mother-in-law?', array['Naomi', 'Leah', 'Hannah', 'Miriam'], 0, 'Ruth 1.'),
  (bible, 5, 'Which book of the Bible has 150 chapters?', array['Proverbs', 'Isaiah', 'Psalms', 'Genesis'], 2, 'The Psalms are a book of 150 songs and prayers.'),
  (bible, 5, 'In which garden did Jesus pray before He was arrested?', array['Eden', 'Gethsemane', 'Bethany', 'Galilee'], 1, 'Matthew 26:36.'),

  (general, 1, 'How many legs does a spider have?', array['6', '8', '10', '4'], 1, 'Insects have 6. Spiders have 8.'),
  (general, 1, 'What colour do you get when you mix blue and yellow?', array['Purple', 'Orange', 'Green', 'Brown'], 2, null),
  (general, 1, 'Which planet do we live on?', array['Mars', 'Earth', 'Venus', 'Jupiter'], 1, null),
  (general, 1, 'How many days are in a week?', array['5', '6', '7', '10'], 2, null),
  (general, 1, 'Which animal is often called the king of the jungle?', array['Lion', 'Elephant', 'Gorilla', 'Tiger'], 0, null),
  (general, 1, 'What do bees make?', array['Milk', 'Silk', 'Honey', 'Butter'], 2, null),
  (general, 2, 'What is the largest ocean on Earth?', array['Atlantic', 'Indian', 'Arctic', 'Pacific'], 3, null),
  (general, 2, 'How many continents are there?', array['5', '6', '7', '9'], 2, 'Africa, Antarctica, Asia, Australia, Europe, North America and South America.'),
  (general, 2, 'What is frozen water called?', array['Steam', 'Ice', 'Fog', 'Dew'], 1, null),
  (general, 2, 'Which star is closest to Earth?', array['The Sun', 'The North Star', 'Sirius', 'The Moon'], 0, 'The Moon is not a star.'),
  (general, 2, 'How many sides does a triangle have?', array['3', '4', '5', '6'], 0, null),
  (general, 2, 'Which is the tallest animal in the world?', array['Elephant', 'Camel', 'Giraffe', 'Horse'], 2, null),
  (general, 3, 'Which gas do plants take in from the air to make their food?', array['Oxygen', 'Carbon dioxide', 'Helium', 'Nitrogen'], 1, 'Plants give out oxygen.'),
  (general, 3, 'What is the capital city of Nigeria?', array['Lagos', 'Kano', 'Abuja', 'Ibadan'], 2, 'Abuja has been the capital since 1991.'),
  (general, 3, 'How many minutes are in an hour?', array['30', '60', '100', '24'], 1, null),
  (general, 3, 'Which planet is known as the Red Planet?', array['Mars', 'Mercury', 'Saturn', 'Neptune'], 0, null),
  (general, 3, 'What is the largest mammal?', array['Elephant', 'Blue whale', 'Giraffe', 'Hippo'], 1, null),
  (general, 3, 'What is 9 times 7?', array['56', '63', '72', '81'], 1, null),
  (general, 4, 'Which is the longest river in Africa?', array['Congo', 'Niger', 'Zambezi', 'Nile'], 3, null),
  (general, 4, 'What is the hardest natural material?', array['Gold', 'Iron', 'Diamond', 'Granite'], 2, null),
  (general, 4, 'How many bones are in an adult human body?', array['106', '206', '306', '506'], 1, null),
  (general, 4, 'Which planet is famous for its bright rings?', array['Saturn', 'Mars', 'Earth', 'Mercury'], 0, null),
  (general, 4, 'At what temperature does water boil at sea level?', array['50 °C', '90 °C', '100 °C', '120 °C'], 2, null),
  (general, 4, 'Who painted the Mona Lisa?', array['Pablo Picasso', 'Leonardo da Vinci', 'Vincent van Gogh', 'Michelangelo'], 1, null),
  (general, 5, 'What is the chemical symbol for gold?', array['Go', 'Gd', 'Ag', 'Au'], 3, 'From the Latin word aurum.'),
  (general, 5, 'Which is the largest planet in our solar system?', array['Saturn', 'Jupiter', 'Neptune', 'Earth'], 1, null),
  (general, 5, 'How many players does a football (soccer) team have on the pitch?', array['9', '10', '11', '12'], 2, null),
  (general, 5, 'What is the smallest prime number?', array['0', '1', '2', '3'], 2, null),
  (general, 5, 'Which African country has the most people?', array['Egypt', 'Nigeria', 'Ethiopia', 'South Africa'], 1, null),
  (general, 5, 'What is a word that reads the same backwards, like "level", called?', array['A palindrome', 'A synonym', 'An acronym', 'A rhyme'], 0, null);

  insert into public.arena_content (game, faith, title, data) values
  ('scramble', true, 'Genesis 1:1 (KJV)', '{"text": "In the beginning God created the heaven and the earth."}'),
  ('scramble', true, 'Psalm 23:1 (KJV)', '{"text": "The LORD is my shepherd; I shall not want."}'),
  ('scramble', true, 'Philippians 4:13 (KJV)', '{"text": "I can do all things through Christ which strengtheneth me."}'),
  ('scramble', true, 'Psalm 119:105 (WEB)', '{"text": "Your word is a lamp to my feet, and a light for my path."}'),
  ('scramble', true, '1 John 4:19 (KJV)', '{"text": "We love him, because he first loved us."}'),
  ('scramble', false, 'Champ saying', '{"text": "Every champ was once a beginner."}'),
  ('scramble', false, 'Champ saying', '{"text": "Kind words cost nothing but mean a lot."}'),
  ('scramble', false, 'Champ saying', '{"text": "Practice makes progress, not perfect."}'),
  ('scramble', false, 'Champ saying', '{"text": "Teamwork makes the dream work."}'),
  ('scramble', false, 'Proverb', '{"text": "Little by little, a little becomes a lot."}'),
  ('whoami', true, 'Bible hero', '{"answer": "Noah", "clues": ["I built a very big boat.", "Animals came to me two by two.", "God sent a rainbow as a promise after the flood."]}'),
  ('whoami', true, 'Bible hero', '{"answer": "David", "clues": ["I looked after sheep.", "I played the harp.", "I beat a giant with a sling and a stone."]}'),
  ('whoami', true, 'Bible hero', '{"answer": "Esther", "clues": ["I became a queen.", "My cousin was Mordecai.", "I was brave and saved my people."]}'),
  ('whoami', true, 'Bible hero', '{"answer": "Moses", "clues": ["I was found in a basket by a river.", "I led my people out of Egypt.", "God gave me the Ten Commandments."]}'),
  ('whoami', true, 'Bible hero', '{"answer": "Zacchaeus", "clues": ["I collected taxes.", "I was not very tall.", "I climbed a tree to see Jesus."]}'),
  ('whoami', true, 'Bible hero', '{"answer": "Jonah", "clues": ["I ran away instead of taking God''s message.", "I spent three days inside a big fish.", "In the end I went to Nineveh."]}'),
  ('whoami', false, 'Animal', '{"answer": "Elephant", "clues": ["I am the biggest animal on land.", "I have big ears that help me keep cool.", "I use my long trunk to drink."]}'),
  ('whoami', false, 'Animal', '{"answer": "Penguin", "clues": ["I am a bird but I cannot fly.", "I am a brilliant swimmer.", "Many of us live where it is icy cold."]}'),
  ('whoami', false, 'Animal', '{"answer": "Cheetah", "clues": ["I have spots.", "I live on the grasslands of Africa.", "I am the fastest runner on land."]}'),
  ('whoami', false, 'Animal', '{"answer": "Owl", "clues": ["I hunt at night.", "I can turn my head a very long way.", "I say hoo hoo."]}'),
  ('whoami', false, 'Animal', '{"answer": "Octopus", "clues": ["I live in the sea.", "I can squirt ink to hide.", "I have eight arms."]}'),
  ('whoami', false, 'Animal', '{"answer": "Bee", "clues": ["I live in a hive.", "I buzz from flower to flower.", "I make honey."]}'),
  ('wordsearch', true, 'Bible heroes', '{"words": ["NOAH", "DAVID", "MOSES", "JONAH", "ESTHER", "RUTH", "PAUL", "PETER"]}'),
  ('wordsearch', true, 'Fruit of the Spirit', '{"words": ["LOVE", "JOY", "PEACE", "PATIENCE", "KINDNESS", "GOODNESS"]}'),
  ('wordsearch', false, 'Animals', '{"words": ["LION", "ZEBRA", "TIGER", "PANDA", "EAGLE", "SHARK", "KOALA", "OTTER"]}'),
  ('wordsearch', false, 'Champ words', '{"words": ["CHAMP", "BRAVE", "KIND", "TEAM", "STAR", "TROPHY", "SPEED"]}');
end $$;

-- ---------------------------------------------------------------------------
-- grants
-- ---------------------------------------------------------------------------

revoke execute on all functions in schema public from public, anon, authenticated;
revoke execute on all functions in schema app from public, anon, authenticated;

grant execute on function
  app.is_platform_admin(), app.has_org_role(uuid, public.org_role[]), app.my_kid_org(), app.is_org_member(uuid),
  app.org_status(uuid), app.org_is_writable(uuid), app.org_can_setup(uuid), app.is_guardian_of(uuid),
  app.org_kid_limit(uuid), app.org_has_feature(uuid, text)
to anon, authenticated;
grant execute on function app.can_see_kid(uuid, uuid), app.kid_sees(uuid, uuid), app.guardian_sees(uuid, uuid), app.is_staff_anywhere() to authenticated;

grant execute on function public.get_clubhouse(text) to anon, authenticated;
grant execute on function
  public.create_organization(text, text, text, text, text, text, boolean),
  public.mark_as_paid(uuid, uuid, text, timestamptz, text, bigint, text, text),
  public.suspend_organization(uuid, text),
  public.unsuspend_organization(uuid),
  public.regenerate_join_code(uuid),
  public.approve_kid(uuid),
  public.confirm_kid(uuid),
  public.archive_kid(uuid, text),
  public.reset_kid_pin(uuid, text),
  public.record_my_visit(),
  public.give_star(uuid, text),
  public.update_my_champ(jsonb),
  public.hall_of_champs(uuid, text),
  public.submit_concern(text, boolean),
  public.my_concerns(),
  public.my_concern_replies(uuid),
  public.staff_concerns(uuid),
  public.staff_concern(uuid),
  public.staff_concern_replies(uuid),
  public.reply_to_concern(uuid, text),
  public.set_concern_status(uuid, text),
  public.add_concern_note(uuid, text),
  public.staff_concern_notes(uuid),
  public.send_message(text, uuid),
  public.submit_assignment(uuid, text),
  public.grade_submission(uuid, integer, text),
  public.club_local_to_utc(text, text),
  public.create_team_invite(uuid, text, text),
  public.accept_team_invite(text),
  public.revoke_team_invite(uuid),
  public.team_members(uuid),
  public.change_member_role(uuid, text),
  public.remove_member(uuid),
  public.check_in_kid(uuid),
  public.check_out_kid(uuid, text),
  public.check_out_override(uuid, text),
  public.my_pickup_codes(),
  public.issue_certificate(uuid, text, text),
  public.club_insights(uuid),
  public.kid_report(uuid, date),
  public.save_quiz_match(uuid, uuid, jsonb, integer, uuid, timestamptz),
  public.start_training(uuid),
  public.training_state(uuid),
  public.training_half_time(uuid),
  public.training_answer(uuid, integer),
  public.finish_arena_game(text, integer)
to authenticated;

grant execute on all functions in schema app to service_role;
grant execute on all functions in schema public to service_role;
