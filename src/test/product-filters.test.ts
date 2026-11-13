import { describe, expect, it } from "vitest";
import { filterProducts } from "@/lib/product-filters";
import type { Product } from "@/lib/catalog";

const base: Product = { id: "1", slug: "mau-1", name: "Mẫu 1", category: "lat-nen", size: "60 × 60 cm", color: "Xám", finish: "Mờ", origin: "Việt Nam", price: 285000, tag: null, description: "", sortOrder: 1, imagePath: null, gallery: [], photos: [] };
const rows = [base, { ...base, id: "2", category: "op-tuong", size: "30 × 60 cm", color: "Trắng", finish: "Bóng", origin: "Ý" }];
describe("product filtering", () => {
  it("filters by size", () => { expect(filterProducts(rows, { kich: "60 × 60 cm" }).map((p) => p.id)).toEqual(["1"]); });
  it("filters by color", () => { expect(filterProducts(rows, { mau: "Trắng" }).map((p) => p.id)).toEqual(["2"]); });
  it("filters by surface", () => { expect(filterProducts(rows, { mat: "Mờ" }).map((p) => p.id)).toEqual(["1"]); });
  it("filters by origin", () => { expect(filterProducts(rows, { xu: "Ý" }).map((p) => p.id)).toEqual(["2"]); });
  it("combines conditions", () => { expect(filterProducts(rows, { loai: "lat-nen", mau: "Trắng" })).toEqual([]); });
});