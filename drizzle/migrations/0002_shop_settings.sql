CREATE TABLE public.shop_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  phone text NOT NULL DEFAULT '0909 123 456',
  zalo text NOT NULL DEFAULT '0909123456',
  address text NOT NULL DEFAULT '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
  hours text NOT NULL DEFAULT '7:30 – 18:00, Thứ 2 – Chủ nhật',
  slogan text NOT NULL DEFAULT 'Gạch ốp lát chính hãng cho nhà phố, căn hộ và công trình tại Sài Gòn.',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shop_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.shop_settings TO authenticated;
GRANT ALL ON public.shop_settings TO service_role;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shop settings" ON public.shop_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update shop settings" ON public.shop_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert shop settings" ON public.shop_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.shop_settings (id) VALUES (true);