-- Delight extras: Faith Quest (Quest), prayer and journal, My Stuff uploads
-- with a moderation queue, the Champ collection, and Champ Buddy (the AI
-- companion: off by default, Pro plan and up, parental consent per child).

-- ---------------------------------------------------------------------------
-- Faith Quest / Quest
-- ---------------------------------------------------------------------------

create table public.quests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 80),
  summary text check (summary is null or char_length(summary) <= 200),
  faith boolean not null default false,
  sort integer not null default 100,
  created_at timestamptz not null default now()
);

create table public.quest_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  quest_id uuid not null references public.quests (id) on delete cascade,
  position smallint not null check (position between 1 and 20),
  title text not null check (char_length(title) between 2 and 80),
  body text not null check (char_length(body) between 1 and 2000),
  check_prompt text not null check (char_length(check_prompt) between 3 and 200),
  check_choices text[] not null check (array_length(check_choices, 1) = 3 and array_position(check_choices, null) is null),
  check_answer smallint not null check (check_answer between 0 and 2),
  unique (quest_id, position)
);

create function app.step_org() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.organization_id := (select organization_id from public.quests where id = new.quest_id);
  return new;
end;
$$;
create trigger quest_steps_org before insert or update on public.quest_steps for each row execute function app.step_org();

create table public.quest_progress (
  organization_id uuid not null,
  kid_id uuid not null,
  step_id uuid not null references public.quest_steps (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (kid_id, step_id),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);

create function app.kid_sees_quest(p_org uuid, p_faith boolean) returns boolean
language sql stable security definer set search_path = ''
as $$
  select (p_org is null and (not p_faith or coalesce((select o.faith_mode from public.organizations o where o.id = app.my_kid_org()), false)))
      or (p_org is not null and app.my_kid_org() = p_org)
$$;

-- Answer the checkpoint at the end of a step. Steps open in order.
create function public.complete_quest_step(p_step uuid, p_choice integer) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; s public.quest_steps%rowtype; q public.quests%rowtype; v_ok boolean; v_points integer := 0;
begin
  select * into k from public.kids where user_id = auth.uid() and status = 'active';
  if k.id is null then raise exception 'not_allowed'; end if;
  select * into s from public.quest_steps where id = p_step;
  select * into q from public.quests where id = s.quest_id;
  -- "is not true": a null here (a default quest has no club) must mean no, never a pass
  if s.id is null or ((q.organization_id is null and (not q.faith or (select faith_mode from public.organizations where id = k.organization_id)))
                      or q.organization_id = k.organization_id) is not true then
    raise exception 'not_allowed';
  end if;
  if exists (select 1 from public.quest_steps p where p.quest_id = s.quest_id and p.position < s.position
             and not exists (select 1 from public.quest_progress qp where qp.kid_id = k.id and qp.step_id = p.id)) then
    raise exception 'step_locked';
  end if;
  v_ok := p_choice = s.check_answer;
  if v_ok then
    insert into public.quest_progress (organization_id, kid_id, step_id) values (k.organization_id, k.id, s.id) on conflict do nothing;
    v_points := app.award_points(k.id, 'quest_step', s.id::text);
    perform app.record_activity(k.id, app.org_today(k.organization_id));
  end if;
  return jsonb_build_object('correct', v_ok, 'points', v_points);
end;
$$;

insert into public.point_rules (organization_id, source, points) values (null, 'quest_step', 10);

-- ---------------------------------------------------------------------------
-- prayer and journal: private to the child
-- ---------------------------------------------------------------------------

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  kid_id uuid not null,
  kind text not null check (kind in ('prayer', 'thanks', 'note')),
  body text not null check (char_length(body) between 1 and 1000),
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index journal_kid on public.journal_entries (kid_id, created_at desc);

create function app.my_kid_id() returns uuid
language sql stable security definer set search_path = ''
as $$ select id from public.kids where user_id = auth.uid() and status = 'active' $$;

-- ---------------------------------------------------------------------------
-- My Stuff: kid uploads, checked by a grown-up before anyone else sees them
-- ---------------------------------------------------------------------------

create table public.kid_uploads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  kid_id uuid not null,
  path text not null unique,
  caption text check (caption is null or char_length(caption) <= 100),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index kid_uploads_org on public.kid_uploads (organization_id, status, created_at);

-- Called by the server (service role) after it stored the file for a signed-in kid.
create function app.register_upload(p_kid uuid, p_path text, p_caption text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; v_id uuid; v_count integer; h uuid;
begin
  select * into k from public.kids where id = p_kid and status = 'active';
  if k.id is null then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(k.organization_id) then raise exception 'organization_not_active'; end if;
  if p_path not like k.organization_id || '/' || k.id || '/%' then raise exception 'bad_path'; end if;
  select count(*) into v_count from public.kid_uploads where kid_id = k.id and status <> 'rejected';
  if v_count >= 20 then raise exception 'too_many_uploads'; end if;
  insert into public.kid_uploads (organization_id, kid_id, path, caption) values (k.organization_id, k.id, p_path, left(nullif(btrim(p_caption), ''), 100))
  returning id into v_id;
  for h in select * from app.concern_handlers(k.organization_id, k.class_id) loop
    perform app.notify(k.organization_id, h, 'upload', 'A picture is waiting for a check', null, '/o/' || app.org_slug(k.organization_id) || '/moderation');
  end loop;
  return v_id;
end;
$$;

create function public.svc_register_upload(p_kid uuid, p_path text, p_caption text) returns uuid
language sql security definer set search_path = ''
as $$ select app.register_upload(p_kid, p_path, p_caption) $$;

-- returns the storage path, so the server can delete a rejected file
create function public.moderate_upload(p_upload uuid, p_approve boolean) returns text
language plpgsql security definer set search_path = ''
as $$
declare u public.kid_uploads%rowtype; v_user uuid;
begin
  select * into u from public.kid_uploads where id = p_upload for update;
  if u.id is null or not app.has_org_role(u.organization_id, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  update public.kid_uploads set status = case when p_approve then 'approved' else 'rejected' end, reviewed_by = auth.uid(), reviewed_at = now() where id = u.id;
  perform app.audit(u.organization_id, auth.uid(), case when p_approve then 'upload.approved' else 'upload.rejected' end, 'kid', u.kid_id::text, '{}'::jsonb);
  select user_id into v_user from public.kids where id = u.kid_id;
  perform app.notify(u.organization_id, v_user, 'upload', case when p_approve then 'Your picture is in My Stuff!' else 'Your picture was not added' end,
                     case when p_approve then null else 'A grown-up checked it and it could not go in. You can try a different one.' end,
                     '/k/' || app.org_slug(u.organization_id) || '/stuff');
  return u.path;
end;
$$;

-- ---------------------------------------------------------------------------
-- Champ collection (unlocked by Champ Points; nothing to write)
-- ---------------------------------------------------------------------------

create table public.collectibles (
  code text primary key check (code ~ '^[a-z_]{2,32}$'),
  name text not null,
  blurb text not null,
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legend')),
  min_points integer not null check (min_points >= 0),
  icon smallint not null check (icon between 0 and 11),
  color text not null check (color ~ '^#[0-9A-F]{6}$'),
  sort integer not null unique
);

insert into public.collectibles (code, name, blurb, rarity, min_points, icon, color, sort) values
  ('spark', 'Spark', 'Every champ starts with a spark.', 'common', 0, 0, '#F2B33D', 1),
  ('sunny', 'Sunny', 'Brings the good mood to class.', 'common', 25, 2, '#F2B33D', 2),
  ('splash', 'Splash', 'Dives into every challenge.', 'common', 50, 5, '#2F5BFF', 3),
  ('sprout', 'Sprout', 'Grows a little every day.', 'common', 100, 6, '#1E8F5A', 4),
  ('kicker', 'Kicker', 'Never misses a pass.', 'rare', 175, 4, '#FF5A3C', 5),
  ('bloom', 'Bloom', 'Kindness in full colour.', 'rare', 250, 9, '#D63384', 6),
  ('dreamer', 'Dreamer', 'Thinks big at bedtime.', 'rare', 400, 3, '#2F5BFF', 7),
  ('homebase', 'Homebase', 'Makes everyone feel welcome.', 'epic', 550, 7, '#0B1026', 8),
  ('zoom', 'Zoom', 'Fast feet, faster brain.', 'epic', 750, 11, '#2F5BFF', 9),
  ('heart', 'Big Heart', 'Shows up for friends.', 'epic', 1000, 1, '#FF5A3C', 10),
  ('rocket', 'Rocket', 'Reaching for the stars.', 'legend', 1500, 8, '#FF5A3C', 11),
  ('champion', 'The Champion', 'Rookie to Champ. You did it.', 'legend', 2500, 0, '#0B1026', 12);

-- ---------------------------------------------------------------------------
-- Champ Buddy (AI companion)
-- ---------------------------------------------------------------------------

-- the club's own switch; it also needs the Pro plan and a parent's yes per child
alter table public.organizations add column ai_enabled boolean not null default false;
grant update (ai_enabled) on public.organizations to authenticated;

create table public.ai_consents (
  kid_id uuid primary key,
  organization_id uuid not null,
  guardian_user_id uuid references auth.users (id) on delete set null,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  updated_at timestamptz not null default now(),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);

create function public.set_ai_consent(p_kid uuid, p_allow boolean) returns void
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype;
begin
  select * into k from public.kids where id = p_kid;
  if k.id is null or not exists (select 1 from public.guardians g where g.kid_id = k.id and g.user_id = auth.uid()) then raise exception 'not_allowed'; end if;
  insert into public.ai_consents (kid_id, organization_id, guardian_user_id, granted_at, withdrawn_at)
  values (k.id, k.organization_id, auth.uid(), case when p_allow then now() end, case when p_allow then null else now() end)
  on conflict (kid_id) do update set guardian_user_id = auth.uid(),
    granted_at = case when p_allow then now() else public.ai_consents.granted_at end,
    withdrawn_at = case when p_allow then null else now() end, updated_at = now();
  perform app.audit(k.organization_id, auth.uid(), case when p_allow then 'ai.consent_granted' else 'ai.consent_withdrawn' end, 'kid', k.id::text, '{}'::jsonb);
end;
$$;

create table public.ai_messages (
  id bigint generated always as identity primary key,
  organization_id uuid not null,
  kid_id uuid not null,
  role text not null check (role in ('kid', 'buddy')),
  body text not null check (char_length(body) between 1 and 4000),
  flagged boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index ai_messages_kid on public.ai_messages (kid_id, created_at);
create index ai_messages_org on public.ai_messages (organization_id, created_at desc);

-- Why Champ Buddy is or is not available to the signed-in kid right now.
create function public.ai_status() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare k public.kids%rowtype; o public.organizations%rowtype; v_used integer;
begin
  select * into k from public.kids where user_id = auth.uid() and status = 'active';
  if k.id is null then raise exception 'not_allowed'; end if;
  select * into o from public.organizations where id = k.organization_id;
  select count(*) into v_used from public.ai_messages where kid_id = k.id and role = 'kid' and created_at > now() - interval '1 day';
  return jsonb_build_object(
    'plan', app.org_has_feature(o.id, 'ai_companion'),
    'club', o.ai_enabled,
    'consent', exists (select 1 from public.ai_consents c where c.kid_id = k.id and c.granted_at is not null and c.withdrawn_at is null),
    'active', app.org_is_writable(o.id),
    'used_today', v_used, 'limit', 30, 'faith', o.faith_mode, 'first_name', k.first_name,
    'kid_id', k.id, 'organization_id', o.id);
end;
$$;

-- Server-only: record one exchange (the server has already checked ai_status)
create function public.svc_log_ai(p_kid uuid, p_kid_text text, p_reply text, p_flagged boolean) returns void
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; a uuid;
begin
  select * into k from public.kids where id = p_kid and status = 'active';
  if k.id is null then raise exception 'not_allowed'; end if;
  insert into public.ai_messages (organization_id, kid_id, role, body, flagged) values
    (k.organization_id, k.id, 'kid', left(p_kid_text, 4000), p_flagged),
    (k.organization_id, k.id, 'buddy', left(p_reply, 4000), false);
  if p_flagged then
    for a in select * from app.concern_handlers(k.organization_id, k.class_id) loop
      perform app.notify(k.organization_id, a, 'ai_flag', 'A Champ Buddy chat needs a look', 'A child wrote something that may mean they need help.',
                         '/o/' || app.org_slug(k.organization_id) || '/buddy', 'urgent');
    end loop;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.quests enable row level security;
alter table public.quest_steps enable row level security;
alter table public.quest_progress enable row level security;
alter table public.journal_entries enable row level security;
alter table public.kid_uploads enable row level security;
alter table public.collectibles enable row level security;
alter table public.ai_consents enable row level security;
alter table public.ai_messages enable row level security;

revoke all on public.quests, public.quest_steps, public.quest_progress, public.journal_entries, public.kid_uploads,
  public.collectibles, public.ai_consents, public.ai_messages from anon;
revoke insert, update, delete on public.quest_progress, public.kid_uploads, public.collectibles, public.ai_consents, public.ai_messages from authenticated;
-- the checkpoint answer is never readable by a client
revoke all on public.quest_steps from authenticated;
grant select (id, organization_id, quest_id, position, title, body, check_prompt, check_choices) on public.quest_steps to authenticated;
grant insert (quest_id, position, title, body, check_prompt, check_choices, check_answer), delete on public.quest_steps to authenticated;

create policy quests_read on public.quests for select to authenticated using (
  app.kid_sees_quest(organization_id, faith)
  or (organization_id is null and app.is_staff_anywhere())
  or (organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]))
);
create policy quests_insert on public.quests for insert to authenticated with check (
  organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy quests_delete on public.quests for delete to authenticated using (
  organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy quest_steps_read on public.quest_steps for select to authenticated using (
  exists (select 1 from public.quests q where q.id = quest_steps.quest_id)
);
create policy quest_steps_insert on public.quest_steps for insert to authenticated with check (
  organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy quest_steps_delete on public.quest_steps for delete to authenticated using (
  organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy quest_progress_read on public.quest_progress for select to authenticated using (app.can_see_kid(organization_id, kid_id));

-- private to the child: not staff, not parents
create policy journal_own_read on public.journal_entries for select to authenticated using (kid_id = app.my_kid_id());
create policy journal_own_insert on public.journal_entries for insert to authenticated with check (
  kid_id = app.my_kid_id() and organization_id = app.my_kid_org()
);
create policy journal_own_update on public.journal_entries for update to authenticated
  using (kid_id = app.my_kid_id()) with check (kid_id = app.my_kid_id() and organization_id = app.my_kid_org());
create policy journal_own_delete on public.journal_entries for delete to authenticated using (kid_id = app.my_kid_id());

-- the child and staff see every upload; parents only once a grown-up has approved it
create policy kid_uploads_read on public.kid_uploads for select to authenticated using (
  app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[])
  or kid_id = app.my_kid_id()
  or (status = 'approved' and app.is_guardian_of(kid_id))
);

create policy collectibles_read on public.collectibles for select to authenticated using (true);
create policy ai_consents_read on public.ai_consents for select to authenticated using (app.can_see_kid(organization_id, kid_id));
create policy ai_messages_read on public.ai_messages for select to authenticated using (app.can_see_kid(organization_id, kid_id));

-- private storage for kid uploads: no client policies, the server signs short-lived URLs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kid-uploads', 'kid-uploads', false, 1048576, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- default quests (original)
-- ---------------------------------------------------------------------------

do $$
declare q uuid;
begin
  insert into public.quests (title, summary, faith, sort) values ('Brave like David', 'Three short stops on being brave when things look big.', true, 1) returning id into q;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (q, 1, 'A shepherd boy', 'Before he was a king, David looked after his family''s sheep. It was a quiet job, but he took it seriously. When a lion or a bear came for the sheep, he protected them (1 Samuel 17:34 to 35). Being brave often starts with doing small jobs well.', 'What job did David have before he was king?', array['Looking after sheep', 'Building boats', 'Baking bread'], 0),
  (q, 2, 'A giant problem', 'An enemy soldier called Goliath was huge, and everyone was scared of him. David trusted God and said he would face Goliath. People laughed because he was young, but he did not let that stop him.', 'How did people react when young David offered to face Goliath?', array['They gave him a crown', 'They thought he was too young', 'They all ran away'], 1),
  (q, 3, 'Your brave step', 'David used what he knew: a sling and five smooth stones. You do not need to be the biggest to be brave. Being brave can mean telling the truth, saying sorry, or standing up for someone who is left out.', 'Which of these is a brave thing a champ can do?', array['Laugh at someone who is new', 'Stand up for someone who is left out', 'Hide when it is your turn'], 1);

  insert into public.quests (title, summary, faith, sort) values ('Kind like the Good Samaritan', 'A story Jesus told about who our neighbour is.', true, 2) returning id into q;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (q, 1, 'Hurt on the road', 'Jesus told a story about a man who was robbed and left hurt by the side of the road (Luke 10:30). Two people walked past and did not stop to help him.', 'What happened to the man in the story?', array['He won a race', 'He was robbed and hurt', 'He found treasure'], 1),
  (q, 2, 'Someone stops', 'Then a Samaritan came along. People did not expect him to help, but he stopped, cleaned the man''s wounds and took him somewhere safe to get better.', 'What did the Samaritan do?', array['He walked past', 'He laughed', 'He stopped and helped'], 2),
  (q, 3, 'Go and do the same', 'Jesus said, "Go and do likewise." Being a good neighbour means helping anyone who needs it, even people who are different from us.', 'Who is our neighbour, in this story?', array['Only our best friends', 'Anyone who needs help', 'Only people who live next door'], 1);

  insert into public.quests (title, summary, faith, sort) values ('Be a Kind Champ', 'Three quick stops on kindness that makes a difference.', false, 3) returning id into q;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (q, 1, 'Notice people', 'Kindness starts with noticing. Who is sitting alone? Who looks worried? Champs look around and see people.', 'What is the first step of kindness in this quest?', array['Noticing people', 'Winning games', 'Being the loudest'], 0),
  (q, 2, 'Small things count', 'A smile, a "well done", or letting someone go first are small, but they can change someone''s whole day.', 'Which one is a small act of kindness?', array['Pushing in the queue', 'Saying "well done" to a friend', 'Ignoring a question'], 1),
  (q, 3, 'Kind to yourself too', 'Champs make mistakes. Being kind includes being kind to yourself: try again, ask for help, and keep going.', 'What can a champ do after a mistake?', array['Give up forever', 'Blame someone else', 'Try again and ask for help'], 2);

  insert into public.quests (title, summary, faith, sort) values ('Never Give Up', 'What to do when something feels too hard.', false, 4) returning id into q;
  insert into public.quest_steps (quest_id, position, title, body, check_prompt, check_choices, check_answer) values
  (q, 1, 'Hard is normal', 'Learning something new feels hard at first. That feeling means your brain is growing, not that you are failing.', 'What does it mean when learning feels hard?', array['Your brain is growing', 'You should stop', 'Nobody else finds it hard'], 0),
  (q, 2, 'Break it down', 'Big tasks are easier in small pieces. Do one small step, then the next. Champs climb one level at a time, from Rookie to Champ.', 'How can you make a big task easier?', array['Do it all at once', 'Break it into small steps', 'Wait until tomorrow forever'], 1),
  (q, 3, 'Ask for a teammate', 'Even the best champs have coaches and teammates. Asking for help is a smart move, not a weak one.', 'Asking for help is...', array['A smart move', 'Not allowed', 'Only for grown-ups'], 0);
end $$;

-- ---------------------------------------------------------------------------
-- hardening: two earlier checks let a null slip through (a missing team name,
-- a null avatar). "is not true" makes a null fail.
-- ---------------------------------------------------------------------------

create or replace function public.save_quiz_match(p_org uuid, p_pack uuid, p_teams jsonb, p_questions integer, p_client_id uuid, p_played_at timestamptz default null)
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
  if (jsonb_typeof(p_teams) = 'array' and jsonb_array_length(p_teams) between 1 and 6) is not true then raise exception 'bad_teams'; end if;
  for t in select * from jsonb_array_elements(p_teams) loop
    if (jsonb_typeof(t -> 'name') = 'string' and char_length(btrim(t ->> 'name')) between 1 and 30
        and jsonb_typeof(t -> 'score') = 'number' and (t ->> 'score')::numeric between 0 and 100000) is not true then
      raise exception 'bad_teams';
    end if;
  end loop;
  insert into public.quiz_matches (organization_id, pack_id, pack_name, season_id, host_id, teams, questions_played, client_id, played_at)
  values (p_org, p_pack, v_name, app.current_season_id(p_org), auth.uid(),
          (select jsonb_agg(jsonb_build_object('name', left(btrim(x ->> 'name'), 30), 'score', (x ->> 'score')::int)) from jsonb_array_elements(p_teams) x),
          greatest(0, least(coalesce(p_questions, 0), 200)), p_client_id,
          case when p_played_at is not null and p_played_at between now() - interval '30 days' and now() then p_played_at else now() end)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.update_my_champ(p_avatar jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_kid uuid; v_points integer; v_level public.levels; v_sort integer; k text;
begin
  select k2.id into v_kid from public.kids k2 where k2.user_id = auth.uid() and k2.status = 'active';
  if v_kid is null then raise exception 'not_allowed'; end if;
  if (jsonb_typeof(p_avatar) = 'object') is not true then raise exception 'bad_avatar'; end if;
  for k in select jsonb_object_keys(p_avatar) loop
    if k not in ('skin', 'hair', 'hairColor', 'outfit', 'extra') then raise exception 'bad_avatar'; end if;
  end loop;
  if coalesce(p_avatar ->> 'skin', '0') !~ '^[0-5]$' or coalesce(p_avatar ->> 'hair', '0') !~ '^[0-5]$'
     or coalesce(p_avatar ->> 'hairColor', '0') !~ '^[0-5]$' or coalesce(p_avatar ->> 'outfit', '0') !~ '^[0-7]$' then
    raise exception 'bad_avatar';
  end if;
  select coalesce(points_total, 0) into v_points from public.kid_stats where kid_id = v_kid;
  v_level := app.level_of(coalesce(v_points, 0));
  v_sort := v_level.sort;
  -- extras unlock by level: headband (Rising Star), cape (All-Star), medal (Legend), crown (Champ)
  if coalesce(p_avatar ->> 'extra', 'none') not in ('none', 'headband', 'cape', 'medal', 'crown') then raise exception 'bad_avatar'; end if;
  if (p_avatar ->> 'extra' = 'headband' and v_sort < 2) or (p_avatar ->> 'extra' = 'cape' and v_sort < 3)
     or (p_avatar ->> 'extra' = 'medal' and v_sort < 4) or (p_avatar ->> 'extra' = 'crown' and v_sort < 5) then
    raise exception 'locked_item';
  end if;
  update public.kids set avatar = p_avatar where id = v_kid;
end;
$$;

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
grant execute on function app.can_see_kid(uuid, uuid), app.kid_sees(uuid, uuid), app.guardian_sees(uuid, uuid), app.is_staff_anywhere(),
  app.kid_sees_quest(uuid, boolean), app.my_kid_id() to authenticated;

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
  public.finish_arena_game(text, integer),
  public.complete_quest_step(uuid, integer),
  public.moderate_upload(uuid, boolean),
  public.set_ai_consent(uuid, boolean),
  public.ai_status()
to authenticated;

grant execute on all functions in schema app to service_role;
grant execute on all functions in schema public to service_role;
