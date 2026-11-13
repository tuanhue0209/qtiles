import imgLatNen from "@/assets/tile-lat-nen.jpg";
import imgOpTuong from "@/assets/tile-op-tuong.jpg";
import imgGiaGo from "@/assets/tile-gia-go.jpg";
import imgGachBong from "@/assets/tile-gach-bong.jpg";
import imgGachThe from "@/assets/tile-gach-the.jpg";
import imgSanVuon from "@/assets/tile-san-vuon.jpg";
import imgKhoLon from "@/assets/tile-kho-lon.jpg";

// Shop contact info — placeholders until the owner provides real details.
export const SHOP = {
  name: "QT tiles",
  phone: "0909 123 456",
  phoneHref: "tel:0909123456",
  zaloHref: "https://zalo.me/0909123456",
  address: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
  hours: "7:30 – 18:00, Thứ 2 – Chủ nhật",
} as const;

/**
 * Ảnh minh họa để dành cho danh mục chưa kịp tải ảnh riêng.
 * Danh mục thật do cửa hàng thêm ở trang Quản lý sẽ dùng ảnh của chính nó.
 */
const CATEGORY_FALLBACK: Record<string, string> = {
  "lat-nen": imgLatNen,
  "op-tuong": imgOpTuong,
  "gia-go": imgGiaGo,
  "gach-bong": imgGachBong,
  "gach-the": imgGachThe,
  "san-vuon": imgSanVuon,
  "kho-lon": imgKhoLon,
};

export const GENERIC_TILE_IMAGE = imgLatNen;

export type Category = {
  id: string;
  slug: string;
  name: string;
  short: string;
  sortOrder: number;
  /** Đường dẫn ảnh trong kho ảnh, nếu có */
  imagePath: string | null;
  /** Địa chỉ ảnh xem được, do server tạo khi trang tải */
  imageUrl: string | null;
};

export type Product = {
  id: string;
  /** Địa chỉ ngắn dùng cho đường dẫn trang chi tiết */
  slug: string;
  name: string;
  /** slug của danh mục */
  category: string;
  size: string;
  finish: string;
  color: string;
  origin: string;
  /** Giá tham khảo, VNĐ / m² */
  price: number;
  tag: string | null;
  description: string;
  /** Thứ tự hiển thị trong danh sách */
  sortOrder: number;
  imagePath: string | null;
  /** Các ảnh phụ trong kho ảnh */
  gallery: string[];
  /** Ảnh xem được, ảnh chính trước, do server tạo khi trang tải */
  photos: string[];
};

export function categoryPhoto(category: Category | undefined): string {
  if (!category) return GENERIC_TILE_IMAGE;
  if (category.imageUrl) return category.imageUrl;
  return CATEGORY_FALLBACK[category.slug] ?? GENERIC_TILE_IMAGE;
}

export function productPhoto(product: Product, category: Category | undefined): string {
  return product.photos[0] ?? categoryPhoto(category);
}

export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(price)}₫`;
}
