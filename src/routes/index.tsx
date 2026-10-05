import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Compass, Fish, Search, Waves } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AquaSense — Know your water before you go" },
      { name: "description", content: "Check oxygen, temperature and advisories for lakes and rivers, and track AquaSense treatment devices in managed waterways." },
      { property: "og:title", content: "AquaSense — Know your water before you go" },
      { property: "og:description", content: "Water-health info for anglers, swimmers and pond owners, plus low-cost treatment you can track live." },
    ],
  }),
  component: Home,
});

const intents = [
  { icon: Fish, title: "Fishing", text: "Oxygen, temperature and trends that tell you where fish are active." },
  { icon: Waves, title: "Recreation", text: "Official advisories and algae or bacteria notices before you swim or boat." },
  { icon: Compass, title: "Explore", text: "Find nearby waterways and compare their conditions side by side." },
  { icon: Bell, title: "Alerts", text: "Get told when measured conditions change significantly." },
];

function Home() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  return (
    <div>
      <section className="water-hero">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-20">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">There is no ‘fear’ when it’s clear</p>
          <h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-foreground sm:text-7xl">What do you want to know about your water?</h1>
          <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/explore", search: { q } }); }} className="mt-10 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card p-2 shadow-sm">
            <Search className="ml-3 h-5 w-5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a lake, river or reservoir…" className="flex-1 bg-transparent px-2 py-2 outline-none" />
            <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Check water</button>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {intents.map(({ icon: Icon, title, text }) => (
          <Link key={title} to="/explore" className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary">
            <Icon className="h-7 w-7 text-primary" />
            <h3 className="mt-4 font-display text-2xl">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{text}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="grid gap-8 rounded-3xl bg-primary p-10 text-primary-foreground md:grid-cols-3">
          {[["Measure", "Sensors and public data track dissolved oxygen, pH, temperature and turbidity."], ["Understand", "Plain-language dashboards turn science into ‘good day to fish?’ answers."], ["Treat", "Aeration and activated carbon improve conditions in managed water — and you see the result."]].map(([t, d], i) => (
            <div key={t}>
              <span className="text-sm opacity-70">0{i + 1}</span>
              <h3 className="font-display text-3xl">{t}</h3>
              <p className="mt-2 text-sm opacity-85">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/dashboard" className="rounded-full border border-border px-5 py-2.5 text-sm">See the treatment dashboard</Link>
          <Link to="/product" className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background">Get an AquaSense device</Link>
        </div>
      </section>
    </div>
  );
}
