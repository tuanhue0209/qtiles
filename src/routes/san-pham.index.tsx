import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/product-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryPhoto, type Category } from "@/lib/catalog";
import {
  FACETS,
  facetOptions,
  filterProducts,
  hasActiveFilter,
  type ProductFilter,
} from "@/lib/product-filters";
import { categoriesQueryOptions, productsQueryOptions } from "@/lib/products.query";
import { cn } from "@/lib/utils";

type FilterSearch = {
  loai?: string | undefined;
  kich?: string | undefined;
  mau?: string | undefined;
  mat?: string | undefined;
  xu?: string | undefined;
};

const EMPTY: FilterSearch = { loai: undefined, kich: undefined, mau: undefined, mat: undefined, xu: undefined };

function readText(search: Record<string, unknown>, key: string): string | undefined {
  const value = search[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export const Route = createFileRoute("/san-pham/")({
  validateSearch: (search: Record<string, unknown>): FilterSearch => ({
    loai: readText(search, "loai"),
    kich: readText(search, "kich"),
    mau: readText(search, "mau"),
    mat: readText(search, "mat"),
    xu: readText(search, "xu"),
  }),
  head: () => ({
    meta: [
      { title: "Sản phẩm gạch ốp lát — QT tiles" },
      {
        name: "description",
        content:
          "Gạch lát nền, ốp tường, trang trí và khổ lớn tại QT tiles. Lọc theo kích thước, màu, bề mặt và xuất xứ.",
      },
      { property: "og:title", content: "Sản phẩm gạch ốp lát — QT tiles" },
      {
        property: "og:description",
        content: "Xem và lọc mẫu gạch theo kích thước, màu sắc, bề mặt, xuất xứ kèm giá tham khảo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function FacetSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string | undefined;
  options: string[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="min-w-0">
      <Label className="eyebrow text-muted-foreground">{label}</Label>
      <Select value={value ?? "all"} onValueChange={(next) => onChange(next === "all" ? undefined : next)}>
        <SelectTrigger className="mt-2 w-full rounded-none bg-card">
          <SelectValue placeholder="Tất cả" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ProductsPage() {
  const filter = Route.useSearch();
  const navigate = Route.useNavigate();
  const applyFilter = (next: FilterSearch) => { void navigate({ search: { ...EMPTY, ...next } }); };
  const { data: allProducts } = useSuspenseQuery(productsQueryOptions);
  const { data: categories } = useQuery(categoriesQueryOptions);

  const list = categories ?? [];
  const bySlug = new Map<string, Category>(list.map((c) => [c.slug, c]));
  const shown = filterProducts(allProducts, filter);
  const active = hasActiveFilter(filter);

  const chip = (isActive: boolean) =>
    cn(
      "shrink-0 border px-4 py-2 text-sm font-medium transition-colors",
      isActive
        ? "border-foreground bg-foreground text-background"
        : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow text-primary">Sản phẩm</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">Chọn gạch theo cách của bạn</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        {shown.length} mẫu đang hiển thị · giá tham khảo theo m², đã gồm tư vấn và báo giá tận nơi.
      </p>

      {/* Danh mục — do cửa hàng thêm, sửa ở trang Quản lý */}
      <div className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link to="/san-pham" search={EMPTY} className={chip(!filter.loai)}>
          Tất cả
        </Link>
        {list.map((c) => (
          <Link
            key={c.id}
            to="/san-pham"
            search={{ ...EMPTY, loai: c.slug }}
            className={chip(filter.loai === c.slug)}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Bộ lọc */}
      <div className="mt-6 grid gap-4 border-y py-6 sm:grid-cols-2 lg:grid-cols-4">
        {FACETS.map((facet) => (
          <FacetSelect
            key={facet.key}
            label={facet.label}
            value={filter[facet.key]}
            options={facetOptions(allProducts, facet.field)}
            onChange={(value) => applyFilter({ ...filter, [facet.key]: value })}
          />
        ))}
      </div>

      {active && (
        <Button variant="link"
          type="button"
          onClick={() => applyFilter(EMPTY)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <X className="size-3.5" /> Xóa tất cả bộ lọc
        </Button>
      )}

      {shown.length === 0 ? (
        <div className="mt-14 border bg-card p-10 text-center">
          <h2 className="font-display text-2xl">Chưa có mẫu nào khớp bộ lọc</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Thử bỏ bớt một điều kiện, hoặc gọi cửa hàng — kho còn nhiều mẫu chưa kịp đăng lên web.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} category={bySlug.get(p.category)} />
          ))}
        </div>
      )}

      {/* Danh mục khác, dành cho khách đã xem hết danh sách */}
      {list.length > 1 && (
        <section className="mt-16">
          <h2 className="eyebrow text-muted-foreground">Danh mục khác</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {list
              .filter((c) => c.slug !== filter.loai)
              .map((c) => (
                <Link
                  key={c.id}
                  to="/san-pham"
                  search={{ ...EMPTY, loai: c.slug }}
                  className="group border bg-card transition-colors hover:border-primary/40"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={categoryPhoto(c)}
                      alt={c.name}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg">{c.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.short}</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
