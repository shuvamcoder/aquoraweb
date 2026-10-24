import { products } from "@/lib/products";

export function ProductCards() {
  return <div className="mx-auto max-w-xl">{products.map((p) => <article key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
    <a href={`/collection#${p.id}`} aria-label={`Discover ${p.name}`}><img src={p.image} alt={`${p.name} labeled design: ${p.components.join(", ")}`} width={1536} height={1024} loading="lazy" className="aspect-[3/2] w-full object-contain" /></a>
    <div className="flex items-center justify-between gap-3 p-6"><h3 className="font-display text-3xl">{p.name}</h3></div><p className="px-6 pb-6 text-sm text-muted-foreground">{p.description}</p>
  </article>)}</div>;
}
