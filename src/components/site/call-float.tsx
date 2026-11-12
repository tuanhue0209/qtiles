import { Phone } from "lucide-react";

import { SHOP } from "@/lib/catalog";

export function CallFloat() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <a
        href={SHOP.zaloHref}
        target="_blank"
        rel="noreferrer"
        className="flex size-12 items-center justify-center rounded-full border-2 border-forest-foreground bg-forest font-display text-xs font-bold text-forest-foreground shadow-lift"
        aria-label="Nhắn Zalo"
      >
        Zalo
      </a>
      <a
        href={SHOP.phoneHref}
        className="flex size-12 animate-pulse items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift"
        aria-label={`Gọi ${SHOP.phone}`}
      >
        <Phone className="size-5" />
      </a>
    </div>
  );
}
