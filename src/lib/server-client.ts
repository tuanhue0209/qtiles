import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/**
 * Client đọc dữ liệu công khai, chỉ tạo bên trong server function.
 * Khoá publishable đời mới là chuỗi opaque (không phải JWT) nên chỉ gửi apikey.
 */
export function createPublishableClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Thiếu cấu hình kho dữ liệu");

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
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
}
