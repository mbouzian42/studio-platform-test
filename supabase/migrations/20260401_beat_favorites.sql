-- Beat favorites table
create table if not exists public.beat_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  beat_id uuid not null references public.beats(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, beat_id)
);

-- Index for quick lookups
create index if not exists idx_beat_favorites_user on public.beat_favorites(user_id);
create index if not exists idx_beat_favorites_beat on public.beat_favorites(beat_id);

-- RLS
alter table public.beat_favorites enable row level security;

-- Users can read their own favorites
create policy "Users can read own favorites"
  on public.beat_favorites for select
  using (auth.uid() = user_id);

-- Users can insert their own favorites
create policy "Users can add favorites"
  on public.beat_favorites for insert
  with check (auth.uid() = user_id);

-- Users can delete their own favorites
create policy "Users can remove favorites"
  on public.beat_favorites for delete
  using (auth.uid() = user_id);
