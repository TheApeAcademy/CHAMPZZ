-- Server-only entry points. The functions that hold the real logic live in the
-- private `app` schema, which the API does not expose. These thin wrappers
-- are in `public` so the server (service role) can reach them over the API,
-- and EXECUTE is granted to service_role only. supabase/tests pins that anon
-- and authenticated can call none of them.

create function public.svc_register_kid(
  p_parent uuid, p_join_code text, p_first_name text, p_last_initial text,
  p_class_id uuid, p_pin text, p_policy_version text, p_scopes jsonb
) returns table (kid_id uuid, organization_id uuid, username text, status public.kid_status)
language sql security definer set search_path = ''
as $$ select * from app.register_kid(p_parent, p_join_code, p_first_name, p_last_initial, p_class_id, p_pin, p_policy_version, p_scopes) $$;

create function public.svc_attach_kid_user(p_kid uuid, p_user uuid) returns void
language sql security definer set search_path = ''
as $$ select app.attach_kid_user(p_kid, p_user) $$;

create function public.svc_discard_kid(p_kid uuid) returns void
language sql security definer set search_path = ''
as $$ select app.discard_kid(p_kid) $$;

create function public.svc_kid_verify_pin(p_slug text, p_username text, p_pin text, p_ip text)
returns table (result text, user_id uuid, locked_until timestamptz)
language sql security definer set search_path = ''
as $$ select * from app.kid_verify_pin(p_slug, p_username, p_pin, p_ip) $$;

create function public.svc_apply_payment(
  p_org uuid, p_plan uuid, p_interval text, p_currency text, p_amount_minor bigint,
  p_period_end timestamptz, p_provider text, p_method text, p_ref text,
  p_approved_by uuid default null, p_note text default null
) returns uuid
language sql security definer set search_path = ''
as $$ select app.apply_payment(p_org, p_plan, p_interval, p_currency, p_amount_minor, p_period_end, p_provider, p_method, p_ref, p_approved_by, p_note) $$;

create function public.svc_lifecycle_tick(p_now timestamptz default now()) returns integer
language sql security definer set search_path = ''
as $$ select app.lifecycle_tick(p_now) $$;

revoke execute on function
  public.svc_register_kid(uuid, text, text, text, uuid, text, text, jsonb),
  public.svc_attach_kid_user(uuid, uuid),
  public.svc_discard_kid(uuid),
  public.svc_kid_verify_pin(text, text, text, text),
  public.svc_apply_payment(uuid, uuid, text, text, bigint, timestamptz, text, text, text, uuid, text),
  public.svc_lifecycle_tick(timestamptz)
from public, anon, authenticated;

grant execute on function
  public.svc_register_kid(uuid, text, text, text, uuid, text, text, jsonb),
  public.svc_attach_kid_user(uuid, uuid),
  public.svc_discard_kid(uuid),
  public.svc_kid_verify_pin(text, text, text, text),
  public.svc_apply_payment(uuid, uuid, text, text, bigint, timestamptz, text, text, text, uuid, text),
  public.svc_lifecycle_tick(timestamptz)
to service_role;
