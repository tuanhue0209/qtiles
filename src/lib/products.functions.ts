import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { isCategoryId, type CategoryId, type Product } from "./catalog";
import { IMAGE_BUCKET } from "./product-media";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  size: string;
  finish: string;
  origin: string;
  price: number;
  tag: string | null;
  image_path: string | null;
  sort_order: number;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: isCategoryId(row.category) ? row.category : ("lat-nen" as CategoryId),
    size: row.size,
    finish: row.finish,
    origin: row.origin,
    price: row.price,
    tag: row.tag,
    sortOrder: row.sort_order,
    imagePath: row.image_path,
  };
}

/**
 * Danh sách gạch cho khách xem: đọc từ kho dữ liệu, kèm địa chỉ ảnh xem được.
 * Chạy trên server nên trang vẫn hiện nội dung khi tải lần đầu.
 */
export const listProducts = createServerFn({ method: "GET" }).handler(async (): Promise<Product[]> => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Thiếu cấu hình kho dữ liệu");

  const client = createClient<Database>(url, key, {
    auth: { persistSession: false },
    // Key mới là chuỗi opaque, không phải JWT: chỉ gửi apikey.
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data, error } = await client
    .from("products")
    .select("id, name, category, size, finish, origin, price, tag, image_path, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as ProductRow[];
  const paths = rows
    .map((r) => r.image_path)
    .filter((p): p is string => Boolean(p && p.length > 0));

  const photoUrls = new Map<string, string>();
  if (paths.length > 0) {
    try {
      const { data: signed } = await client.storage
        .from(IMAGE_BUCKET)
        .createSignedUrls(paths, 60 * 60);
      (signed ?? []).forEach((entry, i) => {
        if (entry?.signedUrl) photoUrls.set(paths[i], entry.signedUrl);
      });
    } catch {
      // Không có ảnh vẫn ổn: thẻ sản phẩm sẽ dùng ảnh minh họa của loại gạch.
    }
  }

  return rows.map((row) => ({
    ...toProduct(row),
    imageUrl: row.image_path ? (photoUrls.get(row.image_path) ?? null) : null,
  }));
});
