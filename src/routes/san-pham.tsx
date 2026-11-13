import { Outlet, createFileRoute } from "@tanstack/react-router";

import { categoriesQueryOptions, productsQueryOptions } from "@/lib/products.query";

/**
 * Khung chung cho trang sản phẩm: danh sách và trang chi tiết từng mẫu
 * đều dùng chung dữ liệu đã tải ở đây.
 */
export const Route = createFileRoute("/san-pham")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQueryOptions),
      context.queryClient.ensureQueryData(categoriesQueryOptions),
    ]),
  component: () => <Outlet />,
});
