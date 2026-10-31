-- Run once to enable live updates (safe to run again).
do $$ declare t text; begin
  foreach t in array array['settings','services','projects','enquiries'] loop
    begin execute format('alter publication supabase_realtime add table public.%I',t);
    exception when duplicate_object then null; end;
  end loop;
end $$;
