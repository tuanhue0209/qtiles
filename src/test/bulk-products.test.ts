import { describe, expect, it } from "vitest";
import { bulkImagePath, imageDimensions, readProductCsv, validateCsvRows } from "@/lib/bulk-products";
const csv = 'tên,loại,kích thước,bề mặt,giá,nhãn,tên file ảnh\n"Gạch, đá",lat-nen,60x60,Mờ,285000,,tile.jpg';
const categories = [{ name: "Gạch lát nền", slug: "lat-nen" }];
describe("bulk products", () => {
  it("reads quoted CSV names and the seven required columns", () => { const rows = readProductCsv(csv); expect(rows[0]?.name).toBe("Gạch, đá"); expect(rows[0]?.price).toBe("285000"); });
  it("rejects missing image rows", () => { expect(validateCsvRows(readProductCsv(csv), categories, new Set())[0]?.errors).toContain("Thiếu ảnh"); });
  it("rejects invalid categories", () => { expect(validateCsvRows(readProductCsv(csv.replace("lat-nen", "unknown")), categories, new Set(["tile.jpg"]))[0]?.errors).toContain("Sai danh mục"); });
  it("accepts a category name and filename match", () => { const rows = validateCsvRows(readProductCsv(csv.replace("lat-nen", "Gạch lát nền")), categories, new Set(["tile.jpg"])); expect(rows[0]?.category).toBe("lat-nen"); expect(rows[0]?.errors).toEqual([]); });
  it("rejects duplicate rows to prevent accidental duplicated products", () => { const row = readProductCsv(csv)[0]; if (!row) throw new Error("Missing fixture"); expect(validateCsvRows([row, { ...row, line: 3 }], categories, new Set(["tile.jpg"]))[1]?.errors).toContain("Trùng tên trong CSV"); });
  it("caps the longest side at 1200 pixels without upscaling", () => { expect(imageDimensions(2400, 1600)).toEqual({ width: 1200, height: 800 }); expect(imageDimensions(600, 1800)).toEqual({ width: 400, height: 1200 }); expect(imageDimensions(400, 300)).toEqual({ width: 400, height: 300 }); });
  it("maps original filename to a stable WebP path", () => { expect(bulkImagePath(" Tile.JPG ")).toBe("bulk/tile.jpg.webp"); });
});