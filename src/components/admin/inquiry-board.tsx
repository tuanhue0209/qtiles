import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
export function InquiryBoard() {
  const client = useQueryClient();
  const { data = [], isPending, error } = useQuery({ queryKey: ["inquiries"], queryFn: async () => { const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; } });
  if (isPending) return <p>Đang tải yêu cầu…</p>;
  if (error) return <p>Chưa tải được yêu cầu báo giá.</p>;
  return <div className="space-y-4">{data.length === 0 && <p className="py-8 text-muted-foreground">Chưa có yêu cầu báo giá.</p>}{data.map((item) => <article key={item.id} className="border bg-card p-5"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl">{item.name}</h2><span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("vi-VN")}</span></div><p className="mt-2 font-medium">{item.product_name}</p><a className="mt-3 inline-block text-primary" href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}>{item.phone}</a>{item.email && <p className="mt-1 text-sm">{item.email}</p>}<p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{item.message}</p><Button className="mt-4" variant={item.status === "done" ? "outline" : "default"} onClick={async () => { const { error } = await supabase.from("inquiries").update({ status: item.status === "done" ? "new" : "done" }).eq("id", item.id); if (error) toast.error("Không cập nhật được yêu cầu"); else await client.invalidateQueries({ queryKey: ["inquiries"] }); }}>{item.status === "done" ? "Đã liên hệ · Mở lại" : "Đánh dấu đã liên hệ"}</Button></article>)}</div>;
}
