import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SHOP } from "@/lib/catalog";
import { AuthAffordance } from "./auth-affordance";
import { LogoMark } from "./logo";

const NAV = [
  { to: "/", label: "Trang chủ" },
  { to: "/san-pham", label: "Sản phẩm" },
  { to: "/bang-gia", label: "Bảng giá" },
  { to: "/lien-he", label: "Liên hệ" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="font-display text-xl font-bold tracking-tight">
            QT <span className="text-primary">tiles</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
              activeOptions={{ exact: true, includeSearch: false }}
            >
              {item.label}
            </Link>
          ))}
          <AuthAffordance />
        </nav>

        <Button asChild size="sm">
          <a href={SHOP.phoneHref}>
            <Phone /> <span className="hidden sm:inline">{SHOP.phone}</span>
            <span className="sm:hidden">Gọi ngay</span>
          </a>
        </Button>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t px-3 py-1.5 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground"
            activeProps={{ className: "text-foreground bg-muted" }}
            activeOptions={{ exact: true, includeSearch: false }}
          >
            {item.label}
          </Link>
        ))}
        <AuthAffordance />
      </nav>
    </header>
  );
}
