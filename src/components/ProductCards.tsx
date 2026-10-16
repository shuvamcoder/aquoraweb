import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";

export function ProductCards() {
  return <div className="grid gap-5 md:grid-cols-3">{products.map((p) => <article key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
    <a href={`/product#${p.id}`} aria-label={`Discover ${p.name}`}><img src={p.image} alt={`${p.name} labeled design: ${p.components.join(", ")}`} width={1536} height={1024} loading="lazy" className="aspect-[3/2] w-full object-contain" /></a>
    <div className="p-6"><p className="text-xs uppercase tracking-widest text-primary">{p.role}</p><h3 className="mt-3 font-display text-3xl">{p.name}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p><p className="mt-5 font-medium">{p.budgetLabel} — ~${p.budget}{p.plus ? "+" : ""}</p><p className="mt-1 text-xs text-muted-foreground">Component estimate, not a sale price</p><Button asChild variant="link" className="mt-4 px-0"><a href={`/product#${p.id}`}>View details <ArrowUpRight /></a></Button></div>
  </article>)}</div>;
}