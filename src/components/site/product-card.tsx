import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { formatPrice, productPhoto, SHOP, type Category, type Product } from "@/lib/catalog";

export function ProductCard({ product, category }: { product: Product; category?: Category | undefined }) {
  const photo = productPhoto(product, category);

  return (
    <article className="group flex flex-col overflow-hidden border bg-card transition-colors hover:border-primary/40">
      <Link
        to="/san-pham/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/5] overflow-hidden bg-muted"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        <img
          src={photo}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
        {product.tag && (
          <span className="eyebrow absolute left-3 top-3 bg-background/95 px-2.5 py-1 text-foreground">
            {product.tag}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow text-muted-foreground">{category?.name ?? "Gạch"}</p>
        <h3 className="mt-2 font-display text-xl leading-snug">
          <Link
            to="/san-pham/$slug"
            params={{ slug: product.slug }}
            className="hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.size} · {product.finish}
        </p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4">
          <p className="font-display text-xl font-medium text-primary sm:text-2xl">
            {formatPrice(product.price)}
            <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">/m²</span>
          </p>
          <a
            href={SHOP.zaloHref}
            target="_blank"
            rel="noreferrer"
            aria-label={`Nhắn Zalo hỏi giá ${product.name}`}
            className="flex size-9 items-center justify-center border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <MessageCircle className="size-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
