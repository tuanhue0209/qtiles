export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span className={`grid size-8 grid-cols-2 gap-0.5 ${className}`} aria-hidden>
      <span className="rounded-[2px] bg-primary" />
      <span className="rounded-[2px] bg-peach" />
      <span className="rounded-[2px] bg-sage" />
      <span className="rounded-[2px] bg-forest" />
    </span>
  );
}
