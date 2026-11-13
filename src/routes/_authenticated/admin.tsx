import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BulkImport } from "@/components/admin/bulk-import";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQueryOptions, productsQueryOptions } from "@/lib/products.query";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Nhập sản phẩm hàng loạt — QT tiles" }, { name: "description", content: "Quản lý nhập sản phẩm gạch QT tiles từ CSV và nhiều ảnh." }, { property: "og:title", content: "Nhập sản phẩm hàng loạt — QT tiles" }, { property: "og:description", content: "Công cụ quản lý hàng loạt dành cho chủ cửa hàng QT tiles." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});
function AdminPage() {
  const client = useQueryClient();
  const admin = useQuery({ queryKey: ["me", "is-admin"], queryFn: async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return false; const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id); if (error) throw error; return data.some((row) => row.role === "admin"); } });
  const products = useQuery(productsQueryOptions);
  const categories = useQuery(categoriesQueryOptions);
  async function refresh() { await Promise.all([client.invalidateQueries({ queryKey: ["products"] }), client.invalidateQueries({ queryKey: ["product"] })]); }
  if (admin.isPending) return <p className="mx-auto max-w-6xl px-4 py-16">Đang kiểm tra tài khoản…</p>;
  if (!admin.data) return <h1 className="px-4 py-20 text-center text-3xl">Tài khoản này chưa có quyền quản lý</h1>;
  return <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl sm:text-5xl">Quản lý sản phẩm gạch</h1><Button asChild variant="outline"><Link to="/quan-ly">Quản lý cửa hàng</Link></Button></div><div className="mt-10">{products.isError || categories.isError ? <p role="alert" className="text-destructive">Không tải được danh sách; vui lòng tải lại trang.</p> : products.isPending || categories.isPending ? <p>Đang tải sản phẩm…</p> : <BulkImport products={products.data} categories={categories.data} refresh={refresh} />}</div></div>;
}