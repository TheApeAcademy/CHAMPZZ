-- Run the org lifecycle job (active -> grace -> read_only) every day at
-- 00:15 UTC (01:15 in Lagos). pg_cron ships with Supabase.
create extension if not exists pg_cron;

select cron.schedule('champzz-lifecycle-tick', '15 0 * * *', $$select app.lifecycle_tick()$$);
