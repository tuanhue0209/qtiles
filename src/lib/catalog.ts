import imgLatNen from "@/assets/tile-lat-nen.jpg";
import imgOpTuong from "@/assets/tile-op-tuong.jpg";
import imgGiaGo from "@/assets/tile-gia-go.jpg";
import imgGachBong from "@/assets/tile-gach-bong.jpg";
import imgGachThe from "@/assets/tile-gach-the.jpg";
import imgSanVuon from "@/assets/tile-san-vuon.jpg";

// Shop contact info — placeholders until the owner provides real details.
export const SHOP = {
  name: "QT tiles",
  phone: "0909 123 456",
  phoneHref: "tel:0909123456",
  zaloHref: "https://zalo.me/0909123456",
  address: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
  hours: "7:30 – 18:00, Thứ 2 – Chủ nhật",
} as const;

export const CATEGORIES = [
  {
    id: "lat-nen",
    name: "Gạch lát nền",
    short: "Porcelain bóng & mờ khổ lớn cho phòng khách, sảnh",
    image: imgLatNen,
  },
  {
    id: "op-tuong",
    name: "Gạch ốp tường",
    short: "Men bóng, chống thấm cho nhà tắm, bếp",
    image: imgOpTuong,
  },
  {
    id: "gia-go",
    name: "Gạch giả gỗ",
    short: "Vân gỗ ấm áp, bền hơn sàn gỗ thật",
    image: imgGiaGo,
  },
  {
    id: "gach-bong",
    name: "Gạch bông",
    short: "Hoa văn truyền thống Sài Gòn xưa",
    image: imgGachBong,
  },
  {
    id: "gach-the",
    name: "Gạch thẻ trang trí",
    short: "Ốp tường quán cà phê, mặt tiền, điểm nhấn",
    image: imgGachThe,
  },
  {
    id: "san-vuon",
    name: "Gạch sân vườn",
    short: "Chống trơn, chịu nắng mưa ngoài trời",
    image: imgSanVuon,
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && CATEGORIES.some((c) => c.id === value);
}

export function getCategory(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)!;
}

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  size: string;
  finish: string;
  origin: string;
  /** Giá tham khảo, VNĐ / m² */
  price: number;
  tag?: string | null;
  /** Đường dẫn ảnh trong kho ảnh, nếu có */
  imagePath?: string | null;
  /** Địa chỉ ảnh xem được, do server tạo khi trang tải */
  imageUrl?: string | null;
};

export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(price)}₫`;
}
