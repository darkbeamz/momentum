-- ============================================================================
--  Momentum — GTD Tasks & Projects
--  Supabase schema + Row Level Security + Realtime
--  Run this in:  Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ============================================================================
--  TABLES
-- ============================================================================

-- Profiles (1:1 with auth.users) ---------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Workspaces (a "team"; everyone also gets a personal one) --------------------
create table if not exists public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  is_personal boolean not null default false,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Workspace membership -------------------------------------------------------
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  -- FK points at profiles (which itself FKs auth.users) so PostgREST can embed member profiles
  user_id      uuid not null references public.profiles(id) on delete cascade,
  role         text not null default 'member' check (role in ('owner','admin','member')),
  created_at   timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- Pending invites (by email) -------------------------------------------------
create table if not exists public.invites (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email        text not null,
  role         text not null default 'member',
  invited_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (workspace_id, email)
);

-- Contexts (@home, @calls, @errands ...) -------------------------------------
create table if not exists public.contexts (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name         text not null,
  color        text not null default '#4f46e5',
  created_at   timestamptz not null default now()
);

-- Projects -------------------------------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'active' check (status in ('active','someday','done','archived')),
  color        text not null default '#4f46e5',
  owner_id     uuid not null references auth.users(id) on delete cascade,
  position     double precision not null default 0,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

-- Tasks (also used for subtasks via parent_id) -------------------------------
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id   uuid references public.projects(id) on delete set null,
  parent_id    uuid references public.tasks(id) on delete cascade,
  title        text not null,
  notes        text,
  status       text not null default 'inbox'
                 check (status in ('inbox','next','waiting','scheduled','someday','done')),
  context_id   uuid references public.contexts(id) on delete set null,
  assignee_id  uuid references auth.users(id) on delete set null,
  tags         text[] not null default '{}',
  due_date     date,
  remind_at    timestamptz,
  energy       text check (energy in ('low','medium','high')),
  priority     int not null default 0 check (priority between 0 and 3),
  position     double precision not null default 0,
  created_by   uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists tasks_workspace_idx on public.tasks(workspace_id);
create index if not exists tasks_project_idx   on public.tasks(project_id);
create index if not exists tasks_parent_idx    on public.tasks(parent_id);
create index if not exists tasks_status_idx    on public.tasks(workspace_id, status);

-- Comments -------------------------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  -- FK points at profiles so PostgREST can embed the comment author
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_task_idx on public.comments(task_id);

-- ============================================================================
--  HELPER: membership check (security definer to avoid RLS recursion)
-- ============================================================================
create or replace function public.is_member(ws uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid()
  );
$$;

-- ============================================================================
--  NEW USER → profile + personal workspace + membership
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare ws_id uuid;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;

  insert into public.workspaces (name, is_personal, owner_id)
  values ('My Tasks', true, new.id)
  returning id into ws_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws_id, new.id, 'owner');

  -- auto-join any workspace they were invited to
  insert into public.workspace_members (workspace_id, user_id, role)
  select i.workspace_id, new.id, i.role from public.invites i where lower(i.email) = lower(new.email)
  on conflict do nothing;
  delete from public.invites where lower(email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
--  TASK COMPLETION timestamp
-- ============================================================================
create or replace function public.touch_completed()
returns trigger language plpgsql as $$
begin
  if new.status = 'done' and (old.status is distinct from 'done') then new.completed_at := now();
  elsif new.status <> 'done' then new.completed_at := null;
  end if;
  return new;
end; $$;
drop trigger if exists tasks_completed on public.tasks;
create trigger tasks_completed before update on public.tasks
  for each row execute function public.touch_completed();

-- ============================================================================
--  ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.workspaces         enable row level security;
alter table public.workspace_members  enable row level security;
alter table public.invites            enable row level security;
alter table public.contexts           enable row level security;
alter table public.projects           enable row level security;
alter table public.tasks              enable row level security;
alter table public.comments           enable row level security;

-- Profiles: anyone signed in can read (to show names/avatars); edit only self
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_upsert on public.profiles;
create policy profiles_upsert on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid());

-- Workspaces
drop policy if exists ws_read on public.workspaces;
create policy ws_read on public.workspaces for select to authenticated using (public.is_member(id) or owner_id = auth.uid());
drop policy if exists ws_insert on public.workspaces;
create policy ws_insert on public.workspaces for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists ws_update on public.workspaces;
create policy ws_update on public.workspaces for update to authenticated using (owner_id = auth.uid());
drop policy if exists ws_delete on public.workspaces;
create policy ws_delete on public.workspaces for delete to authenticated using (owner_id = auth.uid() and not is_personal);

-- Members
drop policy if exists wm_read on public.workspace_members;
create policy wm_read on public.workspace_members for select to authenticated using (public.is_member(workspace_id));
drop policy if exists wm_insert on public.workspace_members;
create policy wm_insert on public.workspace_members for insert to authenticated
  with check (
    -- workspace owner may add members
    exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
    -- or a user may self-join a workspace they were explicitly invited to
    or (user_id = auth.uid() and exists (
          select 1 from public.invites i join public.profiles p on lower(p.email) = lower(i.email)
          where i.workspace_id = workspace_id and p.id = auth.uid()))
  );
drop policy if exists wm_delete on public.workspace_members;
create policy wm_delete on public.workspace_members for delete to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));

-- Invites
drop policy if exists inv_read on public.invites;
create policy inv_read on public.invites for select to authenticated using (public.is_member(workspace_id));
drop policy if exists inv_write on public.invites;
create policy inv_write on public.invites for insert to authenticated with check (public.is_member(workspace_id));
drop policy if exists inv_delete on public.invites;
create policy inv_delete on public.invites for delete to authenticated using (public.is_member(workspace_id));

-- Generic membership policies for content tables
drop policy if exists ctx_all on public.contexts;
create policy ctx_all on public.contexts for all to authenticated
  using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));

drop policy if exists proj_all on public.projects;
create policy proj_all on public.projects for all to authenticated
  using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));

drop policy if exists task_all on public.tasks;
create policy task_all on public.tasks for all to authenticated
  using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));

drop policy if exists comment_read on public.comments;
create policy comment_read on public.comments for select to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and public.is_member(t.workspace_id)));
drop policy if exists comment_write on public.comments;
create policy comment_write on public.comments for insert to authenticated
  with check (author_id = auth.uid() and exists (select 1 from public.tasks t where t.id = task_id and public.is_member(t.workspace_id)));
drop policy if exists comment_delete on public.comments;
create policy comment_delete on public.comments for delete to authenticated using (author_id = auth.uid());

-- ============================================================================
--  REALTIME  (broadcast row changes to subscribed clients)
-- ============================================================================
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

do $$
declare t text;
begin
  foreach t in array array['tasks','projects','comments','contexts','workspace_members'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- Done. ✅
