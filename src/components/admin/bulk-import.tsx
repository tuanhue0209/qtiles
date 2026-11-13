import { useEffect, useRef, useState } from "react";
import { Download, ImagePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/lib/catalog";
import { bulkImagePath, compressProductImage, CSV_COLUMNS, normalizeName, readProductCsv, validateCsvRows, type CsvRow } from "@/lib/bulk-products";
import { IMAGE_BUCKET } from "@/lib/product-media";
import { parsePriceInput } from "@/lib/product-form";
import { slugify, uniqueSlug } from "@/lib/slug";

export function BulkImport({ categories, products, refresh }: { categories: Category[]; products: Product[]; refresh: () => Promise<void> }) {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [images, setImages] = useState(new Map<string, string>());
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    async function load() {
      const found = new Map<string, string>();
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await supabase.storage.from(IMAGE_BUCKET).list("bulk", { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
        if (error) throw error;
        for (const item of data) if (item.name.endsWith(".webp")) {
          try { found.set(decodeURIComponent(item.name.slice(0, -5)), `bulk/${item.name}`); } catch { /* Ignore unrelated files. */ }
        }
        if (data.length < 100) break;
      }
      if (active) { setImages(found); setReady(true); }
    }
    void load().catch(() => { if (active) setMessages(["Chưa tải được kho ảnh; tải lại trang trước khi nhập."]); });
    return () => { active = false; };
  }, []);
  const checked = validateCsvRows(rows, categories, new Set(images.keys()), products);
  const valid = checked.filter((row) => row.errors.length === 0);

  async function upload(files: File[]) {
    if (busy || !ready) return;
    setBusy(true); setMessages([]);
    const next = new Map(images);
    const errors: string[] = [];
    for (const [index, file] of files.entries()) {
      setStatus(`Đang xử lý ảnh ${index + 1}/${files.length}`);
      try {
        if (!file.type.startsWith("image/")) throw new Error("Không phải file ảnh");
        const blob = await compressProductImage(file);
        const path = bulkImagePath(file.name);
        const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, { contentType: "image/webp", upsert: true, cacheControl: "0" });
        if (error) throw new Error("Không tải lên được ảnh");
        next.set(normalizeName(file.name), path);
      } catch (error) { errors.push(`${file.name}: ${error instanceof Error ? error.message : "Lỗi xử lý ảnh"}`); }
    }
    setImages(next); setMessages(errors); setStatus(`Đã tải ${files.length - errors.length}/${files.length} ảnh`);
    await refresh(); setBusy(false);
  }
  async function read(file: File | undefined) {
    if (!file) return;
    setMessages([]); setStatus("");
    try { setRows(readProductCsv(await file.text())); }
    catch (error) { setRows([]); setMessages([error instanceof Error ? error.message : "Không đọc được CSV"]); }
  }
  async function save() {
    setBusy(true); setMessages([]);
    const errors: string[] = [];
    const taken = products.map((p) => p.slug);
    let count = 0;
    const completed = new Set<number>();
    for (const row of valid) {
      setStatus(`Đang lưu ${count + 1}/${valid.length}`);
      const price = parsePriceInput(row.price);
      const path = images.get(normalizeName(row.image));
      if (price === null || !path) continue;
      const existing = products.find((p) => normalizeName(p.name) === normalizeName(row.name));
      const values = { name: row.name, category: row.category, size: row.size, finish: row.finish, price, tag: row.tag || null, image_path: path };
      const slug = uniqueSlug(slugify(row.name), taken);
      const result = existing ? await supabase.from("products").update(values).eq("id", existing.id).select("id").single() : await supabase.from("products").insert({ ...values, slug }).select("id").single();
      if (result.error) errors.push(`Dòng ${row.line}: Không lưu được sản phẩm`);
      else { count++; completed.add(row.line); if (!existing) taken.push(slug); }
    }
    setRows((previous) => previous.filter((row) => !completed.has(row.line)));
    setMessages(errors); setStatus(`Đã lưu ${count} sản phẩm`);
    await refresh(); setBusy(false);
  }
  function download() {
    const text = `\uFEFF${CSV_COLUMNS.join(",")}\n"Mẫu gạch mới","${categories[0]?.slug ?? "lat-nen"}","60 × 60 cm","Mờ",285000,"","mau-gach.jpg"\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "qt-tiles-mau.csv"; a.click(); URL.revokeObjectURL(url);
  }
  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-3xl">Nhập sản phẩm hàng loạt</h2><Button variant="outline" onClick={download}><Download />CSV mẫu</Button></div>
    <div className="grid gap-6 sm:grid-cols-2">
      <div><Label htmlFor="bulk-csv">File sản phẩm CSV</Label><Input id="bulk-csv" className="mt-3" type="file" accept=".csv,text/csv" disabled={busy} onChange={(e) => { void read(e.target.files?.[0]); e.target.value = ""; }} /></div>
      <div className="flex min-h-36 flex-col items-center justify-center gap-3 border-2 border-dashed bg-muted/30 p-5" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void upload(Array.from(e.dataTransfer.files)); }} aria-label="Kéo thả ảnh sản phẩm">
        <ImagePlus className="size-6 text-muted-foreground" /><Button variant="outline" disabled={busy || !ready} onClick={() => input.current?.click()}><Upload />Chọn nhiều ảnh</Button>
        <Input ref={input} aria-label="Ảnh nhập hàng loạt" type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void upload(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
        <span className="text-sm text-muted-foreground">{images.size} ảnh trong kho</span>
      </div>
    </div>
    {status && <p role="status" className="text-sm font-medium">{status}</p>}
    {messages.length > 0 && <ul role="alert" className="space-y-1 text-sm text-destructive">{messages.map((message, i) => <li key={i}>{message}</li>)}</ul>}
    {rows.length > 0 && <><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm">{valid.length} dòng hợp lệ · {checked.length - valid.length} dòng lỗi</p><Button disabled={busy || !ready || !valid.length} onClick={() => { void save(); }}><Upload />{busy ? "Đang xử lý…" : `Lưu ${valid.length} sản phẩm hợp lệ`}</Button></div><div className="overflow-x-auto border-y"><table className="w-full text-left text-sm"><thead className="border-b"><tr>{["Dòng", "Tên", "Danh mục", "Ảnh", "Trạng thái"].map((label) => <th className="p-3" key={label}>{label}</th>)}</tr></thead><tbody>{checked.map((row) => <tr className="border-b" key={row.line}><td className="p-3">{row.line}</td><td className="min-w-40 p-3">{row.name}</td><td className="p-3">{categories.find((c) => c.slug === row.category)?.name ?? row.category}</td><td className="p-3">{row.image || "—"}</td><td className={`min-w-40 p-3 ${row.errors.length ? "text-destructive" : "text-muted-foreground"}`}>{row.errors.join(" · ") || (products.some((p) => normalizeName(p.name) === normalizeName(row.name)) ? "Cập nhật" : "Tạo mới")}</td></tr>)}</tbody></table></div></>}
  </section>;
}