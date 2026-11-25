-- Parents: Take-Home cards on lessons, guardian read access to their child's
-- lessons, a weekly report per kid, and a Sunday "your report is ready" alert.

alter table public.lessons
  add column take_home_talk text check (take_home_talk is null or char_length(take_home_talk) <= 300),
  add column take_home_do text check (take_home_do is null or char_length(take_home_do) <= 300),
  add column take_home_pray text check (take_home_pray is null or char_length(take_home_pray) <= 300);

-- a parent sees a published lesson meant for one of their children (their class, or the whole club)
create function app.guardian_sees(p_org uuid, p_class uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.guardians g join public.kids k on k.id = g.kid_id
    where g.user_id = auth.uid() and k.organization_id = p_org and k.status = 'active'
      and (p_class is null or k.class_id = p_class))
$$;

drop policy lessons_read on public.lessons;
create policy lessons_read on public.lessons for select to authenticated using (
  app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[])
  or (status = 'published' and (app.kid_sees(organization_id, class_id) or app.guardian_sees(organization_id, class_id)))
);

-- One week (Monday to Sunday, in the club's own time zone) of a kid's life at the club.
create function public.kid_report(p_kid uuid, p_week date default null) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  k public.kids%rowtype; o public.organizations%rowtype;
  v_ws date; v_from timestamptz; v_to timestamptz; v_total integer; v_lvl public.levels; v_next public.levels;
begin
  select * into k from public.kids where id = p_kid and status = 'active';
  if k.id is null or not app.can_see_kid(k.organization_id, k.id) then raise exception 'not_allowed'; end if;
  select * into o from public.organizations where id = k.organization_id;
  v_ws := date_trunc('week', coalesce(p_week, app.org_today(o.id))::timestamp)::date;
  v_from := v_ws::timestamp at time zone o.timezone;
  v_to := (v_ws + 7)::timestamp at time zone o.timezone;
  select coalesce(points_total, 0) into v_total from public.kid_stats where kid_id = k.id;
  v_total := coalesce(v_total, 0);
  v_lvl := app.level_of(v_total);
  select * into v_next from public.levels where min_points > v_total order by min_points limit 1;
  return jsonb_build_object(
    'kid', jsonb_build_object('id', k.id, 'first_name', k.first_name, 'last_initial', k.last_initial,
                              'class', (select name from public.classes where id = k.class_id)),
    'club', jsonb_build_object('name', o.name, 'slug', o.slug, 'faith_mode', o.faith_mode),
    'week_start', v_ws, 'week_end', v_ws + 6,
    'points_week', (select coalesce(sum(points), 0) from public.point_events where kid_id = k.id and at >= v_from and at < v_to),
    'stars_week', (select count(*) from public.point_events where kid_id = k.id and source = 'teacher_star' and at >= v_from and at < v_to),
    'visits_week', (select count(*) from public.activity_days where kid_id = k.id and day >= v_ws and day < v_ws + 7),
    'checkins_week', (select count(*) from public.attendance where kid_id = k.id and day >= v_ws and day < v_ws + 7),
    'points_total', v_total,
    'streak_current', (select coalesce(streak_current, 0) from public.kid_stats where kid_id = k.id),
    'streak_best', (select coalesce(streak_best, 0) from public.kid_stats where kid_id = k.id),
    'level', v_lvl.name,
    'next_level', v_next.name,
    'points_to_next', case when v_next.code is null then null else v_next.min_points - v_total end,
    'badges_week', (select coalesce(jsonb_agg(jsonb_build_object('name', b.name, 'icon', b.icon) order by kb.earned_at), '[]'::jsonb)
                    from public.kid_badges kb join public.badges b on b.id = kb.badge_id
                    where kb.kid_id = k.id and kb.earned_at >= v_from and kb.earned_at < v_to),
    'work', (select coalesce(jsonb_agg(jsonb_build_object('title', a.title, 'submitted_at', s.submitted_at, 'grade', s.grade, 'feedback', s.feedback) order by s.submitted_at), '[]'::jsonb)
             from public.submissions s join public.assignments a on a.id = s.assignment_id
             where s.kid_id = k.id and ((s.submitted_at >= v_from and s.submitted_at < v_to) or (s.graded_at >= v_from and s.graded_at < v_to))),
    'lessons', (select coalesce(jsonb_agg(jsonb_build_object('id', l.id, 'title', l.title, 'memory_verse', case when o.faith_mode then l.memory_verse end,
                                                            'talk', l.take_home_talk, 'do', l.take_home_do, 'pray', l.take_home_pray) order by coalesce(l.lesson_date, l.created_at::date)), '[]'::jsonb)
                from public.lessons l
                where l.organization_id = k.organization_id and l.status = 'published'
                  and (l.class_id is null or l.class_id = k.class_id)
                  and coalesce(l.lesson_date, (l.created_at at time zone o.timezone)::date) >= v_ws
                  and coalesce(l.lesson_date, (l.created_at at time zone o.timezone)::date) < v_ws + 7),
    'certificates_week', (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'title', c.title) order by c.issued_at), '[]'::jsonb)
                          from public.certificates c where c.kid_id = k.id and c.issued_at >= v_from and c.issued_at < v_to)
  );
end;
$$;

-- Sunday evening: tell each parent their child's week is ready to read.
create function app.weekly_report_notify() returns integer
language plpgsql security definer set search_path = ''
as $$
declare r record; n integer := 0;
begin
  for r in
    select g.user_id, k.id as kid_id, k.first_name, k.organization_id, o.name as club
    from public.guardians g
    join public.kids k on k.id = g.kid_id and k.status = 'active'
    join public.organizations o on o.id = k.organization_id and o.status in ('active', 'grace')
  loop
    perform app.notify(r.organization_id, r.user_id, 'weekly_report', r.first_name || '''s week at ' || r.club,
                       'Points, trophies, class work and this week''s Take-Home.', '/p/kids/' || r.kid_id || '/report');
    n := n + 1;
  end loop;
  return n;
end;
$$;

select cron.schedule('champzz-weekly-report', '0 17 * * 0', 'select app.weekly_report_notify()');

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
grant execute on function app.can_see_kid(uuid, uuid), app.kid_sees(uuid, uuid), app.guardian_sees(uuid, uuid) to authenticated;

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
  public.kid_report(uuid, date)
to authenticated;

grant execute on all functions in schema app to service_role;
grant execute on all functions in schema public to service_role;
