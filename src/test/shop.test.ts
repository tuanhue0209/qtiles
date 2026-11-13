import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, toShop } from "@/lib/shop";

describe("shop contact links", () => {
  it("builds call and Zalo links from what the owner types", () => {
    const shop = toShop({ ...DEFAULT_SETTINGS, phone: "0912 345 678", zalo: "0987.654.321" });
    expect(shop.phoneHref).toBe("tel:0912345678");
    expect(shop.zaloHref).toBe("https://zalo.me/0987654321");
  });
  it("falls back to the phone number when Zalo is empty", () => {
    expect(toShop({ ...DEFAULT_SETTINGS, phone: "0912 345 678", zalo: "" }).zaloHref).toBe("https://zalo.me/0912345678");
  });
});
