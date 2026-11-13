/** Bỏ dấu tiếng Việt và ký tự lạ, trả về địa chỉ ngắn dùng cho đường dẫn. */
export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "mau-gach";
}

/** Địa chỉ không trùng với những địa chỉ đang có. */
export function uniqueSlug(base: string, taken: string[]): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
