-- Step 1: project galleries. Safe to run more than once.
alter table projects add column if not exists client text not null default '';
alter table projects add column if not exists result text not null default '';
alter table projects add column if not exists quote text not null default '';
alter table projects add column if not exists quote_by text not null default '';
alter table projects add column if not exists cover_id bigint;

create table if not exists project_media(
  id bigint generated always as identity primary key,
  project_id bigint not null references projects(id) on delete cascade,
  type text not null check(type in('image','video')),
  path text not null,
  thumb_path text,
  caption text not null default '' check(char_length(caption)<=300),
  position int not null default 0,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now());
create index if not exists project_media_project_idx on project_media(project_id,position);
alter table project_media enable row level security;
drop policy if exists "read project_media" on project_media;
drop policy if exists "admin project_media" on project_media;
create policy "read project_media" on project_media for select using(true);
create policy "admin project_media" on project_media for all to authenticated using(true) with check(true);

-- Carry over existing single-file projects as their first gallery item.
insert into project_media(project_id,type,path,position)
select p.id,p.media_type,p.media_path,0 from projects p
where p.media_path is not null and p.media_type is not null
  and not exists(select 1 from project_media m where m.project_id=p.id);
update projects p set cover_id=(select min(m.id) from project_media m where m.project_id=p.id) where p.cover_id is null;

-- Live updates for the new table.
do $$ begin
  begin alter publication supabase_realtime add table public.project_media;
  exception when duplicate_object then null; end;
end $$;
