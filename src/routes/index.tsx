import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Phone, Ruler, Truck } from "lucide-react";

import heroImg from "@/assets/hero-showroom.jpg";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, SHOP } from "@/lib/catalog";
import { productsQueryOptions } from "@/lib/products.query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QT tiles — Gạch ốp lát chính hãng tại Sài Gòn" },
      {
        name: "description",
        content:
          "Gạch lát nền, ốp tường, giả gỗ, gạch bông, gạch thẻ và sân vườn. Giá tận kho, giao hàng nhanh khắp TP. Hồ Chí Minh.",
      },
      { property: "og:title", content: "QT tiles — Gạch ốp lát chính hãng tại Sài Gòn" },
      {
        property: "og:description",
        content: "Giá tận kho, tư vấn miễn phí, giao nhanh nội thành TP. Hồ Chí Minh.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  component: Index,
});

const PERKS = [
  { icon: Truck, title: "Giao nhanh nội thành", text: "Giao trong ngày tại các quận TP. Hồ Chí Minh." },
  { icon: BadgeCheck, title: "Hàng chính hãng", text: "Đầy đủ chứng từ, bảo hành theo nhà sản xuất." },
  { icon: Ruler, title: "Tư vấn & bóc khối lượng", text: "Gửi bản vẽ, chúng tôi tính số m² giúp bạn." },
];

function Index() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const featured = products.filter((p) => p.tag).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Phòng khách lát gạch porcelain màu kem với tường gạch đất nung"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-36">
          <div className="max-w-xl animate-rise text-primary-foreground">
            <p className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Showroom gạch ốp lát · Sài Gòn
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] text-balance-pretty sm:text-6xl">
              Gạch đẹp cho từng góc nhà bạn.
            </h1>
            <p className="mt-5 max-w-md text-lg text-primary-foreground/85">
              Hơn 500 mẫu gạch lát nền, ốp tường, giả gỗ và gạch bông — giá tận kho, giao tận
              công trình.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/san-pham">
                  Xem sản phẩm <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="xl">
                <a href={SHOP.phoneHref}>
                  <Phone /> {SHOP.phone}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Danh mục</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Chọn theo loại gạch</h2>
          </div>
          <Link to="/bang-gia" className="text-sm font-medium text-primary hover:underline">
            Xem bảng giá đầy đủ →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/san-pham"
              search={{ loai: c.id }}
              className="group relative isolate aspect-[4/5] overflow-hidden rounded-lg sm:aspect-[4/3]"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-card-overlay" />
              <div className="flex h-full flex-col justify-end p-4 text-primary-foreground sm:p-5">
                <h3 className="text-lg font-bold sm:text-xl">{c.name}</h3>
                <p className="mt-1 hidden text-sm text-primary-foreground/80 sm:block">{c.short}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-grout bg-muted/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Nổi bật</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Mẫu được chọn nhiều nhất</h2>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:px-6 md:grid-cols-3">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-lg border bg-card p-6 shadow-tile">
            <span className="flex size-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-primary p-8 text-primary-foreground sm:p-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Cần báo giá cho công trình?</h2>
            <p className="mt-2 text-primary-foreground/85">
              Gọi ngay để được tư vấn mẫu và giá sỉ trong 5 phút.
            </p>
          </div>
          <Button asChild variant="forest" size="xl">
            <a href={SHOP.phoneHref}>
              <Phone /> {SHOP.phone}
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
