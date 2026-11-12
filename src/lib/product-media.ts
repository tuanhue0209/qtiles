/** Kho chứa ảnh sản phẩm. */
export const IMAGE_BUCKET = "gach-anh";

/** Tên file gọn gàng, không dấu, giữ đúng phần mở rộng. */
export function objectPathFor(name: string, file: File): string {
  const slug =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "mau-gach";
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${slug}-${Date.now()}.${ext || "jpg"}`;
}
