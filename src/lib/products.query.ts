import { queryOptions } from "@tanstack/react-query";

import { listProducts } from "./products.functions";

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});
