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
  tag?: string;
};

// Prices are sample values until the owner provides the real price list.
export const PRODUCTS: Product[] = [
  { id: "ln-01", name: "Porcelain vân đá Marble Xám", category: "lat-nen", size: "80 × 80 cm", finish: "Bóng kiếng", origin: "Việt Nam", price: 285000, tag: "Bán chạy" },
  { id: "ln-02", name: "Porcelain Kem Sữa", category: "lat-nen", size: "60 × 60 cm", finish: "Mờ", origin: "Việt Nam", price: 195000 },
  { id: "ln-03", name: "Granite Trắng Vân Mây", category: "lat-nen", size: "60 × 120 cm", finish: "Bóng kiếng", origin: "Ấn Độ", price: 420000, tag: "Cao cấp" },
  { id: "ln-04", name: "Porcelain Xi Măng Ghi", category: "lat-nen", size: "60 × 60 cm", finish: "Mờ nhám", origin: "Việt Nam", price: 215000 },

  { id: "ot-01", name: "Gạch thẻ men Kem Subway", category: "op-tuong", size: "7.5 × 15 cm", finish: "Men bóng", origin: "Việt Nam", price: 260000 },
  { id: "ot-02", name: "Ốp tường Trắng Sứ", category: "op-tuong", size: "30 × 60 cm", finish: "Men bóng", origin: "Việt Nam", price: 165000, tag: "Giá tốt" },
  { id: "ot-03", name: "Ốp tường Xanh Rêu", category: "op-tuong", size: "30 × 60 cm", finish: "Men mờ", origin: "Tây Ban Nha", price: 390000 },

  { id: "gg-01", name: "Giả gỗ Sồi Tự Nhiên", category: "gia-go", size: "20 × 120 cm", finish: "Mờ vân sần", origin: "Việt Nam", price: 245000, tag: "Bán chạy" },
  { id: "gg-02", name: "Giả gỗ Óc Chó", category: "gia-go", size: "15 × 90 cm", finish: "Mờ", origin: "Việt Nam", price: 225000 },
  { id: "gg-03", name: "Giả gỗ Xương Cá", category: "gia-go", size: "15 × 60 cm", finish: "Mờ", origin: "Ấn Độ", price: 310000 },

  { id: "gb-01", name: "Gạch bông Hoa Sen Đỏ Gạch", category: "gach-bong", size: "20 × 20 cm", finish: "Xi măng", origin: "Việt Nam", price: 340000, tag: "Thủ công" },
  { id: "gb-02", name: "Gạch bông Caro Xanh Lá", category: "gach-bong", size: "20 × 20 cm", finish: "Xi măng", origin: "Việt Nam", price: 320000 },
  { id: "gb-03", name: "Gạch bông men Hoa Văn", category: "gach-bong", size: "20 × 20 cm", finish: "Men mờ", origin: "Việt Nam", price: 280000 },

  { id: "gt-01", name: "Gạch thẻ Đất Nung Men Rạn", category: "gach-the", size: "6 × 24 cm", finish: "Men rạn bóng", origin: "Việt Nam", price: 360000 },
  { id: "gt-02", name: "Gạch thẻ Xanh Ngọc Thủ Công", category: "gach-the", size: "6.5 × 20 cm", finish: "Men bóng", origin: "Tây Ban Nha", price: 520000, tag: "Cao cấp" },

  { id: "sv-01", name: "Gạch sân vườn Đỏ Đất Nung", category: "san-vuon", size: "40 × 40 cm", finish: "Nhám chống trơn", origin: "Việt Nam", price: 145000, tag: "Giá tốt" },
  { id: "sv-02", name: "Gạch sân vườn Giả Đá Xám", category: "san-vuon", size: "60 × 60 cm", finish: "Nhám sần", origin: "Việt Nam", price: 205000 },
];

export function productsInCategory(category?: CategoryId): Product[] {
  return category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;
}

export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(price)}₫`;
}
