import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bell, Compass, Fish, Radio, Search, ShieldCheck, Waves } from "lucide-react";
import { useState } from "react";
import lake from "@/assets/lake.jpg";
import kit from "@/assets/kit-battery.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aquora — Water Intelligence for a Healthier World" },
      { name: "description", content: "Check oxygen, temperature and advisories for lakes and rivers with live USGS data, and record manual measurements with the battery-powered $11.99 Aquora kit." },
      { property: "og:title", content: "Aquora — Water Intelligence for a Healthier World" },
      { property: "og:description", content: "Water-health info for anglers, swimmers and pond owners, plus affordable battery-powered water care and manual measuring tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const intents = [
  { icon: Fish, title: "Fishing", text: "Oxygen, temperature and trends that tell you where fish are active." },
  { icon: Waves, title: "Recreation", text: "Advisories and algae notices before you swim or boat." },
  { icon: Compass, title: "Explore", text: "Find waterways worldwide and compare conditions side by side." },
  { icon: Bell, title: "Alerts", text: "Know when measured conditions change significantly." },
];

const stats = [["Live", "USGS station readings"], ["4", "Key water measures"], ["$11.99", "Battery-powered kit"]];

function Home() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  return (
    <div>
      <section className="relative overflow-hidden">
        <img src={lake} alt="Calm lake at sunrise" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/60 to-background" />
        <div className="relative mx-auto max-w-6xl px-5 pb-28 pt-20 text-foreground sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/30 bg-foreground/10 px-3 py-1 text-xs uppercase tracking-[0.2em] backdrop-blur">
            <Radio className="h-3.5 w-3.5" /> Live water data
          </span>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] sm:text-7xl">Water Intelligence for a Healthier World.</h1>
          <p className="mt-5 max-w-xl text-lg opacity-85">There is no ‘fear’ when it’s clear. Real conditions for lakes and rivers, in plain language.</p>
          <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/explore", search: { q } }); }} className="mt-10 flex max-w-xl items-center gap-2 rounded-full bg-card p-2 text-foreground shadow-2xl">
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a lake, river or reservoir…" className="min-w-0 flex-1 bg-transparent px-2 py-2 outline-none" />
            <button className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Check water</button>
          </form>
          <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6">
            {stats.map(([v, l]) => (
              <div key={l}><dt className="font-display text-3xl sm:text-4xl">{v}</dt><dd className="text-xs opacity-75 sm:text-sm">{l}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <h2 className="font-display text-4xl sm:text-5xl">Answers for every trip</h2>
          <Link to="/map" className="inline-flex items-center gap-1 text-sm text-primary">Open the world map <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {intents.map(({ icon: Icon, title, text }) => (
            <Link key={title} to="/explore" className="group rounded-3xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="h-6 w-6" /></span>
              <h3 className="mt-5 font-display text-2xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 rounded-[2rem] bg-primary p-8 text-primary-foreground sm:p-12 md:grid-cols-2 lg:grid-cols-4">
          {[["Measure", "USGS stations and sensors track dissolved oxygen, pH, temperature and flow."], ["Understand", "Water fingerprints and comparisons put measurements in context."], ["Treat", "Aeration and activated carbon improve conditions in managed water."], ["Measure again", "Take a fresh reading and compare it with the first one to see what actually changed."]].map(([t, d], i) => (
            <div key={t} className="border-t border-primary-foreground/25 pt-5">
              <span className="text-sm opacity-70">0{i + 1}</span>
              <h3 className="font-display text-3xl">{t}</h3>
              <p className="mt-2 text-sm opacity-85">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] border border-border bg-card md:grid-cols-2">
          <img src={kit} alt="Aquora kit concept: batteries, pump, carbon filter, thermometer, pH strips and sample vial" width={1200} height={1008} loading="lazy" className="h-full w-full object-cover" />
          <div className="p-8 sm:p-10">
            <span className="inline-flex items-center gap-2 text-sm text-primary"><ShieldCheck className="h-4 w-4" /> The Aquora Kit</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Clearer water for less than a sandwich.</h2>
            <p className="mt-3 text-muted-foreground">A battery-powered aeration pump, carbon filter, thermometer, pH strips and sample vial — still $11.99. Record your own measurements on the world map.</p>
            <p className="mt-3 text-xs text-muted-foreground">Concept illustration; final specifications and sourcing costs require confirmation. No automatic device readings.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/product" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Get the kit — $11.99</Link>
              <Link to="/map" className="rounded-full border border-border px-6 py-3 text-sm">See results on the map</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
