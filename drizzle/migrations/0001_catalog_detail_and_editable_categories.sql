-- 1) Detail pages need a short web address; filters need colour; detail pages need a description and extra photos.
alter table public.products add column slug text;
alter table public.products add column color text not null default '';
alter table public.products add column description text not null default '';
alter table public.products add column gallery text[] not null default '{}';

-- 2) Backfill the new columns for the samples already in the database.
update public.products p set
  slug = v.slug,
  color = v.color,
  description = v.description
from (values
  ('Porcelain vân đá Marble Xám','porcelain-van-da-marble-xam','Xám','Bề mặt bóng kiếng phản chiếu ánh sáng, giúp phòng khách rộng và sáng hơn. Xương porcelain đặc, chống thấm tốt, dùng được cho sảnh và khu vực đi lại nhiều.'),
  ('Porcelain Kem Sữa','porcelain-kem-sua','Kem','Tông kem trung tính dễ phối nội thất, bề mặt mờ hạn chế trơn trượt. Phù hợp phòng ngủ và căn hộ diện tích nhỏ.'),
  ('Granite Trắng Vân Mây','granite-trang-van-may','Trắng','Đá granite vân mây trắng, độ cứng cao, chịu lực tốt. Phù hợp sảnh lớn, showroom và khu vực nhiều người qua lại.'),
  ('Porcelain Xi Măng Ghi','porcelain-xi-mang-ghi','Xám','Màu ghi xi măng theo phong cách công nghiệp, bề mặt mờ nhám hạn chế vết trầy. Hợp quán cà phê, studio và nhà phố hiện đại.'),
  ('Gạch thẻ men Kem Subway','gach-the-men-kem-subway','Kem','Viên gạch thẻ nhỏ, đường ron đều tạo nhịp thị giác cho tường bếp. Men bóng dễ lau dầu mỡ.'),
  ('Ốp tường Trắng Sứ','op-tuong-trang-su','Trắng','Men trắng sứ làm sáng khu vực thiếu sáng, giá hợp lý cho nhà tắm và bếp. Bề mặt bóng, lau chùi nhanh.'),
  ('Ốp tường Xanh Rêu','op-tuong-xanh-reu','Xanh lá','Xanh rêu trầm, men mờ tạo chiều sâu cho tường đứng. Thích hợp phòng tắm và tường điểm nhấn.'),
  ('Giả gỗ Sồi Tự Nhiên','gia-go-soi-tu-nhien','Nâu','Vân sồi thật, bề mặt mờ vân sần giảm trơn. Lát nền phòng ngủ, quán cà phê mà không lo mối mọt như sàn gỗ.'),
  ('Giả gỗ Óc Chó','gia-go-oc-cho','Nâu','Tông nâu óc chó ấm áp, hợp nội thất gỗ tối màu. Bề mặt mờ, hạn chế in dấu chân.'),
  ('Giả gỗ Xương Cá','gia-go-xuong-ca','Nâu','Kiểu xương cá cho cảm giác sàn gỗ cao cấp, thi công theo góc 90 độ. Nên dùng cho phòng khách và phòng làm việc.'),
  ('Gạch bông Hoa Sen Đỏ Gạch','gach-bong-hoa-sen-do-gach','Đỏ','Hoa văn hoa sen in xi măng thủ công, mỗi viên có chênh lệch nhẹ rất riêng. Dùng cho lối vào và quán cà phê phong cách Sài Gòn xưa.'),
  ('Gạch bông Caro Xanh Lá','gach-bong-caro-xanh-la','Xanh lá','Hoa văn caro xanh lá tạo điểm nhấn cho khu vực nhỏ như quầy bar, lối bếp. Bề mặt xi măng bền màu.'),
  ('Gạch bông men Hoa Văn','gach-bong-men-hoa-van','Trắng','Hoa văn in men, bề mặt mờ dễ vệ sinh hơn gạch bông xi măng. Hợp tường bếp và mảng tường trang trí.'),
  ('Gạch thẻ Đất Nung Men Rạn','gach-the-dat-nung-men-ran','Nâu','Men rạn bóng tạo hiệu ứng bề mặt rất thật, màu đất nung ấm. Ốp tường quán cà phê, mặt tiền, quầy bar.'),
  ('Gạch thẻ Xanh Ngọc Thủ Công','gach-the-xanh-ngoc-thu-cong','Xanh dương','Xanh ngọc men bóng, làm thủ công nên màu có độ chuyển. Điểm nhấn mạnh cho tường shower và quầy bar.'),
  ('Gạch sân vườn Đỏ Đất Nung','gach-san-vuon-do-dat-nung','Đỏ','Cốt gạch dày, bề mặt nhám chống trơn, chịu nắng mưa trực tiếp. Dùng cho sân thượng và lối đi sân vườn.'),
  ('Gạch sân vườn Giả Đá Xám','gach-san-vuon-gia-da-xam','Xám','Bề mặt sần giống đá tự nhiên, chống trơn tốt khi trời mưa. Phù hợp sân trước, ban công và lối đi.')
) as v(name, slug, color, description)
where p.name = v.name;

create unique index products_slug_key on public.products (slug);

-- 3) The list of categories becomes data the shop can edit, not a fixed list in code.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short text not null default '',
  image_path text,
  sort_order integer not null default 0
);

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;

alter table public.categories enable row level security;

create policy "Anyone can read categories"
  on public.categories for select to anon, authenticated
  using (true);

create policy "Admins insert categories"
  on public.categories for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins update categories"
  on public.categories for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete categories"
  on public.categories for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

insert into public.categories (slug, name, short, sort_order)
select v.slug, v.name, v.short, v.ord
from (values
  ('lat-nen', 'Gạch lát nền', 'Porcelain bóng và mờ cho phòng khách, sảnh, lối đi', 1),
  ('op-tuong', 'Gạch ốp tường', 'Men bóng, men mờ chống thấm cho nhà tắm và bếp', 2),
  ('trang-tri', 'Gạch trang trí', 'Gạch bông, gạch thẻ hoa văn cho tường và điểm nhấn', 3),
  ('kho-lon', 'Gạch khổ lớn', 'Viên lớn từ 80 cm, ít đường ron, mặt sàn liền mạch', 4)
) as v(slug, name, short, ord);

-- 4) Move the samples onto the four groups, then let the column follow the editable list.
alter table public.products drop constraint products_category_check;

update public.products set category = case
  when category = 'op-tuong' then 'op-tuong'
  when category in ('gach-bong', 'gach-the') then 'trang-tri'
  when name in ('Porcelain vân đá Marble Xám', 'Granite Trắng Vân Mây') then 'kho-lon'
  else 'lat-nen'
end;

alter table public.products add constraint products_category_fkey
  foreign key (category) references public.categories(slug);

-- 5) Inquiry box: visitors ask for a quote, the shop reads it in the admin page.
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null default '',
  name text not null,
  phone text not null,
  email text not null default '',
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'done')),
  created_at timestamptz not null default now()
);

grant insert on public.inquiries to anon, authenticated;
grant select, update on public.inquiries to authenticated;
grant all on public.inquiries to service_role;

alter table public.inquiries enable row level security;

create policy "Visitors can send an inquiry"
  on public.inquiries for insert to anon, authenticated
  with check (status = 'new');

create policy "Admins read inquiries"
  on public.inquiries for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins update inquiries"
  on public.inquiries for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));