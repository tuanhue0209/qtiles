import type { Category } from "./catalog";

/**
 * Giá nhập vào có thể viết "285.000", "285000" hoặc "285 000".
 * Trả về số VNĐ / m², hoặc null nếu không hợp lệ (rỗng, chữ, số âm, 0).
 */
export function parsePriceInput(value: string): number | null {
  const cleaned = value.replace(/[.\s]/g, "").replace(/,/g, ".");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const price = Math.round(Number(cleaned));
  if (!Number.isFinite(price) || price <= 0) return null;
  return price;
}

/** Tên mẫu gạch bắt buộc có, không được quá dài. */
export function isValidName(value: string): boolean {
  const name = value.trim();
  return name.length >= 2 && name.length <= 120;
}

export function parseCategory(value: string, categories: Pick<Category, "slug">[]): string | null {
  return categories.some((category) => category.slug === value) ? value : null;
}
