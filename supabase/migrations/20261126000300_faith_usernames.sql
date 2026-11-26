-- Kid usernames stay anonymous (never the child's name) and unisex. Faith-mode
-- clubs get words from Scripture's own imagery; other clubs keep the animals.
-- Same shape as before (word-word-NN), so the username check is unchanged.
create or replace function app.new_username(p_org uuid) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  faith_words constant text[] := array['faithful','joyful','blessed','gracious','humble','gentle','hopeful','peaceful',
                                       'radiant','steadfast','loyal','mighty','cheerful','shining','fearless','thankful'];
  faith_things constant text[] := array['lamp','dove','ark','star','light','anchor','harp','olive',
                                        'cedar','crown','shield','rock','lamb','sparrow','river','trumpet'];
  adjectives constant text[] := array['brave','swift','happy','bright','bold','clever','kind','mighty','sunny','zippy','lucky','super','jolly','quick','calm','proud'];
  animals constant text[] := array['lion','eagle','tiger','zebra','falcon','panda','otter','fox','dolphin','rhino','cheetah','koala','hawk','giraffe','leopard','turtle'];
  v_faith boolean;
  a text[];
  n text[];
  v text;
  b bytea;
begin
  select faith_mode into v_faith from public.organizations where id = p_org;
  if coalesce(v_faith, false) then a := faith_words; n := faith_things; else a := adjectives; n := animals; end if;
  for attempt in 1 .. 50 loop
    b := extensions.gen_random_bytes(3);
    v := a[(get_byte(b, 0) % 16) + 1] || '-' || n[(get_byte(b, 1) % 16) + 1] || '-'
         || lpad(((get_byte(b, 2) % 90) + 10)::text, 2, '0');
    if not exists (select 1 from public.kids where organization_id = p_org and username = v) then
      return v;
    end if;
  end loop;
  raise exception 'username_space_exhausted';
end;
$$;
revoke execute on function app.new_username(uuid) from public, anon, authenticated;
