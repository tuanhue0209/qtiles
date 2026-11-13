import { createServerFn } from "@tanstack/react-start";

import type { Category, Product } from "./catalog";
import { IMAGE_BUCKET } from "./product-media";
import { createPublishableClient } from "./server-client";

type Client = ReturnType<typeof createPublishableClient>;

const PRODUCT_SELECT =
  "id, name, category, size, finish, color, origin, price, tag, description, image_path, gallery, slug, sort_order";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  size: string;
  finish: string;
  color: string;
  origin: string;
  price: number;
  tag: string | null;
  description: string;
  image_path: string | null;
  gallery: string[] | null;
  slug: string | null;
  sort_order: number;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  short: string;
  image_path: string | null;
  sort_order: number;
};

function photoPaths(row: ProductRow): string[] {
  return [row.image_path, ...(row.gallery ?? [])].filter((p): p is string => Boolean(p));
}

function toProduct(row: ProductRow, urls: Map<string, string>): Product {
  const photos: string[] = [];
  for (const path of photoPaths(row)) {
    const url = urls.get(path);
    if (url) photos.push(url);
  }
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    name: row.name,
    category: row.category,
    size: row.size,
    finish: row.finish,
    color: row.color,
    origin: row.origin,
    price: row.price,
    tag: row.tag,
    description: row.description,
    sortOrder: row.sort_order,
    imagePath: row.image_path,
    gallery: row.gallery ?? [],
    photos,
  };
}

/** Đổi đường dẫn ảnh trong kho thành địa chỉ xem được một giờ. */
async function signPhotos(client: Client, paths: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p && p.length > 0)))];
  const urls = new Map<string, string>();
  if (unique.length === 0) return urls;

  try {
    const { data } = await client.storage.from(IMAGE_BUCKET).createSignedUrls(unique, 60 * 60);
    (data ?? []).forEach((entry, i) => {
      const path = unique[i];
      if (entry?.signedUrl && path) urls.set(path, entry.signedUrl);
    });
  } catch {
    // Không có ảnh vẫn ổn: trang sẽ dùng ảnh minh họa của danh mục.
  }
  return urls;
}

/** Danh sách gạch cho khách xem. Chạy trên server nên trang hiện nội dung ngay khi tải. */
export const listProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    const client = createPublishableClient();

    const { data, error } = await client
      .from("products")
      .select(PRODUCT_SELECT)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as unknown as ProductRow[];
    const urls = await signPhotos(client, rows.flatMap(photoPaths));
    return rows.map((row) => toProduct(row, urls));
  },
);

/** Danh mục gạch do cửa hàng tự thêm, sửa, xóa ở trang Quản lý. */
export const listCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    const client = createPublishableClient();

    const { data, error } = await client
      .from("categories")
      .select("id, slug, name, short, image_path, sort_order")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as unknown as CategoryRow[];
    const urls = await signPhotos(
      client,
      rows.map((r) => r.image_path ?? ""),
    );

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      short: row.short,
      sortOrder: row.sort_order,
      imagePath: row.image_path,
      imageUrl: row.image_path ? (urls.get(row.image_path) ?? null) : null,
    }));
  },
);

/** Một mẫu gạch kèm vài mẫu cùng danh mục. Trả về null nếu không có mẫu này. */
export const getProductPage = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => {
    const slug = (input as { slug?: unknown } | null)?.slug;
    return { slug: typeof slug === "string" ? slug.trim() : "" };
  })
  .handler(async ({ data }): Promise<{ product: Product; related: Product[] } | null> => {
    const client = createPublishableClient();

    const { data: row, error } = await client
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    const current = row as unknown as ProductRow;

    const { data: siblings, error: siblingError } = await client
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("category", current.category)
      .neq("id", current.id)
      .order("sort_order", { ascending: true })
      .limit(4);
    if (siblingError) throw new Error(siblingError.message);

    const relatedRows = (siblings ?? []) as unknown as ProductRow[];
    const urls = await signPhotos(client, [...photoPaths(current), ...relatedRows.flatMap(photoPaths)]);

    return {
      product: toProduct(current, urls),
      related: relatedRows.map((r) => toProduct(r, urls)),
    };
  });
