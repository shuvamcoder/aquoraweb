import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeasurementGuide } from "@/components/MeasurementGuide";
import { products, budgetDisclaimer } from "@/lib/products";

export const Route = createFileRoute("/product")({
  head: () => ({ meta: [
    { title: "AquaTrack, AquaPure & AquaSync — Aquora Product Concepts" },
    { name: "description", content: "Explore Aquora’s three proposed water-monitoring and treatment designs, with labeled components and transparent preliminary budget targets." },
    { property: "og:title", content: "Three Water-Care Concepts — Aquora" },
    { property: "og:description", content: "AquaTrack measures, AquaPure treats, and AquaSync combines both. Proposed designs, not verified complete products." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Product,
});
function Product() {
  return <div>
    <section className="mx-auto max-w-6xl px-5 pb-12 pt-16">
      <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary"><FlaskConical className="h-4 w-4" /> The Aquora concept collection</p>
      <h1 className="mt-5 font-display text-5xl sm:text-6xl">Measure better.<br />Explore better water care.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Three practical ideas. One connected goal: make water-quality measurement and selected treatment methods more accessible.</p>
      <p className="mt-4 max-w-2xl text-sm text-muted-foreground">Proposed designs — not manufactured, calibrated or scientifically validated products. No products are currently offered for sale.</p>
      <nav aria-label="Product concepts" className="mt-8 flex flex-wrap gap-3">{products.map(p => <Button key={p.id} asChild variant="outline"><a href={`#${p.id}`}>{p.name} <ArrowRight /></a></Button>)}</nav>
    </section>
    {products.map((p, i) => <section id={p.id} key={p.id} className="scroll-mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-primary">0{i+1} / {p.role} / Proposed concept</p><h2 className="mt-3 font-display text-5xl">Aquora {p.name}</h2></div><div><p className="font-display text-4xl text-primary">~${p.budget}{p.plus ? "+" : ""}</p><p className="mt-1 text-sm text-muted-foreground">{p.budgetLabel} · not a retail price</p></div></div>
        <figure><a href={p.image} target="_blank" rel="noreferrer" aria-label={`Open full ${p.name} concept illustration`}><img src={p.image} alt={`${p.name} concept showing ${p.components.join(", ")}. ${p.id === "aquapure" ? "Arrows indicate intended water flow." : "Phone example readings: oxygen 6.2 mg/L, temperature 19.4°C, pH 7.5, turbidity 4.1 NTU."}`} width={1536} height={1024} loading={i === 0 ? "eager" : "lazy"} className="aspect-[3/2] w-full rounded-lg object-contain" /></a><figcaption className="mt-3 text-xs text-muted-foreground">Concept illustration, not a validated engineering design. {p.id !== "aquapure" && "Phone readings are illustrative examples only; smartphone not included in the budget target."}</figcaption></figure>
        <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_1fr]"><div><h3 className="font-display text-3xl">The idea</h3><p className="mt-4 leading-relaxed text-muted-foreground">{p.description}</p><ul className="mt-5 space-y-3">{p.features.map(f => <li key={f} className="flex gap-2 text-sm"><Check className="h-4 w-4 shrink-0 text-primary" />{f}</li>)}</ul><p className="mt-6 border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground">{p.limitation}</p></div><div><h3 className="font-display text-3xl">Proposed components</h3><ul className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">{p.components.map(c => <li key={c} className="border-b border-border pb-2">{c}</li>)}</ul></div></div>
      </div>
    </section>)}
    <section className="border-y border-border bg-secondary"><div className="mx-auto max-w-6xl px-5 py-10"><h2 className="font-display text-3xl">A low-cost goal. An honest budget.</h2><p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{budgetDisclaimer}</p><p className="mt-3 max-w-3xl text-sm text-muted-foreground">Reliable four-parameter sensors and Bluetooth electronics cannot be assumed to cost $15 in total. Complete-system costs and treatment performance remain unverified.</p></div></section>
    <MeasurementGuide />
    <section className="mx-auto max-w-6xl px-5 py-8"><h2 className="font-display text-3xl">Explore the data that exists today.</h2><Button asChild className="mt-5"><Link to="/map">Explore water data <ArrowRight /></Link></Button></section>
  </div>;
}
