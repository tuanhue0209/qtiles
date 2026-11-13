import { queryOptions, useQuery } from "@tanstack/react-query";

import { getShopSettings } from "@/lib/shop.functions";
import { DEFAULT_SETTINGS, toShop, type Shop } from "@/lib/shop";

export const shopQueryOptions = queryOptions({
  queryKey: ["shop"],
  queryFn: () => getShopSettings(),
});

export function useShop(): Shop {
  const { data } = useQuery(shopQueryOptions);
  return toShop(data ?? DEFAULT_SETTINGS);
}
