-- Ten demo clubs for previews and the club directory. Invented, never billed,
-- no members and no kids. Kept out of supabase/migrations on purpose so the test
-- database stays clean; run once against a project. Remove them with:
--   delete from public.organizations where demo;

do $$
declare o uuid;
begin
  insert into public.organizations (slug, name, kind, status, country, timezone, billing_currency, faith_mode, demo)
  values ('grace-kids-lekki', 'Grace Kids Lekki', 'church', 'active', 'NG', 'Africa/Lagos', 'NGN', true, true) returning id into o;
  insert into public.org_branding (organization_id, primary_color, tagline, motto, city, listed) values (o, '#2F5BFF', 'Sunday school, Bible quiz nights and a whole lot of joy for ages 4 to 12.', 'Little lights, shining bright.', 'Lagos', true);
  insert into public.club_posts (organization_id, title, body, created_at) values
    (o, 'Bible Quiz night is back', 'Road to Champ returns this Friday at 5pm. Teams of four, three rounds, one trophy. Parents are welcome to watch from the back.', now() - interval '1 days' - interval '16 hours'),
    (o, 'Memory verse for November', 'Psalm 119:105: Your word is a lamp to my feet and a light to my path. Kids who record it in Record-a-verse get a gold star from their teacher.', now() - interval '3 days' - interval '16 hours');
  insert into public.organizations (slug, name, kind, status, country, timezone, billing_currency, faith_mode, demo)
  values ('ikeja-young-champions', 'Ikeja Young Champions FC', 'club', 'active', 'NG', 'Africa/Lagos', 'NGN', false, true) returning id into o;
  insert into public.org_branding (organization_id, primary_color, tagline, motto, city, listed) values (o, '#1E6B47', 'Grassroots football for boys and girls aged 6 to 14. Train hard, play fair.', 'Play hard. Play fair. Play together.', 'Lagos', true);
  insert into public.club_posts (organization_id, title, body, created_at) values
    (o, 'U10 friendly on Saturday', 'Our U10s play Surulere Stars at 9am. Kit check at 8:30. Bring water and shin pads.', now() - interval '1 days' - interval '21 hours'),
    (o, 'New training times', 'From December, training moves to Tuesdays and Thursdays, 4pm to 5:30pm, at the Ikeja field.', now() - interval '3 days' - interval '21 hours');
  insert into public.organizations (slug, name, kind, status, country, timezone, billing_currency, faith_mode, demo)
  values ('abuja-code-cubs', 'Abuja Code Cubs', 'club', 'active', 'NG', 'Africa/Lagos', 'NGN', false, true) returning id into o;
  insert into public.org_branding (organization_id, primary_color, tagline, motto, city, listed) values (o, '#7D2196', 'Coding, robots and games for curious kids aged 8 to 13.', 'Break it, fix it, build it better.', 'Abuja', true);
  insert into public.club_posts (organization_id, title, body, created_at) values
    (o, 'Scratch game jam', 'Teams of two have three weeks to build a game about saving water. Demo day is the last Saturday of the month.', now() - interval '1 days' - interval '15 hours'),
    (o, 'Robot kits have arrived', 'Thanks to our parents'' fundraiser we now have 12 robot kits. Every class gets a turn starting next week.', now() - interval '3 days' - interval '15 hours');
  insert into public.organizations (slug, name, kind, status, country, timezone, billing_currency, faith_mode, demo)
  values ('living-waters-junior-church', 'Living Waters Junior Church', 'church', 'active', 'NG', 'Africa/Lagos', 'NGN', true, true) returning id into o;
  insert into public.org_branding (organization_id, primary_color, tagline, motto, city, listed) values (o, '#0E7490', 'Junior church for ages 3 to 13, every Sunday at 9am.', 'Rooted in the Word, growing in love.', 'Port Harcourt', true);
  insert into public.club_posts (organization_id, title, body, created_at) values
    (o, 'Christmas play auditions', 'Auditions for this year''s Christmas play are after service on Sunday. Every child who wants a part gets one.', now() - interval '1 days' - interval '27 hours'),
    (o, 'Thank you, volunteers', 'A big thank you to the twelve parents who helped with the harvest picnic. The kids are still talking about the sack race.', now() - interval '3 days' - interval '27 hours');
  insert into public.organizations (slug, name, kind, status, country, timezone, billing_currency, faith_mode, demo)
  values ('kano-readers-club', 'Kano Readers Club', 'club', 'active', 'NG', 'Africa/Lagos', 'NGN', false, true) returning id into o;
  insert into public.org_branding (organization_id, primary_color, tagline, motto, city, listed) values (o, '#B45309', 'A reading club where every child finds a book they love. Ages 6 to 12.', 'Read a little, dream a lot.', 'Kano', true);
  insert into public.club_posts (organization_id, title, body, created_at) values
    (o, 'Reading challenge results', 'Our club read 412 books this term. The top class gets to pick next term''s class novel.', now() - interval '1 days' - interval '17 hours'),
    (o, 'Library day', 'Bring back last month''s books on Saturday and swap for new ones. New arrivals include adventure and science titles.', now() - interval '3 days' - interval '17 hours');
  insert into public.organizations (slug, name, kind, status, country, timezone, billing_currency, faith_mode, demo)
  values ('ibadan-little-scientists', 'Ibadan Little Scientists', 'school', 'active', 'NG', 'Africa/Lagos', 'NGN', false, true) returning id into o;
  insert into public.org_branding (organization_id, primary_color, tagline, motto, city, listed) values (o, '#DC2626', 'Hands-on science after school: experiments, nature walks and big questions.', 'Ask why. Then find out.', 'Ibadan', true);
  insert into public.club_posts (organization_id, title, body, created_at) values
    (o, 'Volcano week', 'This week every group builds a working volcano. Old clothes are recommended.', now() - interval '1 days' - interval '24 hours'),
    (o, 'Nature walk', 'We walk the botanical garden next Saturday to collect leaves for our class book.', now() - interval '3 days' - interval '24 hours');
  insert into public.organizations (slug, name, kind, status, country, timezone, billing_currency, faith_mode, demo)
  values ('hope-chapel-kids-london', 'Hope Chapel Kids', 'church', 'active', 'GB', 'Europe/London', 'GBP', true, true) returning id into o;
  insert into public.org_branding (organization_id, primary_color, tagline, motto, city, listed) values (o, '#C13BFF', 'Kids'' church for ages 5 to 11 in south London, every Sunday at 10:30.', 'Known, loved and full of hope.', 'London', true);
  insert into public.club_posts (organization_id, title, body, created_at) values
    (o, 'Advent calendar starts Monday', 'Every day in December the kids open a short Bible story and a challenge in Champ Town.', now() - interval '1 days' - interval '23 hours'),
    (o, 'Holiday club sign-ups', 'Our holiday club runs 27 to 29 December. Parents can register through the Clubhouse page.', now() - interval '3 days' - interval '23 hours');
  insert into public.organizations (slug, name, kind, status, country, timezone, billing_currency, faith_mode, demo)
  values ('manchester-mini-chess', 'Manchester Mini Chess', 'club', 'active', 'GB', 'Europe/London', 'GBP', false, true) returning id into o;
  insert into public.org_branding (organization_id, primary_color, tagline, motto, city, listed) values (o, '#0B1026', 'Chess for beginners and young masters, ages 6 to 14.', 'Think two moves ahead.', 'Manchester', true);
  insert into public.club_posts (organization_id, title, body, created_at) values
    (o, 'Winter tournament', 'Our winter tournament is on 14 December. Every player plays five games and every player gets a certificate.', now() - interval '1 days' - interval '21 hours'),
    (o, 'Puzzle of the week', 'White to move and win in two. Bring your answer to Thursday club for a bonus star.', now() - interval '3 days' - interval '21 hours');
  insert into public.organizations (slug, name, kind, status, country, timezone, billing_currency, faith_mode, demo)
  values ('accra-joy-dance-crew', 'Accra Joy Dance Crew', 'club', 'active', 'GH', 'Africa/Accra', 'USD', false, true) returning id into o;
  insert into public.org_branding (organization_id, primary_color, tagline, motto, city, listed) values (o, '#FF5A3C', 'Dance, drumming and performance for kids aged 7 to 15.', 'Feel the beat, find your feet.', 'Accra', true);
  insert into public.club_posts (organization_id, title, body, created_at) values
    (o, 'End of year showcase', 'Our showcase is on 20 December at 4pm. Families are welcome, and the crew has been practising for weeks.', now() - interval '1 days' - interval '20 hours'),
    (o, 'New drumming class', 'A beginners'' drumming class starts in January for ages 7 to 10.', now() - interval '3 days' - interval '20 hours');
  insert into public.organizations (slug, name, kind, status, country, timezone, billing_currency, faith_mode, demo)
  values ('nairobi-faith-explorers', 'Nairobi Faith Explorers', 'church', 'active', 'KE', 'Africa/Nairobi', 'USD', true, true) returning id into o;
  insert into public.org_branding (organization_id, primary_color, tagline, motto, city, listed) values (o, '#F2B33D', 'A children''s ministry exploring the whole Bible, one adventure at a time.', 'Explore the Word, discover the world.', 'Nairobi', true);
  insert into public.club_posts (organization_id, title, body, created_at) values
    (o, 'Genesis Journey begins', 'This term our classes walk through Genesis with the Faith Quest lessons, from Creation to Joseph.', now() - interval '1 days' - interval '23 hours'),
    (o, 'Prayer walk', 'Our kids prayed for a different country every day this month using Pray for the World. Ask your child which one was their favourite.', now() - interval '3 days' - interval '23 hours');
end
$$;
