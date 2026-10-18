import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
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
  const [found, setFound] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchNote, setSearchNote] = useState("");
  const request = useRef(0);
  const w = waterways.find(x => x.id === sel) ?? waterways[0];

  const searchWater = async (term: string) => {
    if (!term.trim()) return;
    const current = ++request.current;
    setSearching(true); setSearchNote(""); setFound(null); setSel("");
    try {
      // Border lakes may be classified as Canadian even when they span U.S. waters.
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=10&bounded=1&viewbox=-180,72,-66,18&addressdetails=1&q=${encodeURIComponent(term)}`);
      if (!r.ok) throw new Error("Search unavailable");
      const d = await r.json() as { lat: string; lon: string; display_name: string; class?: string; type?: string; address?: { country_code?: string } }[];
      if (current !== request.current) return;
      const eligible = d.filter(place => !place.address?.country_code || place.address.country_code === "us" || (place.address.country_code === "ca" && ["lake", "river", "bay", "reservoir"].includes(place.type ?? "") && +place.lat >= 41 && +place.lat <= 49 && +place.lon >= -95 && +place.lon <= -67));
      const place = eligible.find(place => ["water", "waterway", "natural"].includes(place.class ?? "")) ?? eligible[0];
      if (place && Number.isFinite(+place.lat) && Number.isFinite(+place.lon)) setFound({ name: place.display_name.split(",")[0] ?? term, lat: +place.lat, lon: +place.lon });
      else setSearchNote("No U.S. waterway found with that name. Try a nearby city or a different spelling.");
    } catch { if (current === request.current) setSearchNote("Search is unavailable right now. Try again in a moment."); }
    if (current === request.current) setSearching(false);
  };

  useEffect(() => {
    if (initial?.trim()) void searchWater(initial.trim());
    return () => { request.current += 1; };
  }, [initial]);

  const searchAny = (e: React.FormEvent) => {
    e.preventDefault();
    void searchWater(q.trim());
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-5xl">Every current, illuminated.</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Explore the map, or pick a featured waterway below to see its live readings. Coverage is U.S. only for now — global waterways are a future addition.</p>
      <div className="mt-8"><WorldMap /></div>

      <section id="featured" className="mt-16 border-t border-border pt-12">
        <h2 className="font-display text-4xl">Water horizons.</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Choose a place to see readings from the nearest monitoring stations.</p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <h3 className="font-display text-2xl">Popular waters.</h3>
              <ul aria-label="Popular waters" className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
                {waterways.map(x => (
                  <li key={x.id}>
                    <Button variant="outline" aria-pressed={w?.id === x.id && !found && !searching && !searchNote && !q.trim()} onClick={() => { request.current += 1; setSel(x.id); setFound(null); setSearching(false); setSearchNote(""); setQ(""); }} className={`h-auto w-full flex-col items-start whitespace-normal px-4 py-3 text-left ${w?.id === x.id && !found && !searching && !searchNote && !q.trim() ? "border-primary bg-secondary" : ""}`}>
                      <span>{x.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{x.region}</span>
                    </Button>
                  </li>
                ))}
              </ul>
          </aside>
          <div className="min-w-0">
            <h3 className="font-display text-2xl">Find your water.</h3>
            <form onSubmit={searchAny} className="mt-4 mb-8 flex gap-2">
              <input aria-label="Search waterways" value={q} onChange={e => { setQ(e.target.value); setSearchNote(""); }} placeholder="Search any U.S. lake, river or bay" className="min-w-0 flex-1 rounded-md border border-input bg-card px-4 py-3 outline-none focus:border-primary" />
              <Button type="submit" disabled={searching || !q.trim()}>{searching ? "…" : "Go"}</Button>
            </form>
            {searching ? <p role="status" className="py-8 text-muted-foreground">Finding your water…</p> : searchNote ? <p role="status" className="py-8 text-muted-foreground">{searchNote}</p> : found ? (
              <>
                <p className="text-xs uppercase tracking-widest text-primary">Search result</p>
                <h3 className="mt-2 font-display text-4xl">{found.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Nearby stations may not represent this exact waterway. Follow local guidance for swimming and drinking.</p>
                <LiveData key={`${found.lat},${found.lon}`} lat={found.lat} lon={found.lon} />
              </>
            ) : w ? (
              <>
                <p className="text-xs uppercase tracking-widest text-primary">{w.region}</p>
                <h3 className="mt-2 font-display text-4xl">{w.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Nearby stations may not represent this exact waterway. Follow local guidance for swimming and drinking.</p>
                <LiveData key={w.id} lat={w.lat} lon={w.lon} />
              </>
            ) : <p className="py-8 text-muted-foreground">Search for any U.S. lake, river or bay above to see its live readings.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
