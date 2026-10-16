import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search, Radio, Fish, Waves, Leaf } from "lucide-react";
import { useState } from "react";
import lake from "@/assets/lake.jpg";
import { Button } from "@/components/ui/button";
import { ProductCards } from "@/components/ProductCards";
import { MeasurementGuide } from "@/components/MeasurementGuide";
import { WorldMap } from "@/components/WorldMap";
import { budgetDisclaimer } from "@/lib/products";

export const Route = createFileRoute("/")({ head: () => ({ meta: [
  { title: "Aquora — Water Intelligence for a Healthier World" },
  { name: "description", content: "Explore waterways, understand real public water measurements, and follow changes with Aquora." },
  { property: "og:title", content: "Aquora — Water Intelligence for a Healthier World" },
  { property: "og:description", content: "Discover waterways worldwide and understand water conditions through public measurements." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Home });
function Home() {
  const [q, setQ] = useState(""); const nav = useNavigate();
  return <div>
    <section className="relative overflow-hidden"><img src={lake} alt="A calm freshwater lake surrounded by forest" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/80 to-background" />
      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20"><p className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary"><Radio className="h-4 w-4" /> Explore · understand · care</p><h1 className="mt-5 font-display text-5xl sm:text-7xl">Aquora</h1><p className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Water Intelligence for a Healthier World.</p><p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground">Discover the waterways around you. Understand real water measurements, record your own observations, and follow how conditions change.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/map">Explore Water Data <ArrowRight /></Link></Button><Button asChild variant="outline" size="lg"><Link to="/explore">Explore waterways</Link></Button></div>
      <form onSubmit={e => {e.preventDefault(); nav({to: "/explore", search: {q}});}} className="mt-8 flex max-w-xl items-center gap-2 rounded-lg border border-border bg-card p-2"><Search className="ml-2 h-5 w-5 shrink-0 text-primary" /><input aria-label="Search waterways" value={q} onChange={e => setQ(e.target.value)} placeholder="Search a lake or river…" className="min-w-0 flex-1 bg-transparent px-1 py-2 outline-none" /><Button type="submit" size="icon" aria-label="Search water data"><ArrowRight /></Button></form>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-12"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-primary">Your connection to water</p><h2 className="mt-3 font-display text-4xl">A world of water to understand.</h2><p className="mt-3 max-w-xl text-muted-foreground">USGS measurements at U.S. stations. OpenStreetMap waterway locations worldwide. Availability varies by place and measurement.</p></div><Button asChild variant="outline"><Link to="/map">Open full map <ArrowRight /></Link></Button></div><WorldMap preview /></section>
    <section className="border-y border-border bg-primary text-primary-foreground"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">{[["Measure", "Start with public observations or your own recorded measurements."], ["Understand", "Read the units, dates and source before comparing conditions."], ["Treat", "Consider aeration and carbon filtration for selected water conditions."], ["Measure again", "Compare fresh measurements; a change alone does not prove treatment effectiveness."]].map(([t,d],i) => <div key={t} className="border-t border-primary-foreground/30 pt-4"><p className="text-xs">0{i+1}</p><h3 className="mt-2 font-display text-3xl">{t}</h3><p className="mt-3 text-sm leading-relaxed">{d}</p></div>)}</div></section>

    <section className="border-y border-border bg-secondary"><div className="mx-auto max-w-6xl px-5 py-12"><h2 className="font-display text-4xl">Why monitoring matters</h2><div className="mt-8 grid gap-8 md:grid-cols-3">{[{icon: Fish,title:"Aquatic life",text:"Oxygen and temperature help us understand the conditions fish and other organisms experience."},{icon: Waves,title:"Informed communities",text:"Public measurements give communities evidence to ask better questions about nearby waterways."},{icon: Leaf,title:"Responsible water care",text:"Measurements before and after an intervention can document change, while further testing is needed to establish its cause."}].map(({icon:Icon,title,text}) => <div key={title}><Icon className="h-6 w-6 text-primary" /><h3 className="mt-4 font-medium">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></div>)}</div></div></section>
    <MeasurementGuide />
    <section className="mx-auto max-w-6xl px-5 py-16"><p className="text-xs uppercase tracking-widest text-primary">Water-care kits</p><h2 className="mt-3 font-display text-4xl">Measure. Treat. Bring both together.</h2><p className="mb-8 mt-4 max-w-2xl text-muted-foreground">AquaTrack measures. AquaPure treats. AquaSync brings both together. One part of our wider mission to understand and care for water.</p><ProductCards /><p className="mt-6 text-xs leading-relaxed text-muted-foreground">{budgetDisclaimer}</p></section>
  </div>;
}
