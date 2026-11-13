import { SHOP as FALLBACK } from "./catalog";

export type ShopSettings = { phone: string; zalo: string; address: string; hours: string; slogan: string };

export type Shop = ShopSettings & { name: string; phoneHref: string; zaloHref: string };

export const DEFAULT_SETTINGS: ShopSettings = {
  phone: FALLBACK.phone,
  zalo: "0909123456",
  address: FALLBACK.address,
  hours: FALLBACK.hours,
  slogan: "Gạch ốp lát chính hãng cho nhà phố, căn hộ và công trình tại Sài Gòn.",
};

/** Chỉ giữ chữ số (và dấu + đầu số) để tạo đường gọi / Zalo. */
export function digitsOnly(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

export function toShop(s: ShopSettings): Shop {
  const zalo = digitsOnly(s.zalo || s.phone);
  return { ...s, name: FALLBACK.name, phoneHref: `tel:${digitsOnly(s.phone)}`, zaloHref: `https://zalo.me/${zalo}` };
}
