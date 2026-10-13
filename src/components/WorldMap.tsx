import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { WaterProfile } from "@/components/WaterProfile";
import { catalogObservation, type Observation } from "@/lib/observations";
import { waterways } from "@/lib/waterways";
import { getUsgsInBox, getUsgsName } from "@/lib/live-data.functions";

type UserSpot = { id: string; name: string; type: string; note: string; lat: number; lng: number; do?: string; temp?: string; ph?: string; turbidity?: string; doBefore?: string };
const esc = (x: string) => x.replace(/[<>&]/g, "");
const emptyForm = { name: "", type: "Lake", note: "", do: "", temp: "", ph: "", turbidity: "", doBefore: "" };
const improvement = (before?: number, after?: number) => before && after ? Math.round(((after - before) / before) * 100) : null;
const KEY = "aquasense-user-waterways";


function loadSpots(): UserSpot[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function WorldMap() {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const osmLayer = useRef<Leaflet.LayerGroup | null>(null);
  const userLayer = useRef<Leaflet.LayerGroup | null>(null);
  const usgsLayer = useRef<Leaflet.LayerGroup | null>(null);
  const [usgsStatus, setUsgsStatus] = useState("");
  const addModeRef = useRef(false);

  const [spots, setSpots] = useState<UserSpot[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("Zoom in to discover named lakes and rivers.");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Observation | null>(null);

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
      const map = L.map(el.current, { worldCopyJump: true, preferCanvas: true }).setView([25, 0], 2);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 18,
      }).addTo(map);
      // Worldwide water overlay so every lake, river and stream is visible at any zoom
      L.tileLayer("https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Hydro overlay © Esri", maxZoom: 18, opacity: 0.9,
      }).addTo(map);
      osmLayer.current = L.layerGroup().addTo(map);
      userLayer.current = L.layerGroup().addTo(map);
      usgsLayer.current = L.layerGroup().addTo(map);

      waterways.forEach((w) => {
        const c: [number, number] = [w.lat, w.lon];
        L.circleMarker(c, { radius: 9, color: "#0e6b80", fillColor: "#1aa3b8", fillOpacity: 0.9, weight: 2 })
          .bindPopup(`<b>${w.name}</b><br/>${w.type} · ${w.region}<br/><small style="opacity:.7">Aquora sample reading</small><br/>Oxygen: ${w.do} mg/L · ${w.temp}°C · pH ${w.ph} · ${w.turbidity} NTU<br/>${w.treated ? `<b style="color:#2f855a">Treated · oxygen ${improvement(w.history[0], w.history[w.history.length-1])! >= 0 ? "+" : ""}${improvement(w.history[0], w.history[w.history.length-1])}% this week</b><br/>` : `Trend: ${w.trend}<br/>`}<a href="/explore?q=${encodeURIComponent(w.name)}">See full conditions →</a>`)
          .addTo(map).on("click", () => setSelected(catalogObservation(w)));
      });

      const label = (t: Record<string, string> = {}) => {
        const ww = t["waterway"]; const wa = t["water"];
        if (ww) return ww[0]!.toUpperCase() + ww.slice(1);
        if (wa) return wa[0]!.toUpperCase() + wa.slice(1);
        if (t["natural"] === "wetland") return "Wetland";
        if (t["landuse"] === "reservoir") return "Reservoir";
        if (t["natural"] === "bay") return "Bay";
        return "Water body";
      };

      const fetchWater = () => {
        const z = map.getZoom();
        if (z < 8) { osmLayer.current?.clearLayers(); setStatus("All of the world's water shapes are shown in blue. Zoom in to click on individual lakes, rivers and streams."); return; }
        const b = map.getBounds();
        const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
        const nameFilter = z < 11 ? `["name"]` : "";
        const q = `[out:json][timeout:25];(nwr["natural"~"^(water|wetland|bay|spring)$"]${nameFilter}(${bbox});nwr["landuse"="reservoir"]${nameFilter}(${bbox});way["waterway"~"^(river|stream|canal|brook|creek|drain|ditch|tidal_channel)$"]${nameFilter}(${bbox});node["natural"="spring"](${bbox}););out center tags;`;
        ctrl?.abort();
        ctrl = new AbortController();
        setStatus("Loading every waterway in this area…");
        fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(q), signal: ctrl.signal })
          .then((r) => r.json())
          .then((d: { elements: { id: number; type: string; center?: { lat: number; lon: number }; lat?: number; lon?: number; tags?: Record<string, string> }[] }) => {
            osmLayer.current?.clearLayers();
            let n = 0;
            d.elements.forEach((e) => {
              const lat = e.center?.lat ?? e.lat; const lon = e.center?.lon ?? e.lon;
              if (lat == null || lon == null) return;
              n++;
              const name = (e.tags?.["name"] ?? "Unnamed").replace(/</g, "&lt;");
              L.circleMarker([lat, lon], { radius: 4, color: "#2b6cb0", fillColor: "#63b3ed", fillOpacity: 0.8, weight: 1 })
                .bindPopup(`<b>${name}</b><br/>${label(e.tags)}<br/><small>From OpenStreetMap · no readings yet</small>`)
                .addTo(osmLayer.current ?? map).on("click", () => setSelected({ id: `osm-${e.type}-${e.id}`, name, source: "OpenStreetMap · location only", lat, lon }));
            });
            setStatus(`${n} waterways found in this view${z < 11 ? " (zoom in further to include unnamed ponds and streams)" : ""}.`);
          })
          .catch((err) => { if (err.name !== "AbortError") setStatus("Waterway lookup is busy — move the map to try again."); });
      };
      let usgsTimer: ReturnType<typeof setTimeout>;
      const fetchUsgs = () => {
        if (map.getZoom() < 5) { usgsLayer.current?.clearLayers(); setUsgsStatus("Zoom in (to country/state level) to load every USGS monitoring station with live stats."); return; }
        const b = map.getBounds();
        setUsgsStatus("Loading USGS stations…");
        getUsgsInBox({ data: { w: Math.max(-180, b.getWest()), s: Math.max(-90, b.getSouth()), e: Math.min(180, b.getEast()), n: Math.min(90, b.getNorth()) } }).then((r) => {
          usgsLayer.current?.clearLayers();
          if (r.error) { setUsgsStatus("USGS data is unavailable right now."); return; }
          r.points.forEach((pt) => {
            const rows = pt.readings.map((x) => `${x.label}: <b>${x.value}${x.unit ? " " + x.unit : ""}</b>`).join("<br/>");
            const m = L.circleMarker([pt.lat, pt.lon], { radius: 5, color: "#276749", fillColor: "#48bb78", fillOpacity: 0.9, weight: 1 })
              .bindPopup(`<b>USGS ${pt.id}</b><br/>${rows}<br/><small>Latest reading ${new Date(pt.readings[0]!.time).toLocaleString()}</small>`)
              .addTo(usgsLayer.current ?? map);
            const read = (match: string) => { const r = pt.readings.find((x) => x.label.toLowerCase().includes(match)); if (!r) return undefined; const v = Number(r.value); return Number.isFinite(v) ? v : undefined; };
            const observation: Observation = { id: `usgs-${pt.id}`, name: `USGS ${pt.id}`, source: "USGS · provisional", lat: pt.lat, lon: pt.lon, time: pt.readings[0]?.time, oxygen: read("oxygen"), temperature: read("temperature"), ph: read("ph") };
            m.on("click", () => setSelected(observation));
            m.on("popupopen", () => {
              getUsgsName({ data: { id: pt.id } }).then((n) => { if (n.name) { setSelected((current) => current?.id === observation.id ? { ...current, name: n.name } : current); m.setPopupContent(`<b>${esc(n.name)}</b><br/><small>${pt.id}</small><br/>${rows}<br/><small>Latest reading ${new Date(pt.readings[0]?.time ?? "").toLocaleString()}</small>`); } });
            });
          });
          setUsgsStatus(`${r.points.length} USGS monitoring stations with live stats in this view (USGS covers the US).`);
        });
      };
      fetchUsgs();
      map.on("moveend", () => { clearTimeout(timer); timer = setTimeout(fetchWater, 600); clearTimeout(usgsTimer); usgsTimer = setTimeout(fetchUsgs, 600); });
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
      const stats = [["Oxygen", s.do, "mg/L"], ["Water temp", s.temp, "°C"], ["pH", s.ph, ""], ["Turbidity", s.turbidity, "NTU"]].filter(([, v]) => v).map(([k, v, u]) => `${k}: <b>${esc(v!)} ${u}</b>`).join("<br/>");
      const imp = improvement(Number(s.doBefore) || undefined, Number(s.do) || undefined);
      L.circleMarker([s.lat, s.lng], { radius: 8, color: "#b7791f", fillColor: "#f6ad55", fillOpacity: 0.95, weight: 2 })
        .bindPopup(`<b>${esc(s.name)}</b><br/>${s.type} · added by you${stats ? `<br/>${stats}` : "<br/><small>No readings added</small>"}${imp !== null ? `<br/><b style="color:${imp >= 0 ? "#2f855a" : "#c53030"}">Oxygen ${imp >= 0 ? "+" : ""}${imp}% since treatment</b>` : ""}${s.note ? `<br/>${esc(s.note)}` : ""}`)
        .addTo(layer).on("click", () => {
          const numeric = (v?: string) => v?.trim() && Number.isFinite(Number(v)) ? Number(v) : undefined;
          setSelected({ id: s.id, name: s.name, source: "Your manual reading", lat: s.lat, lon: s.lng, oxygen: numeric(s.do), temperature: numeric(s.temp), ph: numeric(s.ph), turbidity: numeric(s.turbidity), previousOxygen: numeric(s.doBefore) });
        });
    });
  }, [spots, mapRef.current]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft || !form.name.trim()) return;
    const next = [...spots, { id: crypto.randomUUID(), ...form, name: form.name.trim().replace(/</g, ""), ...draft }];
    setSpots(next); localStorage.setItem(KEY, JSON.stringify(next));
    setDraft(null); setAddMode(false); setForm(emptyForm);
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
          <div ref={el} className="h-[620px] w-full" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{status}</p>
        <p className="text-sm text-muted-foreground">{usgsStatus}</p>
      </div>

      <aside className="min-w-0 space-y-6">
        {selected && <div className="border-b border-border pb-6"><h2 className="mb-4 break-words font-display text-3xl">{selected.name}</h2><WaterProfile key={selected.id} observation={selected} onSelect={(o) => { setSelected(o); mapRef.current?.setView([o.lat, o.lon], 11); }} /></div>}
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
              <p className="pt-1 text-xs text-muted-foreground">Readings (all optional)</p>
              <div className="grid grid-cols-2 gap-2">
                {([["do", "Oxygen mg/L"], ["temp", "Temp °C"], ["ph", "pH"], ["turbidity", "Turbidity NTU"], ["doBefore", "Oxygen before treatment"]] as const).map(([k, ph]) => (
                  <input key={k} inputMode="decimal" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value.replace(/[^0-9.]/g, "") })} placeholder={ph} className={`rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary ${k === "doBefore" ? "col-span-2" : ""}`} />
                ))}
              </div>
              <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Notes (optional)" rows={2} className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary" />
              <div className="flex gap-2">
                <button className="flex-1 rounded-full bg-primary py-2 text-sm text-primary-foreground">Save</button>
                <button type="button" onClick={() => { setDraft(null); setAddMode(false); }} className="rounded-full border border-border px-4 text-sm">Cancel</button>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 text-sm">
          <h4 className="font-medium">Treated sites — improvement</h4>
          <ul className="mt-2 space-y-2">
            {waterways.filter((w) => w.treated).map((w) => { const i = improvement(w.history[0], w.history[w.history.length - 1]); return (
              <li key={w.id} className="flex justify-between gap-2"><button onClick={() => mapRef.current?.setView([w.lat, w.lon], 11)} className="text-left hover:text-primary">{w.name}</button><span className="text-good">{w.history[0]} → {w.do} mg/L ({i! >= 0 ? "+" : ""}{i}%)</span></li>
            ); })}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Sample sites. Readings update when a new measurement is taken.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 text-sm">
          <h4 className="font-medium">Legend</h4>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-primary" /> Aquora sample waterways</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-good" /> USGS stations with live stats</li>
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
