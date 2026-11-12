import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SHOP } from "@/lib/catalog";

export const Route = createFileRoute("/lien-he")({
  head: () => ({
    meta: [
      { title: "Liên hệ QT tiles — Gạch ốp lát Sài Gòn" },
      {
        name: "description",
        content: `Gọi ${SHOP.phone} hoặc nhắn Zalo để được tư vấn và báo giá gạch ốp lát tại TP. Hồ Chí Minh.`,
      },
      { property: "og:title", content: "Liên hệ QT tiles" },
      { property: "og:description", content: "Số điện thoại, Zalo, địa chỉ showroom và giờ mở cửa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="bg-grout">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Liên hệ</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Gọi là có người tư vấn ngay</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Báo giá, kiểm tra hàng tồn, hẹn xem mẫu tại showroom — liên hệ QT tiles qua điện thoại
          hoặc Zalo.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-primary p-8 text-primary-foreground shadow-lift">
            <Phone className="size-7" />
            <p className="mt-6 text-sm uppercase tracking-widest text-primary-foreground/75">
              Hotline
            </p>
            <a href={SHOP.phoneHref} className="mt-1 block font-display text-4xl font-bold">
              {SHOP.phone}
            </a>
            <Button asChild variant="forest" size="lg" className="mt-6">
              <a href={SHOP.phoneHref}>Gọi ngay</a>
            </Button>
          </div>

          <div className="rounded-xl bg-forest p-8 text-forest-foreground shadow-lift">
            <MessageCircle className="size-7" />
            <p className="mt-6 text-sm uppercase tracking-widest text-forest-foreground/75">Zalo</p>
            <p className="mt-1 font-display text-4xl font-bold">{SHOP.phone}</p>
            <Button asChild size="lg" className="mt-6">
              <a href={SHOP.zaloHref} target="_blank" rel="noreferrer">
                Nhắn Zalo
              </a>
            </Button>
          </div>

          <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-tile">
            <MapPin className="size-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">Showroom</h2>
              <p className="mt-1 text-muted-foreground">{SHOP.address}</p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl border bg-card p-6 shadow-tile">
            <Clock className="size-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">Giờ mở cửa</h2>
              <p className="mt-1 text-muted-foreground">{SHOP.hours}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
