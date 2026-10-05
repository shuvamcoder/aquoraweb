import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { waterways } from "@/lib/waterways";

type UserSpot = { id: string; name: string; type: string; note: string; lat: number; lng: number };
const KEY = "aquasense-user-waterways";

// Approximate locations for the sample waterways
const sampleCoords: Record<string, [number, number]> = {
  "lake-mirren": [45.9, -89.7],
  "cedar-river": [41.98, -91.67],
  "pine-hollow": [39.95, -75.6],
  "silver-reservoir": [39.1, -120.9],
  "willow-bay": [28.8, -81.7],
  "brandt-creek": [40.02, -105.3],
};

function loadSpots(): UserSpot[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function WorldMap() {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const osmLayer = useRef<Leaflet.LayerGroup | null>(null);
  const userLayer = useRef<Leaflet.LayerGroup | null>(null);
  const addModeRef = useRef(false);

  const [spots, setSpots] = useState<UserSpot[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({ name: "", type: "Lake", note: "" });
  const [status, setStatus] = useState("Zoom in to discover named lakes and rivers.");
  const [search, setSearch] = useState("");

  useEffect(() => { addModeRef.current = addMode; }, [addMode]);

  useEffect(() => {
    setSpots(loadSpots());
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let ctrl: AbortController | null = null;

    import("leaflet").then((mod) => {
      const L = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet);
      if (cancelled || !el.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(el.current, { worldCopyJump: true }).setView([25, 0], 2);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 18,
      }).addTo(map);
      osmLayer.current = L.layerGroup().addTo(map);
      userLayer.current = L.layerGroup().addTo(map);

      waterways.forEach((w) => {
        const c = sampleCoords[w.id];
        if (!c) return;
        L.circleMarker(c, { radius: 9, color: "#0e6b80", fillColor: "#1aa3b8", fillOpacity: 0.9, weight: 2 })
          .bindPopup(`<b>${w.name}</b><br/>${w.type} · ${w.region}<br/>Oxygen: ${w.do} mg/L · ${w.temp}°C<br/><a href="/explore?q=${encodeURIComponent(w.name)}">See full conditions →</a>`)
          .addTo(map);
      });

      const fetchWater = () => {
        if (map.getZoom() < 9) { osmLayer.current?.clearLayers(); setStatus("Zoom in closer to discover named lakes and rivers."); return; }
        const b = map.getBounds();
        const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
        const q = `[out:json][timeout:20];(way["natural"="water"]["name"](${bbox});relation["natural"="water"]["name"](${bbox});way["waterway"="river"]["name"](${bbox}););out center 200;`;
        ctrl?.abort();
        ctrl = new AbortController();
        setStatus("Searching for waterways in this area…");
        fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(q), signal: ctrl.signal })
          .then((r) => r.json())
          .then((d: { elements: { id: number; center?: { lat: number; lon: number }; lat?: number; lon?: number; tags?: Record<string, string> }[] }) => {
            osmLayer.current?.clearLayers();
            const seen = new Set<string>();
            d.elements.forEach((e) => {
              const lat = e.center?.lat ?? e.lat; const lon = e.center?.lon ?? e.lon;
              const name = e.tags?.name;
              if (lat == null || lon == null || !name || seen.has(name)) return;
              seen.add(name);
              const kind = e.tags?.waterway === "river" ? "River" : e.tags?.water ? e.tags.water[0]!.toUpperCase() + e.tags.water.slice(1) : "Water body";
              L.circleMarker([lat, lon], { radius: 5, color: "#2b6cb0", fillColor: "#63b3ed", fillOpacity: 0.8, weight: 1 })
                .bindPopup(`<b>${name}</b><br/>${kind}<br/><small>From OpenStreetMap · no readings yet</small>`)
                .addTo(osmLayer.current!);
            });
            setStatus(`${seen.size} named waterways found in this view.`);
          })
          .catch((err) => { if (err.name !== "AbortError") setStatus("Waterway lookup is busy — move the map to try again."); });
      };
      map.on("moveend", () => { clearTimeout(timer); timer = setTimeout(fetchWater, 600); });
      map.on("click", (e: Leaflet.LeafletMouseEvent) => {
        if (!addModeRef.current) return;
        setDraft({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    });
    return () => { cancelled = true; ctrl?.abort(); mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // render user spots
  useEffect(() => {
    const L = LRef.current; const layer = userLayer.current;
    if (!L || !layer) return;
    layer.clearLayers();
    spots.forEach((s) => {
      L.circleMarker([s.lat, s.lng], { radius: 8, color: "#b7791f", fillColor: "#f6ad55", fillOpacity: 0.95, weight: 2 })
        .bindPopup(`<b>${s.name}</b><br/>${s.type} · added by you${s.note ? `<br/>${s.note.replace(/</g, "&lt;")}` : ""}`)
        .addTo(layer);
    });
  }, [spots, mapRef.current]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft || !form.name.trim()) return;
    const next = [...spots, { id: crypto.randomUUID(), ...form, name: form.name.trim().replace(/</g, ""), ...draft }];
    setSpots(next); localStorage.setItem(KEY, JSON.stringify(next));
    setDraft(null); setAddMode(false); setForm({ name: "", type: "Lake", note: "" });
  };
  const remove = (id: string) => { const next = spots.filter((s) => s.id !== id); setSpots(next); localStorage.setItem(KEY, JSON.stringify(next)); };

  const goSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setStatus("Finding place…");
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(search)}`);
      const d = await r.json();
      if (d[0]) mapRef.current?.setView([+d[0].lat, +d[0].lon], 11);
      else setStatus("No place found with that name.");
    } catch { setStatus("Place search is unavailable right now."); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <form onSubmit={goSearch} className="mb-3 flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Jump to any place in the world — e.g. Lake Geneva" className="flex-1 rounded-full border border-input bg-card px-5 py-2.5 outline-none focus:border-primary" />
          <button className="rounded-full bg-primary px-5 text-sm text-primary-foreground">Go</button>
        </form>
        <div className={`relative overflow-hidden rounded-3xl border border-border ${addMode ? "cursor-crosshair ring-2 ring-primary" : ""}`}>
          <div ref={el} className="h-[560px] w-full" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{status}</p>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-border bg-card p-5">
          <h3 className="font-display text-2xl">Add a waterway</h3>
          {!addMode && !draft && (
            <>
              <p className="mt-1 text-sm text-muted-foreground">Know a pond, creek or lake that's missing? Pin it.</p>
              <button onClick={() => setAddMode(true)} className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm text-primary-foreground">Pin a location</button>
            </>
          )}
          {addMode && !draft && (
            <>
              <p className="mt-1 text-sm text-primary">Click anywhere on the map to drop your pin.</p>
              <button onClick={() => setAddMode(false)} className="mt-3 text-sm text-muted-foreground underline">Cancel</button>
            </>
          )}
          {draft && (
            <form onSubmit={save} className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">{draft.lat.toFixed(4)}, {draft.lng.toFixed(4)}</p>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Waterway name" className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2">
                {["Lake", "River", "Creek", "Pond", "Reservoir", "Wetland"].map((t) => <option key={t}>{t}</option>)}
              </select>
              <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Notes (optional)" rows={2} className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary" />
              <div className="flex gap-2">
                <button className="flex-1 rounded-full bg-primary py-2 text-sm text-primary-foreground">Save</button>
                <button type="button" onClick={() => { setDraft(null); setAddMode(false); }} className="rounded-full border border-border px-4 text-sm">Cancel</button>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 text-sm">
          <h4 className="font-medium">Legend</h4>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-primary" /> AquaSense waterways with readings</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-accent ring-1 ring-primary/40" /> Waterways from OpenStreetMap</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-warn" /> Added by you</li>
          </ul>
        </div>

        {spots.length > 0 && (
          <div className="rounded-3xl border border-border bg-card p-5">
            <h4 className="font-medium">Your pins</h4>
            <ul className="mt-2 space-y-2 text-sm">
              {spots.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <button onClick={() => mapRef.current?.setView([s.lat, s.lng], 12)} className="text-left hover:text-primary">{s.name} <span className="text-muted-foreground">· {s.type}</span></button>
                  <button onClick={() => remove(s.id)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
