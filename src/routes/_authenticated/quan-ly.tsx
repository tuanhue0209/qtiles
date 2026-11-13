import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManager } from "@/components/admin/category-manager";
import { ProductEditor } from "@/components/admin/product-editor";
import { InquiryBoard } from "@/components/admin/inquiry-board";
import { ShopSettingsForm } from "@/components/admin/shop-settings-form";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, productPhoto, type Product } from "@/lib/catalog";
import { categoriesQueryOptions, productsQueryOptions } from "@/lib/products.query";
const adminCheckOptions = queryOptions({ queryKey: ["me", "is-admin"], queryFn: async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return false; const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id); if (error) throw error; return data.some((row) => row.role === "admin"); } });
export const Route = createFileRoute("/_authenticated/quan-ly")({
  head: () => ({ meta: [{ title: "Quản lý cửa hàng — QT tiles" }, { name: "description", content: "Quản lý danh mục, mẫu gạch và yêu cầu báo giá của QT tiles." }, { property: "og:title", content: "Quản lý cửa hàng — QT tiles" }, { property: "og:description", content: "Danh mục, sản phẩm và yêu cầu báo giá QT tiles." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: AdminProductsPage,
});
function AdminProductsPage() {
  const client = useQueryClient();
  const admin = useQuery(adminCheckOptions);
  const { data: products = [], error: productError } = useQuery(productsQueryOptions);
  const { data: categories = [], error: categoryError } = useQuery(categoriesQueryOptions);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [search, setSearch] = useState("");
  async function refresh() { await Promise.all([client.invalidateQueries({ queryKey: ["products"] }), client.invalidateQueries({ queryKey: ["categories"] }), client.invalidateQueries({ queryKey: ["product"] })]); }
  if (admin.isPending) return <p className="mx-auto max-w-6xl px-4 py-16">Đang kiểm tra tài khoản…</p>;
  if (!admin.data) return <div className="px-4 py-20 text-center"><h1 className="text-3xl">Tài khoản này chưa có quyền quản lý</h1><p className="mt-4">Vui lòng dùng tài khoản quản lý của cửa hàng.</p></div>;
  return <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><p className="eyebrow text-primary">Cửa hàng</p><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="mt-3 text-5xl">Quản lý QT tiles</h1><Button asChild variant="outline"><Link to="/admin">Nhập CSV và ảnh</Link></Button></div>
    {(productError || categoryError) && <p className="mt-4 text-destructive">Chưa tải được danh sách. Vui lòng tải lại trang.</p>}
    <Tabs defaultValue="products" className="mt-8"><TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 sm:w-auto"><TabsTrigger value="products">Sản phẩm ({products.length})</TabsTrigger><TabsTrigger value="categories">Danh mục ({categories.length})</TabsTrigger><TabsTrigger value="inquiries">Yêu cầu báo giá</TabsTrigger><TabsTrigger value="shop">Thông tin cửa hàng</TabsTrigger></TabsList>
      <TabsContent value="shop" className="mt-6"><ShopSettingsForm /></TabsContent>
      <TabsContent value="categories" className="mt-6"><CategoryManager categories={categories} products={products} refresh={refresh} /></TabsContent>
      <TabsContent value="inquiries" className="mt-6"><InquiryBoard /></TabsContent>
      <TabsContent value="products" className="mt-6"><div className="flex flex-wrap gap-3"><Input aria-label="Tìm sản phẩm" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mẫu gạch…" className="min-w-0 flex-1" /><Button disabled={categories.length === 0} onClick={() => setEditing("new")}><Plus />Thêm mẫu gạch</Button></div>
        {categories.length === 0 && <p className="mt-4 text-muted-foreground">Thêm danh mục trước khi thêm mẫu gạch.</p>}
        {editing && <div className="mt-6"><ProductEditor key={editing === "new" ? "new" : editing.id} product={editing === "new" ? undefined : editing} categories={categories} products={products} refresh={refresh} close={() => setEditing(null)} /></div>}
        <div className="mt-6 divide-y border-y">{products.filter((p) => p.name.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi"))).map((p) => <div key={p.id} className="flex items-center gap-3 py-4 sm:gap-5"><img src={productPhoto(p, categories.find((c) => c.slug === p.category))} alt={p.name} className="size-16 shrink-0 object-cover" /><div className="min-w-0 flex-1"><h2 className="text-xl sm:text-2xl">{p.name}</h2><p className="mt-1 text-xs text-muted-foreground">{categories.find((c) => c.slug === p.category)?.name} · {p.size}{p.origin ? ` · ${p.origin}` : ""}</p><p className="mt-1 text-sm text-primary">{formatPrice(p.price)}/m²</p></div><Button variant="outline" size="icon" aria-label={`Sửa ${p.name}`} onClick={() => { setEditing(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil /></Button></div>)}</div>
      </TabsContent>
    </Tabs>
  </div>;
}
