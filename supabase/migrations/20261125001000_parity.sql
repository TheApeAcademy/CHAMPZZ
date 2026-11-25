-- The last CCT features: Clubhouse posts, Bible reading plans, the Digital
-- Bank (club media library) and Record-a-verse.

-- ---------------------------------------------------------------------------
-- Clubhouse posts: news on the club's public page
-- ---------------------------------------------------------------------------

create table public.club_posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 100),
  body text not null check (char_length(body) between 1 and 3000),
  published boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index club_posts_org on public.club_posts (organization_id, created_at desc);

-- Public: the published posts of a club whose Clubhouse is visible. No names, no kids.
create function public.get_clubhouse_posts(p_slug text)
returns table (id uuid, title text, body text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.title, p.body, p.created_at
  from public.club_posts p join public.organizations o on o.id = p.organization_id
  where o.slug = lower(btrim(p_slug)) and o.status <> 'suspended' and p.published
  order by p.created_at desc
  limit 20
$$;

-- ---------------------------------------------------------------------------
-- Bible reading plans (faith mode)
-- ---------------------------------------------------------------------------

create table public.reading_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 80),
  summary text check (summary is null or char_length(summary) <= 200),
  created_at timestamptz not null default now()
);

create table public.reading_plan_days (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  plan_id uuid not null references public.reading_plans (id) on delete cascade,
  day smallint not null check (day between 1 and 60),
  reference text not null check (char_length(reference) between 3 and 60),
  summary text not null check (char_length(summary) between 3 and 300),
  unique (plan_id, day)
);

create function app.plan_day_org() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.organization_id := (select organization_id from public.reading_plans where id = new.plan_id);
  return new;
end;
$$;
create trigger reading_plan_days_org before insert or update on public.reading_plan_days for each row execute function app.plan_day_org();

create table public.reading_progress (
  organization_id uuid not null,
  kid_id uuid not null,
  day_id uuid not null references public.reading_plan_days (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (kid_id, day_id),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);

create function app.kid_sees_plan(p_org uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select o.faith_mode from public.organizations o where o.id = app.my_kid_org()), false)
     and (p_org is null or p_org = app.my_kid_org())
$$;

-- Tick off a day. Finishing every day of a plan earns a club certificate.
create function public.mark_reading_day(p_day uuid) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; d public.reading_plan_days%rowtype; p public.reading_plans%rowtype; v_points integer := 0; v_left integer; v_cert uuid;
begin
  select * into k from public.kids where user_id = auth.uid() and status = 'active';
  if k.id is null then raise exception 'not_allowed'; end if;
  select * into d from public.reading_plan_days where id = p_day;
  select * into p from public.reading_plans where id = d.plan_id;
  if d.id is null or ((select faith_mode from public.organizations where id = k.organization_id)
                      and (p.organization_id is null or p.organization_id = k.organization_id)) is not true then
    raise exception 'not_allowed';
  end if;
  insert into public.reading_progress (organization_id, kid_id, day_id) values (k.organization_id, k.id, d.id) on conflict do nothing;
  if found then
    v_points := app.award_points(k.id, 'reading_day', d.id::text);
    perform app.record_activity(k.id, app.org_today(k.organization_id));
    select count(*) into v_left from public.reading_plan_days pd
    where pd.plan_id = p.id and not exists (select 1 from public.reading_progress rp where rp.kid_id = k.id and rp.day_id = pd.id);
    if v_left = 0 then
      insert into public.certificates (organization_id, kid_id, title, reason)
      values (k.organization_id, k.id, left('Reading plan: ' || p.title, 80), 'Read every day of the plan.')
      returning id into v_cert;
      perform app.notify(k.organization_id, k.user_id, 'certificate', 'You finished a reading plan!', p.title, '/k/' || app.org_slug(k.organization_id) || '/certificates/' || v_cert);
    end if;
  end if;
  return jsonb_build_object('points', v_points, 'certificate', v_cert);
end;
$$;

insert into public.point_rules (organization_id, source, points) values (null, 'reading_day', 5);

-- ---------------------------------------------------------------------------
-- Digital Bank: the club's own files (staff only, or shared with families)
-- ---------------------------------------------------------------------------

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  path text not null unique,
  mime text not null check (mime in ('application/pdf', 'image/png', 'image/jpeg', 'image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  audience text not null default 'staff' check (audience in ('staff', 'families')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index media_items_org on public.media_items (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Record-a-verse (faith mode): kids record their memory verse, teachers listen
-- ---------------------------------------------------------------------------

create table public.verse_recordings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  kid_id uuid not null,
  lesson_id uuid references public.lessons (id) on delete set null,
  path text not null unique,
  status text not null default 'new' check (status in ('new', 'heard')),
  heard_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index verse_recordings_org on public.verse_recordings (organization_id, status, created_at);

-- server-only, after the server stored the audio for a signed-in kid
create function public.svc_register_verse(p_kid uuid, p_path text, p_lesson uuid default null) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; v_id uuid; v_recent integer; h uuid;
begin
  select * into k from public.kids where id = p_kid and status = 'active';
  if k.id is null then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(k.organization_id) then raise exception 'organization_not_active'; end if;
  if (select faith_mode from public.organizations where id = k.organization_id) is not true then raise exception 'not_allowed'; end if;
  if p_path not like k.organization_id || '/' || k.id || '/%' then raise exception 'bad_path'; end if;
  select count(*) into v_recent from public.verse_recordings where kid_id = k.id and created_at > now() - interval '1 day';
  if v_recent >= 5 then raise exception 'too_many_recordings'; end if;
  insert into public.verse_recordings (organization_id, kid_id, lesson_id, path)
  values (k.organization_id, k.id, (select id from public.lessons where id = p_lesson and organization_id = k.organization_id), p_path)
  returning id into v_id;
  for h in select * from app.concern_handlers(k.organization_id, k.class_id) loop
    perform app.notify(k.organization_id, h, 'verse', k.first_name || ' recorded a memory verse', null, '/o/' || app.org_slug(k.organization_id) || '/verses');
  end loop;
  return v_id;
end;
$$;

create function public.mark_verse_heard(p_recording uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare r public.verse_recordings%rowtype;
begin
  select * into r from public.verse_recordings where id = p_recording;
  if r.id is null or not app.has_org_role(r.organization_id, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  update public.verse_recordings set status = 'heard', heard_by = auth.uid() where id = r.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.club_posts enable row level security;
alter table public.reading_plans enable row level security;
alter table public.reading_plan_days enable row level security;
alter table public.reading_progress enable row level security;
alter table public.media_items enable row level security;
alter table public.verse_recordings enable row level security;

revoke all on public.club_posts, public.reading_plans, public.reading_plan_days, public.reading_progress, public.media_items, public.verse_recordings from anon;
revoke insert, update, delete on public.reading_progress, public.media_items, public.verse_recordings from authenticated;

create policy club_posts_read on public.club_posts for select to authenticated using (
  app.is_org_member(organization_id) or app.my_kid_org() = organization_id
  or exists (select 1 from public.guardians g where g.organization_id = club_posts.organization_id and g.user_id = (select auth.uid()))
);
create policy club_posts_insert on public.club_posts for insert to authenticated with check (
  app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy club_posts_update on public.club_posts for update to authenticated
  using (app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id))
  with check (app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id));
create policy club_posts_delete on public.club_posts for delete to authenticated
  using (app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id));

create policy reading_plans_read on public.reading_plans for select to authenticated using (
  app.kid_sees_plan(organization_id)
  or (organization_id is null and app.is_staff_anywhere())
  or (organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]))
);
create policy reading_plans_insert on public.reading_plans for insert to authenticated with check (
  organization_id is not null and app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy reading_plan_days_read on public.reading_plan_days for select to authenticated using (
  exists (select 1 from public.reading_plans p where p.id = reading_plan_days.plan_id)
);
create policy reading_plan_days_insert on public.reading_plan_days for insert to authenticated with check (
  exists (select 1 from public.reading_plans p where p.id = reading_plan_days.plan_id and p.organization_id is not null
          and app.has_org_role(p.organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(p.organization_id))
);
create policy reading_progress_read on public.reading_progress for select to authenticated using (app.can_see_kid(organization_id, kid_id));

create policy media_items_read on public.media_items for select to authenticated using (
  app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[])
  or (audience = 'families' and exists (select 1 from public.guardians g where g.organization_id = media_items.organization_id and g.user_id = (select auth.uid())))
);
create policy verse_recordings_read on public.verse_recordings for select to authenticated using (
  app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) or kid_id = app.my_kid_id()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('club-media', 'club-media', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']),
  ('verse-recordings', 'verse-recordings', false, 2097152, array['audio/webm', 'audio/ogg', 'audio/mp4'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- default reading plans: references and short summaries only (kids read the
-- passage in their own Bible), so no translation text is reproduced
-- ---------------------------------------------------------------------------

do $$
declare p uuid;
begin
  insert into public.reading_plans (title, summary) values ('Meet Jesus in 7 days', 'A week in the Gospel of Luke.') returning id into p;
  insert into public.reading_plan_days (plan_id, day, reference, summary) values
  (p, 1, 'Luke 2:1-20', 'Jesus is born in Bethlehem, and shepherds hear the news from angels.'),
  (p, 2, 'Luke 2:41-52', 'Young Jesus stays behind at the temple, listening and asking questions.'),
  (p, 3, 'Luke 5:1-11', 'Fishermen catch a huge haul of fish and decide to follow Jesus.'),
  (p, 4, 'Luke 8:22-25', 'Jesus calms a storm on the lake.'),
  (p, 5, 'Luke 10:25-37', 'The story of the Good Samaritan: who is my neighbour?'),
  (p, 6, 'Luke 15:1-7', 'The shepherd who searches for one lost sheep.'),
  (p, 7, 'Luke 19:1-10', 'Zacchaeus climbs a tree, and his life is changed.');
  insert into public.reading_plans (title, summary) values ('Brave hearts: 5 Psalms', 'Five songs for days that feel big.') returning id into p;
  insert into public.reading_plan_days (plan_id, day, reference, summary) values
  (p, 1, 'Psalm 23', 'God is like a shepherd who cares for us.'),
  (p, 2, 'Psalm 27:1-5', 'When we feel afraid, God is our light.'),
  (p, 3, 'Psalm 46:1-3', 'God is our safe place, even when everything shakes.'),
  (p, 4, 'Psalm 121', 'God watches over us day and night.'),
  (p, 5, 'Psalm 139:13-16', 'We are wonderfully made.');
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
grant execute on function app.can_see_kid(uuid, uuid), app.kid_sees(uuid, uuid), app.guardian_sees(uuid, uuid), app.is_staff_anywhere(),
  app.kid_sees_quest(uuid, boolean), app.my_kid_id(), app.kid_sees_plan(uuid) to authenticated;

grant execute on function public.get_clubhouse(text), public.get_clubhouse_posts(text) to anon, authenticated;
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
  public.ai_status(),
  public.mark_reading_day(uuid),
  public.mark_verse_heard(uuid)
to authenticated;

grant execute on all functions in schema app to service_role;
grant execute on all functions in schema public to service_role;
