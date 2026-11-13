import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shopQueryOptions } from "@/hooks/use-shop";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SETTINGS, digitsOnly, type ShopSettings } from "@/lib/shop";

const FIELDS: { key: keyof ShopSettings; label: string; long?: boolean }[] = [
  { key: "phone", label: "Số điện thoại (hotline)" },
  { key: "zalo", label: "Số Zalo" },
  { key: "address", label: "Địa chỉ showroom" },
  { key: "hours", label: "Giờ mở cửa" },
  { key: "slogan", label: "Slogan (hiện ở trang chủ và chân trang)", long: true },
];

export function ShopSettingsForm() {
  const client = useQueryClient();
  const { data } = useQuery(shopQueryOptions);
  const [form, setForm] = useState<ShopSettings>(data ?? DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setForm(data); }, [data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (digitsOnly(form.phone).length < 8) { toast.error("Số điện thoại chưa đúng."); return; }
    if (form.zalo && digitsOnly(form.zalo).length < 8) { toast.error("Số Zalo chưa đúng."); return; }
    setSaving(true);
    const values = { phone: form.phone.trim(), zalo: form.zalo.trim(), address: form.address.trim(), hours: form.hours.trim(), slogan: form.slogan.trim(), updated_at: new Date().toISOString() };
    const { error } = await supabase.from("shop_settings").upsert({ id: true, ...values });
    setSaving(false);
    if (error) { toast.error("Chưa lưu được. Vui lòng thử lại."); return; }
    await client.invalidateQueries({ queryKey: ["shop"] });
    toast.success("Đã lưu thông tin cửa hàng.");
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      {FIELDS.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label htmlFor={`shop-${f.key}`}>{f.label}</Label>
          {f.long ? (
            <Textarea id={`shop-${f.key}`} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} rows={2} />
          ) : (
            <Input id={`shop-${f.key}`} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          )}
        </div>
      ))}
      <Button type="submit" disabled={saving}>{saving ? "Đang lưu…" : "Lưu thông tin"}</Button>
    </form>
  );
}
