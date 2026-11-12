import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";

import { CATEGORIES, SHOP } from "@/lib/catalog";
import { LogoMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="bg-forest text-forest-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-display text-xl font-bold">QT tiles</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-forest-foreground/75">
            Gạch ốp lát chính hãng cho nhà phố, căn hộ và công trình tại Sài Gòn.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-forest-foreground/60">
            Danh mục
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  to="/san-pham"
                  search={{ loai: c.id }}
                  className="text-forest-foreground/85 hover:text-forest-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-forest-foreground/60">
            Liên hệ
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <a href={SHOP.phoneHref} className="font-semibold">
                {SHOP.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {SHOP.address}
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0" />
              {SHOP.hours}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-forest-foreground/15 py-5 text-center text-xs text-forest-foreground/60">
        © {new Date().getFullYear()} QT tiles · TP. Hồ Chí Minh
      </div>
    </footer>
  );
}
