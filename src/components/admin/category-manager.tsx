import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { categoryPhoto, type Category, type Product } from "@/lib/catalog";
import { slugify, uniqueSlug } from "@/lib/slug";
import { IMAGE_BUCKET, objectPathFor } from "@/lib/product-media";

export function CategoryManager({ categories, products, refresh }: { categories: Category[]; products: Product[]; refresh: () => Promise<void> }) {
  const [name, setName] = useState("");
  const add = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 2) throw new Error("Tên danh mục cần ít nhất 2 ký tự");
      const { error } = await supabase.from("categories").insert({ name: name.trim(), slug: uniqueSlug(slugify(name), categories.map((c) => c.slug)), sort_order: Math.max(0, ...categories.map((c) => c.sortOrder)) + 1 });
      if (error) throw error;
    },
    onSuccess: async () => { setName(""); await refresh(); toast.success("Đã thêm danh mục"); },
    onError: () => toast.error("Không thêm được danh mục. Kiểm tra tên hoặc thử lại."),
  });
  return <div className="space-y-6">
    <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="flex flex-wrap items-end gap-3 border-b pb-6">
      <div className="min-w-0 flex-1"><Label htmlFor="new-category-name">Tên danh mục mới</Label><Input id="new-category-name" className="mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Gạch sân vườn" required minLength={2} maxLength={120} /></div>
      <Button type="submit" disabled={add.isPending}><Plus />Thêm danh mục</Button>
    </form>
    <div className="grid gap-4 md:grid-cols-2">{categories.map((c) => <CategoryEditor key={c.id} category={c} count={products.filter((p) => p.category === c.slug).length} refresh={refresh} />)}</div>
  </div>;
}
function CategoryEditor({ category, count, refresh }: { category: Category; count: number; refresh: () => Promise<void> }) {
  const [name, setName] = useState(category.name);
  const [short, setShort] = useState(category.short);
  const [order, setOrder] = useState(String(category.sortOrder));
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  async function save(file?: File) {
    if (name.trim().length < 2) { toast.error("Tên danh mục cần ít nhất 2 ký tự"); return; }
    setBusy(true);
    try {
      let path = category.imagePath;
      if (file) { path = `danh-muc/${objectPathFor(name, file)}`; const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { contentType: file.type }); if (error) throw error; }
      const { error } = await supabase.from("categories").update({ name: name.trim(), short: short.trim(), sort_order: Number(order) || 0, image_path: path }).eq("id", category.id).select("id").single();
      if (error) throw error;
      await refresh(); toast.success("Đã lưu danh mục");
    } catch { toast.error("Không lưu được danh mục, vui lòng thử lại"); } finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true);
    try { const { error } = await supabase.from("categories").delete().eq("id", category.id).select("id").single(); if (error) throw error; await refresh(); toast.success("Đã xóa danh mục"); }
    catch { toast.error("Chưa xóa được: hãy chuyển các sản phẩm sang danh mục khác trước."); } finally { setBusy(false); }
  }
  return <article className="border bg-card p-4" aria-label={`Danh mục ${category.name}`}>
    <div className="flex gap-4"><img src={categoryPhoto(category)} alt={category.name} className="size-20 shrink-0 object-cover" /><div className="min-w-0 flex-1"><Label htmlFor={`cat-name-${category.id}`}>Tên danh mục</Label><Input id={`cat-name-${category.id}`} value={name} onChange={(e) => setName(e.target.value)} className="mt-2" /><p className="mt-2 text-xs text-muted-foreground">{count} sản phẩm</p></div></div>
    <div className="mt-4 grid gap-3"><Label htmlFor={`cat-short-${category.id}`}>Mô tả ngắn</Label><Input id={`cat-short-${category.id}`} value={short} onChange={(e) => setShort(e.target.value)} /><Label htmlFor={`cat-order-${category.id}`}>Thứ tự hiển thị</Label><Input id={`cat-order-${category.id}`} type="number" value={order} onChange={(e) => setOrder(e.target.value)} /><Label htmlFor={`cat-photo-${category.id}`}>Ảnh danh mục</Label><Input id={`cat-photo-${category.id}`} type="file" accept="image/*" disabled={busy} onChange={(e) => { const file = e.target.files?.[0]; if (file) void save(file); e.target.value = ""; }} /></div>
    {count > 0 && <p className="mt-4 text-xs text-muted-foreground">Chuyển {count} sản phẩm sang danh mục khác trước khi xóa.</p>}
    <div className="mt-4 flex flex-wrap justify-end gap-2">{confirm ? <><Button variant="outline" onClick={() => setConfirm(false)}>Hủy</Button><Button variant="destructive" disabled={busy} onClick={() => void remove()}>Xác nhận xóa</Button></> : <><Button variant="ghost" disabled={count > 0 || busy} onClick={() => setConfirm(true)}><Trash2 />Xóa</Button><Button disabled={busy} onClick={() => void save()}><Save />Lưu danh mục</Button></>}</div>
  </article>;
}
