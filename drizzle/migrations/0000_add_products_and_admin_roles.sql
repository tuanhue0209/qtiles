-- Roles: who may edit the shop's product list
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can read own roles"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- The first account created becomes the shop manager.
create or replace function public.assign_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles) then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;

create trigger on_auth_user_created_assign_admin
  after insert on auth.users
  for each row execute function public.assign_first_admin();

-- Product list
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('lat-nen','op-tuong','gia-go','gach-bong','gach-the','san-vuon')),
  size text not null,
  finish text not null default '',
  origin text not null default '',
  price integer not null check (price > 0),
  tag text,
  image_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;

alter table public.products enable row level security;

create policy "Anyone can read products"
  on public.products for select to anon, authenticated
  using (true);

create policy "Admins insert products"
  on public.products for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins update products"
  on public.products for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete products"
  on public.products for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Photos of products live in the public 'gach-anh' bucket
create policy "Anyone can read tile images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'gach-anh');

create policy "Admins upload tile images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'gach-anh' and public.has_role(auth.uid(), 'admin'));

create policy "Admins replace tile images"
  on storage.objects for update to authenticated
  using (bucket_id = 'gach-anh' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete tile images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'gach-anh' and public.has_role(auth.uid(), 'admin'));

-- Seed the 17 sample products
insert into public.products (name, category, size, finish, origin, price, tag, sort_order) values
  ('Porcelain vân đá Marble Xám', 'lat-nen', '80 × 80 cm', 'Bóng kiếng', 'Việt Nam', 285000, 'Bán chạy', 1),
  ('Porcelain Kem Sữa', 'lat-nen', '60 × 60 cm', 'Mờ', 'Việt Nam', 195000, null, 2),
  ('Granite Trắng Vân Mây', 'lat-nen', '60 × 120 cm', 'Bóng kiếng', 'Ấn Độ', 420000, 'Cao cấp', 3),
  ('Porcelain Xi Măng Ghi', 'lat-nen', '60 × 60 cm', 'Mờ nhám', 'Việt Nam', 215000, null, 4),
  ('Gạch thẻ men Kem Subway', 'op-tuong', '7.5 × 15 cm', 'Men bóng', 'Việt Nam', 260000, null, 5),
  ('Ốp tường Trắng Sứ', 'op-tuong', '30 × 60 cm', 'Men bóng', 'Việt Nam', 165000, 'Giá tốt', 6),
  ('Ốp tường Xanh Rêu', 'op-tuong', '30 × 60 cm', 'Men mờ', 'Tây Ban Nha', 390000, null, 7),
  ('Giả gỗ Sồi Tự Nhiên', 'gia-go', '20 × 120 cm', 'Mờ vân sần', 'Việt Nam', 245000, 'Bán chạy', 8),
  ('Giả gỗ Óc Chó', 'gia-go', '15 × 90 cm', 'Mờ', 'Việt Nam', 225000, null, 9),
  ('Giả gỗ Xương Cá', 'gia-go', '15 × 60 cm', 'Mờ', 'Ấn Độ', 310000, null, 10),
  ('Gạch bông Hoa Sen Đỏ Gạch', 'gach-bong', '20 × 20 cm', 'Xi măng', 'Việt Nam', 340000, 'Thủ công', 11),
  ('Gạch bông Caro Xanh Lá', 'gach-bong', '20 × 20 cm', 'Xi măng', 'Việt Nam', 320000, null, 12),
  ('Gạch bông men Hoa Văn', 'gach-bong', '20 × 20 cm', 'Men mờ', 'Việt Nam', 280000, null, 13),
  ('Gạch thẻ Đất Nung Men Rạn', 'gach-the', '6 × 24 cm', 'Men rạn bóng', 'Việt Nam', 360000, null, 14),
  ('Gạch thẻ Xanh Ngọc Thủ Công', 'gach-the', '6.5 × 20 cm', 'Men bóng', 'Tây Ban Nha', 520000, 'Cao cấp', 15),
  ('Gạch sân vườn Đỏ Đất Nung', 'san-vuon', '40 × 40 cm', 'Nhám chống trơn', 'Việt Nam', 145000, 'Giá tốt', 16),
  ('Gạch sân vườn Giả Đá Xám', 'san-vuon', '60 × 60 cm', 'Nhám sần', 'Việt Nam', 205000, null, 17);