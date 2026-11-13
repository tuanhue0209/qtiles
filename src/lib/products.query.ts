import { queryOptions } from "@tanstack/react-query";

import { getProductPage, listCategories, listProducts } from "./products.functions";

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

export const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
});

export function productPageQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductPage({ data: { slug } }),
  });
}
