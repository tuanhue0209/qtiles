import { getCategory, formatPrice, type Product } from "@/lib/catalog";
import { SHOP } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const category = getCategory(product.category);
  const photo = product.imageUrl ?? category.image;
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-tile transition-all hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={photo}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute left-3 top-3 rounded-sm bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            {product.tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-secondary-foreground">
          {category.name}
        </p>
        <h3 className="mt-1 text-base font-semibold leading-snug">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.size} · {product.finish}
        </p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="font-display text-lg font-bold text-primary">
            {formatPrice(product.price)}
            <span className="text-xs font-normal text-muted-foreground">/m²</span>
          </p>
          <a
            href={SHOP.phoneHref}
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Hỏi giá
          </a>
        </div>
      </div>
    </article>
  );
}
