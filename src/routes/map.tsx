import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo, useState } from "react";
import { WorldMap } from "@/components/WorldMap";
import { LiveData } from "@/components/LiveData";
import { Button } from "@/components/ui/button";
import { waterways } from "@/lib/waterways";

export const Route = createFileRoute("/map")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Atlas — Aquora" },
      { name: "description", content: "Explore U.S. lakes and rivers on a live map, browse featured waterways and read nearby station measurements in one place." },
      { property: "og:title", content: "Atlas — Aquora" },
      { property: "og:description", content: "One atlas for U.S. waterways: live map, featured places and real station readings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial ?? "");
  const [sel, setSel] = useState("");
  const list = useMemo(() => waterways.filter(w => (w.name + w.region + w.type).toLowerCase().includes(q.toLowerCase())), [q]);
  const w = list.find(x => x.id === sel) ?? list[0];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-5xl">Every current, illuminated.</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Explore the map, or pick a featured waterway below to see its live readings. Coverage is U.S. only for now — global waterways are a future addition.</p>
      <div className="mt-8"><WorldMap /></div>

      <section id="featured" className="mt-16 border-t border-border pt-12">
        <h2 className="font-display text-4xl">Featured waters.</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Choose a place to see readings from the nearest monitoring stations.</p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <input aria-label="Filter waterways" value={q} onChange={e => setQ(e.target.value)} placeholder="Filter by name or region" className="w-full rounded-md border border-input bg-card px-4 py-3 outline-none focus:border-primary" />
            <ul className="mt-3 max-h-[520px] space-y-2 overflow-y-auto">
              {list.map(x => (
                <li key={x.id}>
                  <Button variant="outline" onClick={() => setSel(x.id)} className={`h-auto w-full flex-col items-start whitespace-normal px-4 py-3 text-left ${w?.id === x.id ? "border-primary bg-secondary" : ""}`}>
                    <span>{x.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{x.region}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </aside>
          <div className="min-w-0">
            {w ? (
              <>
                <p className="text-xs uppercase tracking-widest text-primary">{w.region}</p>
                <h3 className="mt-2 font-display text-4xl">{w.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Nearby stations may not represent this exact waterway. Follow local guidance for swimming and drinking.</p>
                <LiveData key={w.id} lat={w.lat} lon={w.lon} />
              </>
            ) : <p className="py-8 text-muted-foreground">No waterways match. Try another name or region.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
