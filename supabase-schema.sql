create table if not exists public.site_settings (
  id text primary key,
  shop_name text not null,
  whatsapp_number text not null,
  default_visibility text not null default 'Available',
  festival_season_mode text not null default 'On',
  updated_at timestamp with time zone default now()
);

create table if not exists public.murtis (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  height text,
  material text,
  price numeric,
  status text not null default 'Available',
  featured boolean default false,
  description text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  murti_id uuid references public.murtis(id) on delete set null,
  customer_name text,
  phone text,
  message text,
  source text default 'WhatsApp',
  status text default 'New',
  created_at timestamp with time zone default now()
);

insert into public.site_settings (
  id,
  shop_name,
  whatsapp_number,
  default_visibility,
  festival_season_mode
) values (
  'main',
  'Bhalachandra Ganesh Kala Murti',
  '+91 89752 17511',
  'Available',
  'On'
) on conflict (id) do nothing;

alter table public.site_settings enable row level security;
alter table public.murtis enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Public can read visible murtis" on public.murtis;
create policy "Public can read visible murtis"
  on public.murtis for select
  using (status <> 'Hidden');

drop policy if exists "Public can create inquiries" on public.inquiries;
create policy "Public can create inquiries"
  on public.inquiries for insert
  with check (true);

drop policy if exists "Authenticated admins can read inquiries" on public.inquiries;
create policy "Authenticated admins can read inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can read all murtis" on public.murtis;
create policy "Authenticated admins can read all murtis"
  on public.murtis for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can insert murtis" on public.murtis;
create policy "Authenticated admins can insert murtis"
  on public.murtis for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admins can update murtis" on public.murtis;
create policy "Authenticated admins can update murtis"
  on public.murtis for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admins can delete murtis" on public.murtis;
create policy "Authenticated admins can delete murtis"
  on public.murtis for delete
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can update site settings" on public.site_settings;
create policy "Authenticated admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admins can insert site settings" on public.site_settings;
create policy "Authenticated admins can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (true);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'murti-images',
  'murti-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read murti images" on storage.objects;
create policy "Public can read murti images"
  on storage.objects for select
  using (bucket_id = 'murti-images');

drop policy if exists "Authenticated admins can upload murti images" on storage.objects;
create policy "Authenticated admins can upload murti images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'murti-images');

drop policy if exists "Authenticated admins can update murti images" on storage.objects;
create policy "Authenticated admins can update murti images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'murti-images')
  with check (bucket_id = 'murti-images');

drop policy if exists "Authenticated admins can delete murti images" on storage.objects;
create policy "Authenticated admins can delete murti images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'murti-images');
