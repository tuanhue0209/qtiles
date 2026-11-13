import { createServerFn } from "@tanstack/react-start";

import { createPublishableClient } from "./server-client";
import { DEFAULT_SETTINGS, type ShopSettings } from "./shop";

export const getShopSettings = createServerFn({ method: "GET" }).handler(async (): Promise<ShopSettings> => {
  const { data, error } = await createPublishableClient()
    .from("shop_settings")
    .select("phone, zalo, address, hours, slogan")
    .maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return data;
});
