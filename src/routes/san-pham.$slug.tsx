import { useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";

import { InquiryDialog } from "@/components/site/inquiry-dialog";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { categoryPhoto, formatPrice, type Category } from "@/lib/catalog";
import { useShop } from "@/hooks/use-shop";
import { categoriesQueryOptions, productPageQueryOptions } from "@/lib/products.query";

function metaText(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export const Route = createFileRoute("/san-pham/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productPageQueryOptions(params.slug)),
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    const photo = product?.photos[0];
    const description = product
      ? metaText(product.description || `${product.name}, ${product.size}, ${product.finish}. Liên hệ QT tiles để nhận báo giá mới nhất.`, 158)
      : "Mẫu gạch này không còn trên website QT tiles.";

    const meta = [
      { title: product ? `${product.name} — QT tiles` : "Không tìm thấy mẫu gạch — QT tiles" },
      { name: "description", content: description },
      { property: "og:title", content: product ? product.name : "Không tìm thấy mẫu gạch" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (photo?.startsWith("https://")) {
      meta.push({ property: "og:image", content: photo });
      meta.push({ name: "twitter:image", content: photo });
    }
    if (!product) meta.push({ name: "robots", content: "noindex" });

    return { meta };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const SHOP = useShop();
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productPageQueryOptions(slug));
  const { data: categories } = useQuery(categoriesQueryOptions);
  const [active, setActive] = useState(0);
  const [asking, setAsking] = useState(false);

  if (!data) throw notFound();

  const { product, related } = data;
  const category: Category | undefined = categories?.find((c) => c.slug === product.category);
  const photos = product.photos.length > 0 ? product.photos : [categoryPhoto(category)];
  const current = photos[Math.min(active, photos.length - 1)] ?? photos[0];

  const specs: { label: string; value: string }[] = [
    { label: "Kích thước", value: product.size },
    { label: "Bề mặt", value: product.finish },
    { label: "Màu sắc", value: product.color },
    { label: "Xuất xứ", value: product.origin },
    { label: "Đơn vị tính", value: "m²" },
  ].filter((row) => row.value && row.value.trim().length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/san-pham" search={{}} className="inline-flex items-center gap-1.5 hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Tất cả sản phẩm
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link to="/san-pham" search={{ ...EMPTY_SEARCH, loai: category.slug }} className="hover:text-foreground">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* Ảnh lớn */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden border bg-muted sm:aspect-[5/4]">
            <img
              src={current}
              alt={product.name}
              width={1024}
              height={1024}
              className="size-full object-cover"
            />
          </div>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, index) => (
                <Button variant="ghost"
                  key={photo}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Xem ảnh ${index + 1} của ${product.name}`}
                  aria-current={index === active}
                  className={
                    index === active
                      ? "size-20 shrink-0 border-2 border-primary object-cover"
                      : "size-20 shrink-0 border border-border opacity-70 transition-opacity hover:opacity-100"
                  }
                >
                  <img src={photo} alt="" loading="lazy" width={160} height={160} className="size-full object-cover" />
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Thông tin */}
        <div>
          <p className="eyebrow text-primary">{category?.name ?? "Gạch"}</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-4 font-display text-4xl font-medium text-primary">Liên hệ</p>

          {product.description && (
            <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          <dl className="mt-8 border-t">
            {specs.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 border-b py-3 text-sm">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="xl">
              <a href={SHOP.phoneHref}>
                <Phone /> Gọi {SHOP.phone}
              </a>
            </Button>
            <Button asChild size="xl" variant="outline">
              <a href={SHOP.zaloHref} target="_blank" rel="noreferrer">
                <MessageCircle /> Nhắn Zalo
              </a>
            </Button>
          </div>
          <Button size="xl" className="mt-3 w-full sm:w-auto" onClick={() => setAsking(true)}>
            Gửi yêu cầu báo giá
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            Gọi điện hoặc nhắn Zalo để nhận báo giá mới nhất theo số lượng.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="eyebrow text-muted-foreground">Cùng danh mục</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} category={category} />
            ))}
          </div>
        </section>
      )}

      <InquiryDialog product={{ id: product.id, name: product.name }} open={asking} onOpenChange={setAsking} />
    </div>
  );
}

const EMPTY_SEARCH = {
  loai: undefined,
  kich: undefined,
  mau: undefined,
  mat: undefined,
  xu: undefined,
};
