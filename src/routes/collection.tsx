import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";

export const Route = createFileRoute("/collection")({
  head: () => ({ meta: [
    { title: "The Collection — AquaTrack, AquaPure & AquaSync | Aquora" },
    { name: "description", content: "Meet AquaTrack for measuring water, AquaPure for aeration and carbon filtration, and AquaSync for both." },
    { property: "og:title", content: "The Aquora Collection" },
    { property: "og:description", content: "Measure with AquaTrack. Treat with AquaPure. Bring both together with AquaSync." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Kits,
});
function Kits() {
  const [selected, setSelected] = useState<string>("aquasync");
  useEffect(() => {
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      if (products.some(p => p.id === id)) setSelected(id);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);
  const kit = products.find(p => p.id === selected) ?? products[0];
  return <div>
    <section className="mx-auto max-w-6xl px-5 pb-8 pt-12">
      <p className="text-xs uppercase tracking-widest text-primary">Aquora / Collection</p>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl">Measure. Treat. Or both.</h1>
      <nav aria-label="Choose a product" className="mt-8 grid gap-3 sm:grid-cols-3">
        {products.map(p => <Button key={p.id} asChild variant={p.id === selected ? "default" : "outline"} className="h-auto justify-start whitespace-normal px-5 py-4 text-left">
          <a href={`#${p.id}`} onClick={() => setSelected(p.id)} aria-current={p.id === selected ? "true" : undefined}><span className="flex flex-col items-start gap-1"><span className="text-lg">{p.name}</span><span className={`text-xs font-normal ${p.id === selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.description}</span></span></a>
        </Button>)}
      </nav>
    </section>
    <section id={kit.id} className="scroll-mt-24 border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-10 lg:grid-cols-[1.2fr_1fr]">
        <figure className="relative aspect-[3/2] w-full">
          {products.map(p => <img key={p.id} src={p.image} alt={`${p.name}`} width={1200} height={800} loading="eager" decoding="async" className={`absolute inset-0 h-full w-full rounded-lg object-contain transition-opacity duration-200 ${p.id === kit.id ? "opacity-100" : "pointer-events-none opacity-0"}`} />)}
        </figure>
        <div>
          <div className="flex items-center justify-between gap-4"><h2 className="font-display text-4xl">{kit.name}</h2></div>
          <p className="mt-3 text-muted-foreground">{kit.description}</p><ul className="mt-6 space-y-3">{kit.features.map(f => <li key={f} className="flex gap-3 text-sm"><Check className="h-4 w-4 shrink-0 text-primary" />{f}</li>)}</ul>
          <details className="mt-6 border-t border-border py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">What's inside <ChevronDown className="h-4 w-4" /></summary><ul className="mt-4 space-y-2 text-sm text-muted-foreground">{kit.components.map(c => <li key={c}>{c}</li>)}</ul></details>
          <p className="text-xs leading-relaxed text-muted-foreground">{kit.limitation}</p>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-8">
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">For drinking-water and recreation guidance, follow local authorities.</p>
    </section>
  </div>;
}
