import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORIES, formatPrice, productsInCategory, SHOP } from "@/lib/catalog";

export const Route = createFileRoute("/bang-gia")({
  head: () => ({
    meta: [
      { title: "Bảng giá gạch ốp lát 2026 — QT tiles" },
      {
        name: "description",
        content: "Bảng giá tham khảo gạch lát nền, ốp tường, giả gỗ, gạch bông tại QT tiles TP. Hồ Chí Minh.",
      },
      { property: "og:title", content: "Bảng giá gạch ốp lát — QT tiles" },
      { property: "og:description", content: "Giá tham khảo theo m² cho từng mẫu gạch. Liên hệ để có giá sỉ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricePage,
});

function PricePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Bảng giá</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Bảng giá gạch ốp lát</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Giá tham khảo theo m², chưa gồm vận chuyển và thi công. Công trình số lượng lớn vui lòng gọi
        để nhận giá sỉ tốt nhất.
      </p>

      <div className="mt-10 space-y-10">
        {CATEGORIES.map((c) => (
          <section key={c.id} className="overflow-hidden rounded-lg border bg-card shadow-tile">
            <div className="flex items-center justify-between gap-4 border-b bg-muted/60 px-4 py-3 sm:px-6">
              <h2 className="text-lg font-bold">{c.name}</h2>
              <Link
                to="/san-pham"
                search={{ loai: c.id }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Xem mẫu →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium sm:px-6">Tên sản phẩm</th>
                    <th className="px-4 py-3 font-medium">Kích thước</th>
                    <th className="px-4 py-3 font-medium">Bề mặt</th>
                    <th className="px-4 py-3 text-right font-medium sm:px-6">Giá / m²</th>
                  </tr>
                </thead>
                <tbody>
                  {productsInCategory(c.id).map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-3 font-medium sm:px-6">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.size}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.finish}</td>
                      <td className="px-4 py-3 text-right font-display font-bold text-primary sm:px-6">
                        {formatPrice(p.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 rounded-xl bg-secondary p-8 text-center text-secondary-foreground">
        <p className="text-lg font-semibold">Không thấy mẫu bạn cần? Kho còn hơn 500 mẫu khác.</p>
        <Button asChild size="xl">
          <a href={SHOP.phoneHref}>
            <Phone /> Gọi {SHOP.phone}
          </a>
        </Button>
      </div>
    </div>
  );
}
