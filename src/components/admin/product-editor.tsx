import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { productPhoto, type Category, type Product } from "@/lib/catalog";
import { isValidName, parseCategory, parsePriceInput } from "@/lib/product-form";
import { slugify, uniqueSlug } from "@/lib/slug";
import { IMAGE_BUCKET, objectPathFor } from "@/lib/product-media";

export function ProductEditor({ product, categories, products, refresh, close }: { product?: Product | undefined; categories: Category[]; products: Product[]; refresh: () => Promise<void>; close: () => void }) {
  const [form, setForm] = useState({ name: product?.name ?? "", category: product?.category ?? categories[0]?.slug ?? "", size: product?.size ?? "", finish: product?.finish ?? "", color: product?.color ?? "", origin: product?.origin ?? "Việt Nam", price: String(product?.price ?? ""), tag: product?.tag ?? "", description: product?.description ?? "", order: String(product?.sortOrder ?? Math.max(0, ...products.map((p) => p.sortOrder)) + 1) });
  const [files, setFiles] = useState<File[]>([]);
  const [replacePhoto, setReplacePhoto] = useState<File | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const save = useMutation({
    mutationFn: async () => {
      const price = parsePriceInput(form.price);
      if (!isValidName(form.name)) throw new Error("Tên mẫu gạch cần 2–120 ký tự");
      if (price === null) throw new Error("Giá phải lớn hơn 0");
      if (!parseCategory(form.category, categories)) throw new Error("Chọn danh mục hiện có");
      const uploaded: string[] = [];
      let imagePath = product?.imagePath ?? null;
      try {
        for (const file of [...(replacePhoto ? [replacePhoto] : []), ...files]) {
          const path = `${crypto.randomUUID()}/${objectPathFor(form.name, file)}`;
          const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { contentType: file.type });
          if (error) throw error;
          uploaded.push(path);
        }
        if (replacePhoto) imagePath = uploaded.shift() ?? imagePath;
        if (!imagePath) imagePath = uploaded.shift() ?? null;
        const values = { name: form.name.trim(), category: form.category, size: form.size.trim() || "—", finish: form.finish.trim(), color: form.color.trim(), origin: form.origin.trim(), price, tag: form.tag.trim() || null, description: form.description.trim(), sort_order: Number(form.order) || 0, image_path: imagePath, gallery: [...(product?.gallery ?? []).filter((p) => !removed.includes(p)), ...uploaded] };
        const result = product ? await supabase.from("products").update(values).eq("id", product.id).select("id").single() : await supabase.from("products").insert({ ...values, slug: uniqueSlug(slugify(form.name), products.map((p) => p.slug)) }).select("id").single();
        if (result.error) throw result.error;
      } catch (error) { throw error instanceof Error ? error : new Error("Không lưu được sản phẩm, vui lòng thử lại"); }
    },
    onSuccess: async () => { await refresh(); toast.success(product ? "Đã lưu sản phẩm" : "Đã thêm sản phẩm"); close(); },
    onError: (error) => toast.error(error.message),
  });
  const remove = useMutation({ mutationFn: async () => { if (!product) return; const { error } = await supabase.from("products").delete().eq("id", product.id).select("id").single(); if (error) throw error; }, onSuccess: async () => { await refresh(); close(); toast.success("Đã xóa sản phẩm"); }, onError: () => toast.error("Không xóa được sản phẩm") });
  const fields = [{ key: "name", label: "Tên mẫu gạch" }, { key: "price", label: "Giá / m² (VNĐ)" }, { key: "size", label: "Kích thước" }, { key: "color", label: "Màu sắc" }, { key: "finish", label: "Bề mặt" }, { key: "origin", label: "Xuất xứ" }, { key: "tag", label: "Nhãn" }, { key: "order", label: "Thứ tự hiển thị" }] as const;
  return <form aria-label={product ? `Sửa ${product.name}` : "Mẫu gạch mới"} onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="border bg-card p-4 sm:p-6">
    <div className="flex items-start justify-between gap-4"><h2 className="text-3xl">{product ? "Sửa mẫu gạch" : "Mẫu gạch mới"}</h2><Button type="button" variant="ghost" size="icon" aria-label="Đóng mẫu gạch" onClick={close}><X /></Button></div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map((field) => <div key={field.key}><Label htmlFor={`product-${field.key}`}>{field.label}</Label><Input className="mt-2" id={`product-${field.key}`} value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} required={field.key === "name" || field.key === "price"} /></div>)}
      <div><Label htmlFor="product-category">Danh mục</Label><Select value={form.category} onValueChange={(category) => setForm({ ...form, category })}><SelectTrigger id="product-category" className="mt-2 w-full"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="sm:col-span-2"><Label htmlFor="product-description">Mô tả sản phẩm</Label><Textarea className="mt-2" id="product-description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      {product && <img src={productPhoto(product, categories.find((c) => c.slug === form.category))} alt={product.name} className="size-28 object-cover" />}
      <div><Label htmlFor="product-main-photo">Ảnh chính</Label><Input className="mt-2" id="product-main-photo" type="file" accept="image/*" onChange={(e) => setReplacePhoto(e.target.files?.[0] ?? null)} /></div>
      <div><Label htmlFor="product-gallery">Ảnh bổ sung</Label><Input className="mt-2" id="product-gallery" type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} /></div>
    </div>
    {product && <div className="mt-4 flex flex-wrap gap-3">{product.gallery.filter((path) => !removed.includes(path)).map((path, i) => <div key={path} className="flex items-center gap-2 border p-2"><span className="text-xs">Ảnh bổ sung {i + 1}</span><Button type="button" variant="ghost" size="icon" aria-label={`Bỏ ảnh bổ sung ${i + 1}`} onClick={() => setRemoved([...removed, path])}><X /></Button></div>)}</div>}
    <div className="mt-6 flex flex-wrap justify-end gap-2">{product && (confirm ? <><Button type="button" variant="outline" onClick={() => setConfirm(false)}>Hủy xóa</Button><Button type="button" variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate()}>Xác nhận xóa</Button></> : <Button type="button" variant="ghost" onClick={() => setConfirm(true)}><Trash2 />Xóa sản phẩm</Button>)}<Button type="submit" disabled={save.isPending}>{product ? <Save /> : <Plus />}{save.isPending ? "Đang lưu…" : product ? "Lưu thay đổi" : "Thêm vào danh sách"}</Button></div>
  </form>;
}
