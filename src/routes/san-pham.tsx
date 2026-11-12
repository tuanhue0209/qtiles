import { createFileRoute, Link } from "@tanstack/react-router";

import { ProductCard } from "@/components/site/product-card";
import { CATEGORIES, getCategory, isCategoryId, productsInCategory, type CategoryId } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/san-pham")({
  validateSearch: (search: Record<string, unknown>): { loai?: CategoryId } => ({
    loai: isCategoryId(search.loai) ? search.loai : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sản phẩm gạch ốp lát — QT tiles" },
      {
        name: "description",
        content:
          "Danh mục gạch lát nền, ốp tường, giả gỗ, gạch bông, gạch thẻ, sân vườn tại QT tiles Sài Gòn.",
      },
      { property: "og:title", content: "Sản phẩm gạch ốp lát — QT tiles" },
      { property: "og:description", content: "Xem đầy đủ mẫu gạch theo từng danh mục kèm giá tham khảo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { loai } = Route.useSearch();
  const products = productsInCategory(loai);
  const title = loai ? getCategory(loai).name : "Tất cả sản phẩm";

  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "bg-card text-muted-foreground hover:border-primary hover:text-foreground",
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Sản phẩm</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{products.length} mẫu · giá tham khảo theo m²</p>

      <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link to="/san-pham" search={{}} className={chip(!loai)}>
          Tất cả
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} to="/san-pham" search={{ loai: c.id }} className={chip(loai === c.id)}>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
