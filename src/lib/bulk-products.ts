import Papa from "papaparse";
import type { Category, Product } from "./catalog";
import { isValidName, parsePriceInput } from "./product-form";

export const CSV_COLUMNS = ["tên", "loại", "kích thước", "bề mặt", "giá", "nhãn", "tên file ảnh"];
export const normalizeName = (value: string) => value.trim().normalize("NFC").toLocaleLowerCase("vi");
export const bulkImagePath = (name: string) => `bulk/${encodeURIComponent(normalizeName(name))}.webp`;
export const imageDimensions = (width: number, height: number) => {
  const ratio = Math.min(1, 1200 / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
};
export type CsvRow = { line: number; name: string; category: string; size: string; finish: string; price: string; tag: string; image: string; errors: string[] };
export function readProductCsv(text: string): CsvRow[] {
  const result = Papa.parse<Record<string, string>>(text.replace(/^\uFEFF/, ""), { header: true, skipEmptyLines: "greedy", transformHeader: normalizeName });
  const missing = CSV_COLUMNS.filter((column) => !result.meta.fields?.includes(column));
  if (missing.length) throw new Error(`Thiếu cột: ${missing.join(", ")}`);
  if (result.errors.length) throw new Error(`CSV không hợp lệ: ${result.errors[0]?.message ?? "Lỗi đọc file"}`);
  if (!result.data.length) throw new Error("File CSV chưa có sản phẩm");
  return result.data.map((row, i) => ({ line: i + 2, name: row["tên"]?.trim() ?? "", category: row["loại"]?.trim() ?? "", size: row["kích thước"]?.trim() ?? "", finish: row["bề mặt"]?.trim() ?? "", price: row["giá"]?.trim() ?? "", tag: row["nhãn"]?.trim() ?? "", image: row["tên file ảnh"]?.trim() ?? "", errors: [] }));
}
export function validateCsvRows(rows: CsvRow[], categories: Pick<Category, "name" | "slug">[], images: Set<string>, products: Pick<Product, "name">[] = []): CsvRow[] {
  const seen = new Set<string>();
  return rows.map((row) => {
    const errors: string[] = [];
    const name = normalizeName(row.name);
    const matches = categories.filter((c) => normalizeName(c.name) === normalizeName(row.category) || c.slug === row.category);
    if (matches.length !== 1) errors.push("Sai danh mục");
    if (!row.image || !images.has(normalizeName(row.image))) errors.push("Thiếu ảnh");
    if (!isValidName(row.name)) errors.push("Tên cần 2–120 ký tự");
    if (parsePriceInput(row.price) === null) errors.push("Giá không hợp lệ");
    if (!row.size) errors.push("Thiếu kích thước");
    if (seen.has(name)) errors.push("Trùng tên trong CSV");
    if (products.filter((p) => normalizeName(p.name) === name).length > 1) errors.push("Nhiều sản phẩm cùng tên; sửa tên trước khi nhập");
    seen.add(name);
    return { ...row, category: matches[0]?.slug ?? row.category, errors };
  });
}

export async function compressProductImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const dimensions = imageDimensions(bitmap.width, bitmap.height);
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Không xử lý được ảnh");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob || blob.type !== "image/webp") throw new Error("Trình duyệt chưa hỗ trợ ảnh WebP");
    return blob;
  } finally { bitmap.close(); }
}