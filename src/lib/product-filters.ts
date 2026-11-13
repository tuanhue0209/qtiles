import type { Product } from "./catalog";

export type ProductFilter = {
  /** slug danh mục */
  loai?: string | undefined;
  kich?: string | undefined;
  mau?: string | undefined;
  mat?: string | undefined;
  xu?: string | undefined;
};

export type FacetField = "size" | "color" | "finish" | "origin";

export const FACETS: { key: keyof ProductFilter; field: FacetField; label: string }[] = [
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
      (!filter.xu || p.origin === filter.xu),
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
  return Object.values(filter).some((value) => Boolean(value));
}
