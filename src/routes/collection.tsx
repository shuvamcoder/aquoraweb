import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Check } from "lucide-react";
import { products } from "@/lib/products";

export const Route = createFileRoute("/collection")({
  head: () => ({ meta: [
    { title: "AquaTrack — Connected Water Sensing | Aquora" },
    { name: "description", content: "Meet AquaTrack: four electronic sensors and a Bluetooth connection to your phone, for understanding your water." },
    { property: "og:title", content: "AquaTrack — Connected Water Sensing" },
    { property: "og:description", content: "Measure oxygen, temperature, pH and clarity with AquaTrack." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Collection,
});
function Collection() {
  const kit = products[0];
  return <div>
    <section className="mx-auto max-w-6xl px-5 pb-8 pt-12">
      <p className="text-xs uppercase tracking-widest text-primary">Aquora / Collection</p>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl">Meet AquaTrack.</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{kit.description}</p>
    </section>
    <section id={kit.id} className="scroll-mt-24 border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-10 lg:grid-cols-[1.2fr_1fr]">
        <figure className="relative aspect-[3/2] w-full">
          <img src={kit.image} alt={kit.name} width={1200} height={800} loading="eager" decoding="async" className="absolute inset-0 h-full w-full rounded-lg object-contain" />
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
