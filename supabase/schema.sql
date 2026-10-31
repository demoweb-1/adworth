-- AdWorth schema. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
create table if not exists settings(id int primary key default 1 check(id=1),headline text,tagline text,email text,whatsapp text,wa_message text,socials jsonb not null default '{}'::jsonb);
create table if not exists services(id bigint generated always as identity primary key,title text not null,description text not null default '',position int not null default 0);
create table if not exists projects(id bigint generated always as identity primary key,title text not null,category text not null,media_path text,media_type text check(media_type in('image','video')),position int not null default 0,created_at timestamptz not null default now());
create table if not exists enquiries(id bigint generated always as identity primary key,name text not null check(char_length(name) between 1 and 120),email text not null check(char_length(email) between 3 and 200),service text check(char_length(service)<=120),message text not null check(char_length(message) between 1 and 4000),status text not null default 'new' check(status in('new','done')),created_at timestamptz not null default now());
alter table settings enable row level security;alter table services enable row level security;alter table projects enable row level security;alter table enquiries enable row level security;
-- Public can read site content; only signed-in admins can change it.
create policy "read settings" on settings for select using(true);create policy "read services" on services for select using(true);create policy "read projects" on projects for select using(true);
create policy "admin settings" on settings for all to authenticated using(true) with check(true);
create policy "admin services" on services for all to authenticated using(true) with check(true);
create policy "admin projects" on projects for all to authenticated using(true) with check(true);
-- Visitors can only send an enquiry; only admins can read or manage them.
create policy "send enquiry" on enquiries for insert to anon,authenticated with check(status='new');
create policy "admin enquiries" on enquiries for all to authenticated using(true) with check(true);
-- Media bucket: public read, admin upload.
insert into storage.buckets(id,name,public) values('media','media',true) on conflict(id) do nothing;
create policy "media read" on storage.objects for select using(bucket_id='media');
create policy "media write" on storage.objects for insert to authenticated with check(bucket_id='media');
create policy "media update" on storage.objects for update to authenticated using(bucket_id='media');
create policy "media delete" on storage.objects for delete to authenticated using(bucket_id='media');
-- Starting content.
insert into settings(id,headline,tagline,email,wa_message) values(1,'Growth you can see.','AdWorth is a digital marketing agency. Video, design, social and web, built to grow your presence.','hello@adworth.example','Hi AdWorth, I would like to discuss a project.') on conflict(id) do nothing;
insert into services(title,description,position) values('Videography','Brand films, reels and product shoots, planned and shot to stop the scroll.',0),('Video Editing','Tight cuts, sound and motion for ads, shorts and long-form.',1),('Posters & Design','Posters, ads and visual identity with a clear point of view.',2),('Social Media Management','Strategy, content calendars, posting and community, handled end to end.',3),('Website Development','Fast, beautiful websites that turn attention into enquiries.',4);

-- Live updates (Supabase Realtime).
do $$ declare t text; begin
  foreach t in array array['settings','services','projects','enquiries'] loop
    begin execute format('alter publication supabase_realtime add table public.%I',t);
    exception when duplicate_object then null; end;
  end loop;
end $$;
