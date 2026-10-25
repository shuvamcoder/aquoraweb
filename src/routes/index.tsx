import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search, Fish, Waves, Leaf } from "lucide-react";
import { useState } from "react";
import lake from "@/assets/lake.jpg";
import { Button } from "@/components/ui/button";
import { ProductCards } from "@/components/ProductCards";

export const Route = createFileRoute("/")({ head: () => ({ meta: [
  { title: "Aquora — Water Intelligence for your next adventure" },
  { name: "description", content: "Explore waterways, understand real public water measurements, and follow changes with Aquora." },
  { property: "og:title", content: "Aquora — Water Intelligence for your next adventure" },
  { property: "og:description", content: "Discover U.S. waterways and understand water conditions through public measurements." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Home });
function Home() {
  const [q, setQ] = useState(""); const nav = useNavigate();
  return <div>
    <section className="relative overflow-hidden"><img src={lake} alt="A calm freshwater lake surrounded by forest" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/80 to-background" />
      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20"><h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight sm:text-7xl">Water Intelligence for a Healthier Use.</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground">Explore the water around you. Understand what’s changing. Help care for it.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/atlas">Open atlas <ArrowRight /></Link></Button></div>
      <form onSubmit={e => {e.preventDefault(); nav({to: "/atlas", search: {q}, hash: "featured"});}} className="mt-8 flex max-w-xl items-center gap-2 rounded-lg border border-border bg-card p-2"><Search className="ml-2 h-5 w-5 shrink-0 text-primary" /><input aria-label="Search anywhere" value={q} onChange={e => setQ(e.target.value)} placeholder="Search anywhere" className="min-w-0 flex-1 bg-transparent px-1 py-2 outline-none" /><Button type="submit" size="icon" aria-label="Search water data"><ArrowRight /></Button></form>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-12"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-primary">Your connection to water</p><h2 className="mt-3 font-display text-4xl">Chart your water.</h2><p className="mt-3 max-w-xl text-muted-foreground">Discover places and explore live readings from monitoring stations.</p></div><Button asChild variant="outline"><Link to="/atlas">Open atlas <ArrowRight /></Link></Button></div></section>
    <section className="border-y border-border bg-primary text-primary-foreground"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">{[["Measure", "Start with a public reading or a measurement of your own."], ["Understand", "Learn what the numbers say about your water."], ["Treat", "Explore ways to add air and filter water."], ["Measure again", "Take another reading to see what changed."]].map(([t,d],i) => <div key={t} className="border-t border-primary-foreground/30 pt-4"><p className="text-xs">0{i+1}</p><h3 className="mt-2 font-display text-3xl">{t}</h3><p className="mt-3 text-sm leading-relaxed">{d}</p></div>)}</div></section>

    <section className="border-y border-border bg-secondary"><div className="mx-auto max-w-6xl px-5 py-12"><h2 className="font-display text-4xl">Signals below the surface</h2><div className="mt-8 grid gap-8 md:grid-cols-3">{[{icon: Fish,title:"For fishermen",text:"Explore oxygen and temperature readings to better understand fish habitats."},{icon: Waves,title:"For kayakers",text:"Explore nearby places, weather and recorded water conditions before heading out."},{icon: Leaf,title:"For swimmers",text:"Understand local readings alongside official advisories. Clear water alone does not establish swimming safety."}].map(({icon:Icon,title,text}) => <div key={title}><Icon className="h-6 w-6 text-primary" /><h3 className="mt-4 font-medium">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></div>)}</div></div></section>
    <section className="mx-auto max-w-6xl px-5 py-16"><p className="text-xs uppercase tracking-widest text-primary">The collection</p><h2 className="mb-8 mt-3 font-display text-4xl">Measure your water.</h2><ProductCards /></section>
  </div>;
}
