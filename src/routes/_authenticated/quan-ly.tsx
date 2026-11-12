import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, formatPrice, getCategory, type CategoryId, type Product } from "@/lib/catalog";
import { isValidName, parseCategory, parsePriceInput } from "@/lib/product-form";
import { IMAGE_BUCKET, objectPathFor } from "@/lib/product-media";
import { productsQueryOptions } from "@/lib/products.query";

const adminCheckOptions = queryOptions({
  queryKey: ["me", "is-admin"],
  queryFn: async (): Promise<boolean> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    return (data ?? []).some((row) => row.role === "admin");
  },
});

export const Route = createFileRoute("/_authenticated/quan-ly")({
  head: () => ({
    meta: [
      { title: "Quản lý sản phẩm — QT tiles" },
      { name: "description", content: "Sửa giá, đổi tên, thêm hoặc xóa mẫu gạch của QT tiles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { data: isAdmin, isPending: checkingAdmin } = useQuery(adminCheckOptions);
  const { data: products, isPending } = useQuery(productsQueryOptions);
  const [adding, setAdding] = useState(false);

  if (checkingAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Tài khoản này chưa có quyền sửa sản phẩm</h1>
        <p className="mt-3 text-muted-foreground">
          Chỉ tài khoản quản lý của cửa hàng mới thêm, sửa hay xóa mẫu gạch. Hãy đăng xuất và đăng
          nhập bằng tài khoản quản lý.
        </p>
      </div>
    );
  }

  async function refreshProducts() {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Quản lý</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Sản phẩm gạch</h1>
      <p className="mt-3 text-muted-foreground">
        {isPending ? "Đang tải danh sách…" : `${products?.length ?? 0} mẫu đang hiển thị trên web.`}{" "}
        Sửa xong nhớ bấm “Lưu” ở cuối mỗi mẫu.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button onClick={() => setAdding((v) => !v)} variant={adding ? "outline" : "default"}>
          {adding ? (
            "Đóng form thêm mẫu"
          ) : (
            <>
              <Plus /> Thêm mẫu gạch
            </>
          )}
        </Button>
      </div>

      {adding && <AddProductForm onAdded={refreshProducts} nextOrder={(products ?? []).map((p) => p.sortOrder)} />}

      <div className="mt-8 space-y-4">
        {(products ?? []).map((product) => (
          <ProductRow key={product.id} product={product} onSaved={refreshProducts} />
        ))}
      </div>
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
  id,
}: {
  value: CategoryId;
  onChange: (value: CategoryId) => void;
  id: string;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(parseCategory(next) ?? value)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Chọn loại gạch" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ProductRow({
  product,
  onSaved,
}: {
  product: Product;
  onSaved: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState<CategoryId>(product.category);
  const [size, setSize] = useState(product.size);
  const [finish, setFinish] = useState(product.finish);
  const [origin, setOrigin] = useState(product.origin);
  const [price, setPrice] = useState(String(product.price));
  const [tag, setTag] = useState(product.tag ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);

  const parsedPrice = parsePriceInput(price);
  const dirty =
    name !== product.name ||
    category !== product.category ||
    size !== product.size ||
    finish !== product.finish ||
    origin !== product.origin ||
    parsedPrice !== product.price ||
    (tag.trim() || null) !== (product.tag ?? null);

  const save = useMutation({
    mutationFn: async () => {
      if (!isValidName(name)) throw new Error("Tên mẫu gạch cần ít nhất 2 ký tự");
      if (parsedPrice === null) throw new Error("Giá phải là số lớn hơn 0, ví dụ 285000");
      const { error } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          category,
          size: size.trim(),
          finish: finish.trim(),
          origin: origin.trim(),
          price: parsedPrice,
          tag: tag.trim() || null,
        })
        .eq("id", product.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await onSaved();
      toast.success(`Đã lưu “${name.trim()}” — ${formatPrice(parsedPrice ?? 0)}/m²`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không lưu được"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await onSaved();
      toast.success("Đã xóa mẫu gạch");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không xóa được"),
  });

  async function handlePhoto(file: File) {
    setUploading(true);
    try {
      const path = objectPathFor(product.name, file);
      const { error: uploadError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

      const { error: updateError } = await supabase
        .from("products")
        .update({ image_path: path })
        .eq("id", product.id);
      if (updateError) throw new Error(updateError.message);

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Đã cập nhật ảnh cho mẫu này");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải ảnh lên được");
    } finally {
      setUploading(false);
    }
  }

  const photo = product.imageUrl ?? getCategory(category).image;

  return (
    <section className="rounded-lg border bg-card p-4 shadow-tile sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="relative block size-28 shrink-0 cursor-pointer overflow-hidden rounded-md border bg-muted">
          <img src={photo} alt={product.name} className="size-full object-cover" />
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-1 text-[11px] font-medium text-white">
            {uploading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <ImagePlus className="size-3" />
            )}
            Đổi ảnh
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handlePhoto(file);
              event.target.value = "";
            }}
          />
        </label>

        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor={`name-${product.id}`}>Tên mẫu gạch</Label>
            <Input
              id={`name-${product.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor={`category-${product.id}`}>Loại gạch</Label>
            <div className="mt-1.5">
              <CategorySelect
                id={`category-${product.id}`}
                value={category}
                onChange={setCategory}
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`price-${product.id}`}>Giá / m² (VNĐ)</Label>
            <Input
              id={`price-${product.id}`}
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1.5"
            />
            {parsedPrice === null && (
              <p className="mt-1 text-xs text-destructive">Giá phải là số lớn hơn 0</p>
            )}
          </div>

          <div>
            <Label htmlFor={`size-${product.id}`}>Kích thước</Label>
            <Input
              id={`size-${product.id}`}
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor={`finish-${product.id}`}>Bề mặt</Label>
            <Input
              id={`finish-${product.id}`}
              value={finish}
              onChange={(e) => setFinish(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor={`origin-${product.id}`}>Xuất xứ</Label>
            <Input
              id={`origin-${product.id}`}
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor={`tag-${product.id}`}>Nhãn (bỏ trống nếu không có)</Label>
            <Input
              id={`tag-${product.id}`}
              value={tag}
              placeholder="Bán chạy, Giá tốt…"
              onChange={(e) => setTag(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {confirmDelete ? (
          <>
            <span className="mr-auto text-sm text-muted-foreground">Xóa mẫu này khỏi web?</span>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Không
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
            >
              <Trash2 /> Xóa luôn
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Xóa
            </Button>
            <Button
              size="sm"
              disabled={!dirty || save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending && <Loader2 className="animate-spin" />}
              {dirty ? "Lưu thay đổi" : "Đã lưu"}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

function AddProductForm({
  onAdded,
  nextOrder,
}: {
  onAdded: () => Promise<void>;
  nextOrder: number[];
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId>("lat-nen");
  const [size, setSize] = useState("");
  const [finish, setFinish] = useState("");
  const [origin, setOrigin] = useState("Việt Nam");
  const [price, setPrice] = useState("");
  const [tag, setTag] = useState("");

  const parsedPrice = parsePriceInput(price);
  const sortOrder = (nextOrder.length > 0 ? Math.max(...nextOrder) : 0) + 1;

  const add = useMutation({
    mutationFn: async () => {
      if (!isValidName(name)) throw new Error("Tên mẫu gạch cần ít nhất 2 ký tự");
      if (parsedPrice === null) throw new Error("Giá phải là số lớn hơn 0, ví dụ 285000");
      const { error } = await supabase.from("products").insert({
        name: name.trim(),
        category,
        size: size.trim() || "—",
        finish: finish.trim(),
        origin: origin.trim(),
        price: parsedPrice,
        tag: tag.trim() || null,
        sort_order: sortOrder,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await onAdded();
      toast.success(`Đã thêm “${name.trim()}” vào danh sách`);
      setName("");
      setSize("");
      setFinish("");
      setPrice("");
      setTag("");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không thêm được"),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        add.mutate();
      }}
      className="mt-6 rounded-lg border border-dashed bg-muted/40 p-4 sm:p-5"
    >
      <h2 className="text-lg font-bold">Mẫu gạch mới</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="new-name">Tên mẫu gạch</Label>
          <Input
            id="new-name"
            value={name}
            placeholder="Ví dụ: Porcelain Vân Đá Kem"
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="new-category">Loại gạch</Label>
          <div className="mt-1.5">
            <CategorySelect id="new-category" value={category} onChange={setCategory} />
          </div>
        </div>

        <div>
          <Label htmlFor="new-price">Giá / m² (VNĐ)</Label>
          <Input
            id="new-price"
            inputMode="numeric"
            value={price}
            placeholder="285000"
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1.5"
          />
          {price.length > 0 && parsedPrice === null && (
            <p className="mt-1 text-xs text-destructive">Giá phải là số lớn hơn 0</p>
          )}
        </div>

        <div>
          <Label htmlFor="new-size">Kích thước</Label>
          <Input
            id="new-size"
            value={size}
            placeholder="60 × 60 cm"
            onChange={(e) => setSize(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="new-finish">Bề mặt</Label>
          <Input
            id="new-finish"
            value={finish}
            placeholder="Bóng kiếng"
            onChange={(e) => setFinish(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="new-origin">Xuất xứ</Label>
          <Input
            id="new-origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="new-tag">Nhãn (bỏ trống nếu không có)</Label>
          <Input
            id="new-tag"
            value={tag}
            placeholder="Bán chạy"
            onChange={(e) => setTag(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={add.isPending}>
          {add.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
          Thêm vào danh sách
        </Button>
      </div>
    </form>
  );
}
