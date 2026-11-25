-- Safeguarding and class life: Talk to Someone, notifications, messages,
-- lessons, assignments, events.
--
-- Talk to Someone tables have NO select policies at all. Every read goes
-- through functions that mask an anonymous child's identity, so no client
-- query, view or join can ever reveal who sent an anonymous message.

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  severity text not null default 'normal' check (severity in ('normal', 'urgent')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_recipient on public.notifications (recipient_id, read_at, created_at desc);

create function app.notify(p_org uuid, p_to uuid, p_kind text, p_title text, p_body text, p_link text, p_severity text default 'normal')
returns void language sql security definer set search_path = ''
as $$
  insert into public.notifications (organization_id, recipient_id, kind, title, body, link, severity)
  select p_org, p_to, p_kind, p_title, p_body, p_link, p_severity where p_to is not null
$$;

-- ---------------------------------------------------------------------------
-- Talk to Someone
-- ---------------------------------------------------------------------------

create table public.concerns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  kid_id uuid not null,
  class_id uuid,
  body text not null check (char_length(body) between 1 and 2000),
  is_anonymous boolean not null default false,
  status text not null default 'new' check (status in ('new', 'acknowledged', 'in_progress', 'escalated', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index concerns_org on public.concerns (organization_id, created_at desc);

create table public.concern_replies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  concern_id uuid not null references public.concerns (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  from_staff boolean not null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.concern_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  concern_id uuid not null references public.concerns (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.concern_access_log (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  concern_id uuid not null references public.concerns (id) on delete cascade,
  user_id uuid,
  action text not null,
  at timestamptz not null default now()
);

-- Org Admins handle every concern; teachers handle concerns from kids in classes they teach.
create function app.concern_handler(p_org uuid, p_class uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select app.has_org_role(p_org, array['org_admin']::public.org_role[])
      or (p_class is not null and exists (
            select 1 from public.class_teachers ct
            where ct.class_id = p_class and ct.user_id = auth.uid()
              and app.has_org_role(p_org, array['teacher']::public.org_role[])))
$$;

create function app.concern_handlers(p_org uuid, p_class uuid) returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select m.user_id from public.memberships m
  where m.organization_id = p_org and m.status = 'active' and m.role = 'org_admin'
  union
  select ct.user_id from public.class_teachers ct
  join public.memberships m on m.user_id = ct.user_id and m.organization_id = p_org and m.status = 'active' and m.role = 'teacher'
  where ct.class_id = p_class
$$;

create function app.org_slug(p_org uuid) returns text
language sql stable security definer set search_path = ''
as $$ select slug from public.organizations where id = p_org $$;

-- A kid sends a message. Works in every org state except pending and
-- suspended: a child asking for help never hits a paywall.
create function public.submit_concern(p_body text, p_anonymous boolean default false) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; v_status public.org_status; v_id uuid; v_recent integer; h uuid;
begin
  select * into k from public.kids where user_id = auth.uid() and status = 'active';
  if k.id is null then raise exception 'not_allowed'; end if;
  v_status := app.org_status(k.organization_id);
  if v_status in ('pending', 'suspended') then raise exception 'organization_not_active'; end if;
  if char_length(btrim(coalesce(p_body, ''))) = 0 then raise exception 'empty_message'; end if;
  select count(*) into v_recent from public.concerns where kid_id = k.id and created_at > now() - interval '1 day';
  if v_recent >= 10 then raise exception 'too_many_messages'; end if;
  insert into public.concerns (organization_id, kid_id, class_id, body, is_anonymous)
  values (k.organization_id, k.id, k.class_id, left(btrim(p_body), 2000), coalesce(p_anonymous, false))
  returning id into v_id;
  -- Says nothing about who or what: a lock screen must never undo anonymity.
  for h in select * from app.concern_handlers(k.organization_id, k.class_id) loop
    perform app.notify(k.organization_id, h, 'concern_new', 'A child needs you', 'Someone has sent a Talk to Someone message.',
                       '/o/' || app.org_slug(k.organization_id) || '/talk', 'urgent');
  end loop;
  return v_id;
end;
$$;

create function public.my_concerns()
returns table (id uuid, body text, is_anonymous boolean, status text, created_at timestamptz, replies bigint)
language sql stable security definer set search_path = ''
as $$
  select c.id, c.body, c.is_anonymous, c.status, c.created_at,
         (select count(*) from public.concern_replies r where r.concern_id = c.id and r.from_staff)
  from public.concerns c join public.kids k on k.id = c.kid_id
  where k.user_id = auth.uid()
  order by c.created_at desc
$$;

create function public.my_concern_replies(p_concern uuid)
returns table (id uuid, from_staff boolean, author text, body text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select r.id, r.from_staff, case when r.from_staff then 'A trusted adult' else 'You' end, r.body, r.created_at
  from public.concern_replies r
  join public.concerns c on c.id = r.concern_id
  join public.kids k on k.id = c.kid_id
  where r.concern_id = p_concern and k.user_id = auth.uid()
  order by r.created_at
$$;

-- Staff inbox. An anonymous child is never named, and their kid id is never returned.
create function public.staff_concerns(p_org uuid)
returns table (id uuid, kid_label text, class_name text, is_anonymous boolean, status text, preview text, created_at timestamptz, updated_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select c.id,
         case when c.is_anonymous then 'Anonymous' else k.first_name || coalesce(' ' || k.last_initial || '.', '') end,
         case when c.is_anonymous then null else cl.name end,
         c.is_anonymous, c.status, left(c.body, 120), c.created_at, c.updated_at
  from public.concerns c
  join public.kids k on k.id = c.kid_id
  left join public.classes cl on cl.id = c.class_id
  where c.organization_id = p_org and app.concern_handler(c.organization_id, c.class_id)
  order by (c.status = 'resolved'), c.created_at desc
$$;

create function public.staff_concern(p_concern uuid)
returns table (id uuid, kid_id uuid, kid_label text, class_name text, is_anonymous boolean, status text, body text, created_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare c public.concerns%rowtype;
begin
  select * into c from public.concerns where concerns.id = p_concern;
  if c.id is null or not app.concern_handler(c.organization_id, c.class_id) then raise exception 'not_allowed'; end if;
  insert into public.concern_access_log (organization_id, concern_id, user_id, action) values (c.organization_id, c.id, auth.uid(), 'opened');
  return query
    select c.id,
           case when c.is_anonymous then null::uuid else c.kid_id end,
           case when c.is_anonymous then 'Anonymous' else k.first_name || coalesce(' ' || k.last_initial || '.', '') end,
           case when c.is_anonymous then null else cl.name end,
           c.is_anonymous, c.status, c.body, c.created_at
    from public.kids k left join public.classes cl on cl.id = c.class_id
    where k.id = c.kid_id;
end;
$$;

create function public.staff_concern_replies(p_concern uuid)
returns table (id uuid, from_staff boolean, author text, body text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare c public.concerns%rowtype;
begin
  select * into c from public.concerns where concerns.id = p_concern;
  if c.id is null or not app.concern_handler(c.organization_id, c.class_id) then raise exception 'not_allowed'; end if;
  return query
    select r.id, r.from_staff,
           case when r.from_staff then coalesce(nullif(p.full_name, ''), 'Staff')
                when c.is_anonymous then 'Anonymous child'
                else (select k.first_name from public.kids k where k.id = c.kid_id) end,
           r.body, r.created_at
    from public.concern_replies r left join public.profiles p on p.id = r.author_id
    where r.concern_id = c.id
    order by r.created_at;
end;
$$;

create function public.reply_to_concern(p_concern uuid, p_body text) returns void
language plpgsql security definer set search_path = ''
as $$
declare c public.concerns%rowtype; v_kid_user uuid; v_is_kid boolean; h uuid;
begin
  select * into c from public.concerns where id = p_concern;
  if c.id is null then raise exception 'not_allowed'; end if;
  select user_id into v_kid_user from public.kids where id = c.kid_id;
  v_is_kid := v_kid_user = auth.uid();
  if not v_is_kid and not app.concern_handler(c.organization_id, c.class_id) then raise exception 'not_allowed'; end if;
  if char_length(btrim(coalesce(p_body, ''))) = 0 then raise exception 'empty_message'; end if;
  insert into public.concern_replies (organization_id, concern_id, author_id, from_staff, body)
  values (c.organization_id, c.id, auth.uid(), not v_is_kid, left(btrim(p_body), 2000));
  if v_is_kid then
    for h in select * from app.concern_handlers(c.organization_id, c.class_id) loop
      perform app.notify(c.organization_id, h, 'concern_reply', 'New Talk to Someone reply', 'A child has replied.',
                         '/o/' || app.org_slug(c.organization_id) || '/talk/' || c.id, 'urgent');
    end loop;
  else
    update public.concerns set status = case when status = 'new' then 'acknowledged' else status end, updated_at = now() where id = c.id;
    perform app.notify(c.organization_id, v_kid_user, 'concern_reply', 'Someone wrote back', 'A trusted adult replied to your message.',
                       '/k/' || app.org_slug(c.organization_id) || '/talk', 'normal');
  end if;
end;
$$;

create function public.set_concern_status(p_concern uuid, p_status text) returns void
language plpgsql security definer set search_path = ''
as $$
declare c public.concerns%rowtype; a uuid;
begin
  select * into c from public.concerns where id = p_concern;
  if c.id is null or not app.concern_handler(c.organization_id, c.class_id) then raise exception 'not_allowed'; end if;
  if p_status not in ('acknowledged', 'in_progress', 'escalated', 'resolved') then raise exception 'bad_status'; end if;
  update public.concerns set status = p_status, updated_at = now() where id = c.id;
  insert into public.concern_access_log (organization_id, concern_id, user_id, action) values (c.organization_id, c.id, auth.uid(), 'status:' || p_status);
  if p_status = 'escalated' and c.status <> 'escalated' then
    for a in select m.user_id from public.memberships m where m.organization_id = c.organization_id and m.role = 'org_admin' and m.status = 'active' loop
      perform app.notify(c.organization_id, a, 'concern_escalated', 'A Talk to Someone message was escalated',
                         'A teacher has passed a message up for you to look at.', '/o/' || app.org_slug(c.organization_id) || '/talk/' || c.id, 'urgent');
    end loop;
  end if;
end;
$$;

create function public.add_concern_note(p_concern uuid, p_body text) returns void
language plpgsql security definer set search_path = ''
as $$
declare c public.concerns%rowtype;
begin
  select * into c from public.concerns where id = p_concern;
  if c.id is null or not app.concern_handler(c.organization_id, c.class_id) then raise exception 'not_allowed'; end if;
  if char_length(btrim(coalesce(p_body, ''))) = 0 then raise exception 'empty_message'; end if;
  insert into public.concern_notes (organization_id, concern_id, author_id, body) values (c.organization_id, c.id, auth.uid(), left(btrim(p_body), 2000));
end;
$$;

create function public.staff_concern_notes(p_concern uuid)
returns table (id uuid, author text, body text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare c public.concerns%rowtype;
begin
  select * into c from public.concerns where concerns.id = p_concern;
  if c.id is null or not app.concern_handler(c.organization_id, c.class_id) then raise exception 'not_allowed'; end if;
  return query select n.id, coalesce(nullif(p.full_name, ''), 'Staff'), n.body, n.created_at
    from public.concern_notes n left join public.profiles p on p.id = n.author_id
    where n.concern_id = c.id order by n.created_at;
end;
$$;

-- ---------------------------------------------------------------------------
-- messages: one thread per kid, visible to every staff member of the club
-- ---------------------------------------------------------------------------

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  kid_id uuid not null,
  author_id uuid references auth.users (id) on delete set null,
  from_staff boolean not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index messages_kid on public.messages (kid_id, created_at);

create function public.send_message(p_body text, p_kid uuid default null) returns void
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; v_staff boolean; h uuid;
begin
  if char_length(btrim(coalesce(p_body, ''))) = 0 then raise exception 'empty_message'; end if;
  if p_kid is null then
    select * into k from public.kids where user_id = auth.uid() and status = 'active';
    if k.id is null then raise exception 'not_allowed'; end if;
    if k.confirmed_at is null then raise exception 'messaging_locked'; end if;
    v_staff := false;
  else
    select * into k from public.kids where id = p_kid and status = 'active';
    if k.id is null or not app.has_org_role(k.organization_id, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
    v_staff := true;
  end if;
  if not app.org_is_writable(k.organization_id) then raise exception 'organization_not_active'; end if;
  insert into public.messages (organization_id, kid_id, author_id, from_staff, body)
  values (k.organization_id, k.id, auth.uid(), v_staff, left(btrim(p_body), 1000));
  if v_staff then
    perform app.notify(k.organization_id, k.user_id, 'message', 'New message', 'Your teacher sent you a message.', '/k/' || app.org_slug(k.organization_id) || '/messages');
  else
    for h in select * from app.concern_handlers(k.organization_id, k.class_id) loop
      perform app.notify(k.organization_id, h, 'message', k.first_name || ' sent a message', null, '/o/' || app.org_slug(k.organization_id) || '/messages/' || k.id);
    end loop;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- lessons, assignments, submissions, events
-- ---------------------------------------------------------------------------

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  class_id uuid,
  title text not null check (char_length(title) between 1 and 120),
  body text not null default '' check (char_length(body) <= 10000),
  memory_verse text check (memory_verse is null or char_length(memory_verse) <= 400),
  lesson_date date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (organization_id, class_id) references public.classes (organization_id, id) on delete cascade
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  class_id uuid,
  title text not null check (char_length(title) between 1 and 120),
  instructions text not null default '' check (char_length(instructions) <= 4000),
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, class_id) references public.classes (organization_id, id) on delete cascade
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  assignment_id uuid not null,
  kid_id uuid not null,
  body text not null check (char_length(body) between 1 and 4000),
  submitted_at timestamptz not null default now(),
  grade integer check (grade is null or grade between 0 and 100),
  feedback text check (feedback is null or char_length(feedback) <= 1000),
  graded_by uuid references auth.users (id) on delete set null,
  graded_at timestamptz,
  unique (assignment_id, kid_id),
  foreign key (organization_id, assignment_id) references public.assignments (organization_id, id) on delete cascade,
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text check (location is null or char_length(location) <= 200),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);
create index events_org_start on public.events (organization_id, starts_at);

-- what a signed-in kid may see: published, for their class or the whole club
create function app.kid_sees(p_org uuid, p_class uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.kids k where k.user_id = auth.uid() and k.status = 'active'
                 and k.organization_id = p_org and (p_class is null or k.class_id = p_class))
$$;

create function public.submit_assignment(p_assignment uuid, p_body text) returns void
language plpgsql security definer set search_path = ''
as $$
declare a public.assignments%rowtype; k public.kids%rowtype; v_sub uuid; h uuid;
begin
  select * into a from public.assignments where id = p_assignment and status = 'published';
  select * into k from public.kids where user_id = auth.uid() and status = 'active';
  if a.id is null or k.id is null or a.organization_id <> k.organization_id or (a.class_id is not null and a.class_id is distinct from k.class_id) then
    raise exception 'not_allowed';
  end if;
  if not app.org_is_writable(k.organization_id) then raise exception 'organization_not_active'; end if;
  if char_length(btrim(coalesce(p_body, ''))) = 0 then raise exception 'empty_message'; end if;
  insert into public.submissions (organization_id, assignment_id, kid_id, body)
  values (k.organization_id, a.id, k.id, left(btrim(p_body), 4000))
  on conflict (assignment_id, kid_id) do update set body = excluded.body, submitted_at = now()
    where public.submissions.graded_at is null
  returning id into v_sub;
  if v_sub is null then raise exception 'already_graded'; end if;
  perform app.award_points(k.id, 'assignment_done', a.id::text);
  for h in select * from app.concern_handlers(k.organization_id, k.class_id) loop
    perform app.notify(k.organization_id, h, 'submission', k.first_name || ' handed in work', a.title, '/o/' || app.org_slug(k.organization_id) || '/assignments/' || a.id);
  end loop;
end;
$$;

create function public.grade_submission(p_submission uuid, p_grade integer, p_feedback text default null) returns void
language plpgsql security definer set search_path = ''
as $$
declare s public.submissions%rowtype; v_user uuid; v_title text;
begin
  select * into s from public.submissions where id = p_submission;
  if s.id is null or not app.has_org_role(s.organization_id, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(s.organization_id) then raise exception 'organization_not_active'; end if;
  if p_grade is null or p_grade < 0 or p_grade > 100 then raise exception 'bad_grade'; end if;
  update public.submissions set grade = p_grade, feedback = left(nullif(btrim(p_feedback), ''), 1000), graded_by = auth.uid(), graded_at = now() where id = s.id;
  select user_id into v_user from public.kids where id = s.kid_id;
  select title into v_title from public.assignments where id = s.assignment_id;
  perform app.notify(s.organization_id, v_user, 'graded', 'Your work has been marked', v_title, '/k/' || app.org_slug(s.organization_id) || '/class');
end;
$$;

-- tell a class when work or a lesson is published
create function app.on_assignment_published() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare u uuid;
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    for u in select k.user_id from public.kids k where k.organization_id = new.organization_id and k.status = 'active'
               and (new.class_id is null or k.class_id = new.class_id) loop
      perform app.notify(new.organization_id, u, 'assignment', 'New class work', new.title, '/k/' || app.org_slug(new.organization_id) || '/class');
    end loop;
  end if;
  return new;
end;
$$;
create trigger assignment_published after insert or update of status on public.assignments
for each row execute function app.on_assignment_published();

-- a star from a teacher shows up as a notification for the kid
create function app.on_star() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.source = 'teacher_star' then
    perform app.notify(new.organization_id, (select user_id from public.kids where id = new.kid_id), 'star', 'You got a star!',
                       coalesce(new.note, 'Your teacher gave you a star.'), '/k/' || app.org_slug(new.organization_id) || '/home');
  end if;
  return new;
end;
$$;
create trigger point_event_star after insert on public.point_events for each row execute function app.on_star();

insert into public.point_rules (organization_id, source, points) values (null, 'assignment_done', 10);

-- "2026-12-24T16:00" typed in a club's own time zone, as a real timestamp
create function public.club_local_to_utc(p_local text, p_tz text) returns timestamptz
language sql stable set search_path = ''
as $$
  select case when exists (select 1 from pg_catalog.pg_timezone_names where name = p_tz)
              then (p_local::timestamp at time zone p_tz) end
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.notifications enable row level security;
alter table public.concerns enable row level security;
alter table public.concern_replies enable row level security;
alter table public.concern_notes enable row level security;
alter table public.concern_access_log enable row level security;
alter table public.messages enable row level security;
alter table public.lessons enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.events enable row level security;

revoke all on public.notifications, public.concerns, public.concern_replies, public.concern_notes, public.concern_access_log,
  public.messages, public.lessons, public.assignments, public.submissions, public.events from anon;
-- Talk to Someone: no direct access of any kind, for any signed-in user.
revoke all on public.concerns, public.concern_replies, public.concern_notes, public.concern_access_log from authenticated;
revoke insert, update, delete on public.notifications, public.messages, public.submissions from authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy notifications_own on public.notifications for select to authenticated using (recipient_id = (select auth.uid()));
create policy notifications_mark_read on public.notifications for update to authenticated
  using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));

create policy messages_read on public.messages for select to authenticated using (
  app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[])
  or exists (select 1 from public.kids k where k.id = messages.kid_id and k.user_id = (select auth.uid()))
);

create policy lessons_read on public.lessons for select to authenticated using (
  app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[])
  or (status = 'published' and app.kid_sees(organization_id, class_id))
);
create policy lessons_insert on public.lessons for insert to authenticated with check (
  app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy lessons_update on public.lessons for update to authenticated
  using (app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id))
  with check (app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id));

create policy assignments_read on public.assignments for select to authenticated using (
  app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[])
  or (status in ('published', 'closed') and app.kid_sees(organization_id, class_id))
);
create policy assignments_insert on public.assignments for insert to authenticated with check (
  app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy assignments_update on public.assignments for update to authenticated
  using (app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id))
  with check (app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[]) and app.org_is_writable(organization_id));

create policy submissions_read on public.submissions for select to authenticated using (app.can_see_kid(organization_id, kid_id));

create policy events_read on public.events for select to authenticated using (
  (select app.is_platform_admin()) or app.is_org_member(organization_id)
  or exists (select 1 from public.guardians g where g.organization_id = events.organization_id and g.user_id = (select auth.uid()))
);
create policy events_insert on public.events for insert to authenticated with check (
  app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_is_writable(organization_id)
);
create policy events_update on public.events for update to authenticated
  using (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_is_writable(organization_id))
  with check (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_is_writable(organization_id));
create policy events_delete on public.events for delete to authenticated
  using (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_is_writable(organization_id));

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
grant execute on function app.can_see_kid(uuid, uuid), app.kid_sees(uuid, uuid) to authenticated;

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
  public.club_local_to_utc(text, text)
to authenticated;

grant execute on all functions in schema app to service_role;
grant execute on all functions in schema public to service_role;
