import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo, useState } from "react";
import { continentOf, continents, days, doStatus, waterways } from "@/lib/waterways";
import { DoChart } from "@/components/DoChart";
import { WaterProfile } from "@/components/WaterProfile";
import { catalogObservation } from "@/lib/observations";
import { LiveData } from "@/components/LiveData";

export const Route = createFileRoute("/explore")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Explore Waterways — Aquora" },
      { name: "description", content: "Search lakes and rivers for dissolved oxygen, temperature, pH, advisories and 7-day trends." },
      { property: "og:title", content: "Explore Waterways — Aquora" },
      { property: "og:description", content: "Compare water fingerprints and explore sample trends alongside live agency data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

const toneCls = { good: "bg-good/15 text-good", warn: "bg-warn/20 text-warn-foreground", bad: "bg-destructive/15 text-destructive" };

function Explore() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial ?? "");
  const [cont, setCont] = useState("All");
  const list = useMemo(() => waterways.filter((w) => (cont === "All" || continentOf(w) === cont) && (w.name + w.region + w.type).toLowerCase().includes(q.toLowerCase())), [q, cont]);
  const [sel, setSel] = useState(list[0]?.id ?? waterways[0]?.id ?? "");
  const w = waterways.find((x) => x.id === sel) ?? list[0];
  if (!w) return <p className="p-8">No waterways available.</p>;
  const s = doStatus(w.do);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-5xl">Explore waterways</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{waterways.length} waterways across six continents. Summary readings are Aquora samples — live USGS station data (US only) and weather load for each waterway below.</p>
      <div className="mt-6 flex flex-wrap gap-2">{continents.map((c) => <button key={c} onClick={() => setCont(c)} className={`rounded-full border px-4 py-1.5 text-sm transition ${cont === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/60"}`}>{c}</button>)}</div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name or region" className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary" />
          <p className="mt-3 text-xs text-muted-foreground">{list.length} shown</p>
          <ul className="mt-2 max-h-[720px] space-y-2 overflow-y-auto pr-1">
            {list.map((x) => {
              const st = doStatus(x.do);
              return (
                <li key={x.id}>
                  <button onClick={() => setSel(x.id)} className={`w-full rounded-xl border p-4 text-left transition ${x.id === sel ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/50"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{x.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${toneCls[st.tone]}`}>{st.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{x.type} · {x.region}</span>
                  </button>
                </li>
              );
            })}
            {list.length === 0 && <li className="p-4 text-sm text-muted-foreground">No waterways match.</li>}
          </ul>
        </aside>

        <section className="rounded-3xl border border-border bg-card p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{w.type} · {w.region}</p>
              <h2 className="font-display text-4xl">{w.name}</h2>
            </div>
            {w.treated && <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Aquora treated</span>}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Dissolved O₂", `${w.do} mg/L`], ["Temperature", `${w.temp}°C`], ["pH", w.ph], ["Turbidity", `${w.turbidity} NTU`]].map(([k, v]) => (
              <div key={k as string} className="rounded-2xl bg-secondary p-4">
                <div className="text-xs text-muted-foreground">{k}</div>
                <div className="mt-1 font-display text-3xl">{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className={`rounded-full px-3 py-1 ${toneCls[s.tone]}`}>Oxygen: {s.label}</span>
            <span className="rounded-full bg-secondary px-3 py-1">Trend: {w.trend}</span>
          </div>

          <div className="mt-8">
            <h3 className="mb-2 font-medium">7-day dissolved oxygen</h3>
            <DoChart data={w.history.map((v, i) => ({ label: days[i] ?? "", value: v }))} />
            <p className="text-xs text-muted-foreground">Dashed line: 5 mg/L, below which many fish become stressed.</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border p-5">
              <h4 className="font-display text-xl">Fishing outlook</h4>
              <p className="mt-1 text-sm text-muted-foreground">{w.fishing}</p>
            </div>
            <div className="rounded-2xl border border-border p-5">
              <h4 className="font-display text-xl">Recreation</h4>
              <p className="mt-1 text-sm text-muted-foreground">Sample advisory: {w.advisory ?? "No advisory in sample; check local authorities"}</p>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6"><WaterProfile key={w.id} observation={catalogObservation(w)} onSelect={(o) => setSel(o.id)} /></div>
          <LiveData lat={w.lat} lon={w.lon} />
        </section>
      </div>
    </div>
  );
}
