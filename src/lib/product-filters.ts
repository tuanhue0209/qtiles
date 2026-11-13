import type { Product } from "./catalog";

export type ProductFilter = {
  /** slug danh mục */
  loai?: string | undefined;
  kich?: string | undefined;
  mau?: string | undefined;
  mat?: string | undefined;
  xu?: string | undefined;
  giaTu?: number | undefined;
  giaDen?: number | undefined;
};

export type FacetField = "size" | "color" | "finish" | "origin";

export const FACETS: { key: "kich" | "mau" | "mat" | "xu"; field: FacetField; label: string }[] = [
  { key: "kich", field: "size", label: "Kích thước" },
  { key: "mau", field: "color", label: "Màu sắc" },
  { key: "mat", field: "finish", label: "Bề mặt" },
  { key: "xu", field: "origin", label: "Xuất xứ" },
];

const collator = new Intl.Collator("vi");

export function filterProducts(products: Product[], filter: ProductFilter): Product[] {
  return products.filter(
    (p) =>
      (!filter.loai || p.category === filter.loai) &&
      (!filter.kich || p.size === filter.kich) &&
      (!filter.mau || p.color === filter.mau) &&
      (!filter.mat || p.finish === filter.mat) &&
      (!filter.xu || p.origin === filter.xu) &&
      (filter.giaTu === undefined || p.price >= filter.giaTu) &&
      (filter.giaDen === undefined || p.price <= filter.giaDen),
  );
}

/** Những giá trị đang có thật trong danh sách, đã sắp xếp, bỏ chỗ trống. */
export function facetOptions(products: Product[], field: FacetField): string[] {
  const seen = new Set<string>();
  for (const product of products) {
    const value = product[field]?.trim();
    if (value) seen.add(value);
  }
  return [...seen].sort(collator.compare);
}

export function hasActiveFilter(filter: ProductFilter): boolean {
  return Object.values(filter).some((value) => value !== undefined && value !== "");
}

export const PRODUCTS_PER_PAGE = 12;
export function paginateProducts(products: Product[], requestedPage: number) {
  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const page = Math.max(1, Math.min(totalPages, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1));
  return { page, totalPages, products: products.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE) };
}
