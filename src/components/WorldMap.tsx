import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LiveData } from "@/components/LiveData";
import { usgsObservation, usgsParameters } from "@/lib/usgs";
import { measurementStatus, hasMeasurements } from "@/lib/measurement-status";
import { StationHistory } from "@/components/StationHistory";
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

export function WorldMap({ preview = false }: { preview?: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const osmLayer = useRef<Leaflet.LayerGroup | null>(null);
  const userLayer = useRef<Leaflet.LayerGroup | null>(null);
  const usgsLayer = useRef<Leaflet.LayerGroup | null>(null);
  const [usgsStatus, setUsgsStatus] = useState("");
  const addModeRef = useRef(false);
  const [measurement, setMeasurement] = useState("all");
  const measurementRef = useRef("all");
  useEffect(() => { measurementRef.current = measurement; mapRef.current?.fire("moveend"); }, [measurement]);

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
      const tokens = getComputedStyle(document.documentElement);
      const primary = tokens.getPropertyValue("--primary").trim();
      const good = tokens.getPropertyValue("--good").trim();
      const accent = tokens.getPropertyValue("--accent").trim();
      const map = L.map(el.current, { worldCopyJump: true, preferCanvas: true }).setView([39, -98], 5);
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
        L.circleMarker([w.lat, w.lon], {radius:6,color:primary,fillColor:primary,fillOpacity:0.8,weight:1})
          .bindPopup(`<b>${esc(w.name)}</b><br/>${w.type} · ${esc(w.region)}<br/><small>Catalog location only · no assumed readings</small><br/><small>Select for nearby USGS observations</small>`)
          .addTo(map).on("click", () => setSelected(catalogObservation(w)));
      });

      const label = (t: Record<string, string> = {}) => {
        const ww = t["waterway"]; const wa = t["water"];
        if (ww) return ww.charAt(0).toUpperCase() + ww.slice(1);
        if (wa) return wa.charAt(0).toUpperCase() + wa.slice(1);
        if (t["natural"] === "wetland") return "Wetland";
        if (t["landuse"] === "reservoir") return "Reservoir";
        if (t["natural"] === "bay") return "Bay";
        return "Water body";
      };

      const fetchWater = () => {
        const z = map.getZoom();
        if (z < 8) { osmLayer.current?.clearLayers(); setStatus("Waterway locations are shown on the base map. Zoom in for clickable OpenStreetMap features."); return; }
        const b = map.getBounds();
        const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
        const nameFilter = z < 11 ? `["name"]` : "";
        const q = `[out:json][timeout:25];(nwr["natural"~"^(water|wetland|bay|spring)$"]${nameFilter}(${bbox});nwr["landuse"="reservoir"]${nameFilter}(${bbox});way["waterway"~"^(river|stream|canal|brook|creek|drain|ditch|tidal_channel)$"]${nameFilter}(${bbox});node["natural"="spring"](${bbox}););out center tags;`;
        ctrl?.abort();
        ctrl = new AbortController();
        setStatus("Loading available waterways in this area…");
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
              L.circleMarker([lat, lon], { radius: 4, color: accent, fillColor: accent, fillOpacity: 0.8, weight: 1 })
                .bindPopup(`<b>${name}</b><br/>${label(e.tags)}<br/><small>From OpenStreetMap · no readings yet</small>`)
                .addTo(osmLayer.current ?? map).on("click", () => setSelected({ id: `osm-${e.type}-${e.id}`, name, source: "OpenStreetMap · location only", lat, lon }));
            });
            setStatus(`${n} waterways found in this view${z < 11 ? " (zoom in further to include unnamed ponds and streams)" : ""}.`);
          })
          .catch((err) => { if (err.name !== "AbortError") setStatus("Waterway lookup is busy — move the map to try again."); });
      };
      let usgsTimer: ReturnType<typeof setTimeout>;
      let requestId = 0;
      const fetchUsgs = () => {
        const currentRequest = ++requestId;
        if (map.getZoom() < 5) { usgsLayer.current?.clearLayers(); setUsgsStatus("Zoom in to load USGS stations. USGS covers the United States; global waterways are a future addition."); return; }
        const b = map.getBounds();
        setUsgsStatus("Loading USGS stations…");
        getUsgsInBox({ data: { w: Math.max(-180, b.getWest()), s: Math.max(-90, b.getSouth()), e: Math.min(180, b.getEast()), n: Math.min(90, b.getNorth()) } }).then((r) => {
          if (cancelled || currentRequest !== requestId) return;
          usgsLayer.current?.clearLayers();
          if (r.error) { setUsgsStatus("USGS data is unavailable right now."); return; }
          r.points.filter(pt => measurementRef.current === "all" || pt.readings.some(x => usgsParameters[x.code]?.key === measurementRef.current)).forEach((pt) => {
            const rows = pt.readings.map(x => {
              const tag = measurementStatus(usgsParameters[x.code]?.key ?? "temperature", x.value);
              const color = tag.tone === "muted" ? "muted-foreground" : tag.tone === "warn" ? "warn-foreground" : tag.tone;
              return `${x.label}: <b>${x.value} ${x.unit}</b> <span style="color:var(--${color})">● ${tag.label}</span><br/><small>${new Date(x.time).toLocaleString()} · ${esc(x.approval)}</small>`;
            }).join("<br/>");
            const m = L.circleMarker([pt.lat, pt.lon], { radius: 5, color: good, fillColor: good, fillOpacity: 0.9, weight: 1 })
              .bindPopup(`<b>USGS ${pt.id}</b><br/>${rows}<br/><small>Latest reading ${pt.readings[0]?.time ? new Date(pt.readings[0].time).toLocaleString() : "Date unavailable"}</small>`)
              .addTo(usgsLayer.current ?? map);
            const observation = usgsObservation(pt);
            m.on("click", () => setSelected(observation));
            m.on("popupopen", () => {
              getUsgsName({ data: { id: pt.id } }).then((n) => { const name = n.name; if (name) { setSelected((current) => current?.id === observation.id ? { ...current, name } : current); m.setPopupContent(`<b>${esc(name)}</b><br/><small>${pt.id}</small><br/>${rows}<br/><small>Latest reading ${new Date(pt.readings[0]?.time ?? "").toLocaleString()}</small>`); } });
            });
          });
          setUsgsStatus(`${r.points.length} USGS stations with recorded values in this view. U.S. coverage; check reading dates.${r.partial ? " Partial response — zoom in for more complete coverage." : ""}`);
        }).catch(() => { if (!cancelled && currentRequest === requestId) setUsgsStatus("USGS data could not be loaded. Move the map to retry."); });
      };
      fetchWater();
      fetchUsgs();
      map.on("moveend", () => { clearTimeout(timer); timer = setTimeout(fetchWater, 600); clearTimeout(usgsTimer); usgsTimer = setTimeout(fetchUsgs, 600); });
      map.on("click", (e: Leaflet.LeafletMouseEvent) => {
        if (!addModeRef.current) return;
        setDraft({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    });
    return () => { cancelled = true; ctrl?.abort(); mapRef.current?.remove(); mapRef.current = null; };
  }, [preview]);

  // render user spots
  useEffect(() => {
    const L = LRef.current; const layer = userLayer.current;
    if (!L || !layer) return;
    layer.clearLayers();
    spots.forEach((s) => {
      const stats = [["Oxygen", s.do, "mg/L"], ["Water temp", s.temp, "°C"], ["pH", s.ph, ""], ["Turbidity", s.turbidity, "NTU"]].filter(([, v]) => v).map(([k, v, u]) => `${k}: <b>${esc(v ?? "")} ${u}</b>`).join("<br/>");
      const imp = improvement(Number(s.doBefore) || undefined, Number(s.do) || undefined);
      L.circleMarker([s.lat, s.lng], { radius: 8, color: getComputedStyle(document.documentElement).getPropertyValue("--warn").trim(), fillColor: getComputedStyle(document.documentElement).getPropertyValue("--warn").trim(), fillOpacity: 0.95, weight: 2 })
        .bindPopup(`<b>${esc(s.name)}</b><br/>${s.type} · added by you${stats ? `<br/>${stats}` : "<br/><small>No readings added</small>"}${imp !== null ? `<br/><b style="color:${imp >= 0 ? "var(--good)" : "var(--destructive)"}">Oxygen ${imp >= 0 ? "+" : ""}${imp}% between your readings</b>` : ""}${s.note ? `<br/>${esc(s.note)}` : ""}`)
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
    <div className={`grid gap-6 ${preview ? "" : "lg:grid-cols-[1fr_320px]"}`}>
      <div>
        <form onSubmit={goSearch} className="mb-3 flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Find a map location" placeholder="Find a place — e.g. Lake Geneva" className="min-w-0 flex-1 rounded-full border border-input bg-card px-5 py-2.5 outline-none focus:border-primary" />
          <Button type="submit">Go</Button>
        </form>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm"><label htmlFor={preview ? "preview-measurement" : "map-measurement"}>USGS measurement</label><select id={preview ? "preview-measurement" : "map-measurement"} value={measurement} onChange={e => setMeasurement(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2"><option value="all">All available</option><option value="oxygen">Dissolved oxygen</option><option value="temperature">Temperature</option><option value="ph">pH</option><option value="conductance">Specific conductance</option><option value="streamflow">Streamflow</option></select></div>
        <div className={`relative overflow-hidden rounded-lg border border-border ${addMode ? "cursor-crosshair ring-2 ring-primary" : ""}`}>
          <div ref={el} aria-label="Interactive waterway map" className={preview ? "h-[380px] w-full" : "h-[480px] w-full sm:h-[620px]"} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{status}</p>
        <p className="text-sm text-muted-foreground">{usgsStatus}</p>
      </div>

      {!preview && <aside className="min-w-0 space-y-6">
        {selected && <div className="border-b border-border pb-6"><h2 className="mb-4 break-words font-display text-3xl">{selected.name}</h2>{hasMeasurements(selected) && <WaterProfile key={selected.id} observation={selected} onSelect={(o) => { setSelected(o); mapRef.current?.setView([o.lat, o.lon], 11); }} />}{selected.id.startsWith("usgs-") && <StationHistory id={selected.id.slice(5)} />}{!hasMeasurements(selected) && !selected.id.startsWith("usgs-") && <LiveData key={selected.id} lat={selected.lat} lon={selected.lon} />}</div>}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-display text-2xl">Add a waterway</h3>
          {!addMode && !draft && (
            <>
              <p className="mt-1 text-sm text-muted-foreground">Know a pond, creek or lake that's missing? Pin it.</p>
              <Button onClick={() => setAddMode(true)} className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm text-primary-foreground">Pin a location</Button>
            </>
          )}
          {addMode && !draft && (
            <>
              <p className="mt-1 text-sm text-primary">Click anywhere on the map to drop your pin.</p>
              <Button onClick={() => setAddMode(false)} className="mt-3 text-sm text-muted-foreground underline">Cancel</Button>
            </>
          )}
          {draft && (
            <form onSubmit={save} className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">{draft.lat.toFixed(4)}, {draft.lng.toFixed(4)}</p>
              <input aria-label="Waterway name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Waterway name" className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2">
                {["Lake", "River", "Creek", "Pond", "Reservoir", "Wetland"].map((t) => <option key={t}>{t}</option>)}
              </select>
              <p className="pt-1 text-xs text-muted-foreground">Readings (all optional)</p>
              <div className="grid grid-cols-2 gap-2">
                {([["do", "Oxygen mg/L"], ["temp", "Temp °C"], ["ph", "pH"], ["turbidity", "Turbidity NTU"], ["doBefore", "Oxygen before treatment"]] as const).map(([k, ph]) => (
                  <input aria-label={ph} key={k} inputMode="decimal" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value.replace(/[^0-9.]/g, "") })} placeholder={ph} className={`rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary ${k === "doBefore" ? "col-span-2" : ""}`} />
                ))}
              </div>
              <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Notes (optional)" rows={2} className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-primary" />
              <div className="flex gap-2">
                <Button className="flex-1 rounded-full bg-primary py-2 text-sm text-primary-foreground">Save</Button>
                <Button type="button" onClick={() => { setDraft(null); setAddMode(false); }} className="rounded-full border border-border px-4 text-sm">Cancel</Button>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 text-sm">
          <h4 className="font-medium">Legend</h4>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-primary" /> Catalog locations · no readings</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-good" /> USGS stations · recorded values</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-accent ring-1 ring-primary/40" /> Waterways from OpenStreetMap</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-warn" /> Added by you</li>
          </ul>
        </div>

        {spots.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-5">
            <h4 className="font-medium">Your pins</h4>
            <ul className="mt-2 space-y-2 text-sm">
              {spots.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <Button onClick={() => mapRef.current?.setView([s.lat, s.lng], 12)} className="text-left hover:text-primary">{s.name} <span className="text-muted-foreground">· {s.type}</span></Button>
                  <Button onClick={() => remove(s.id)} className="text-xs text-muted-foreground hover:text-destructive">Remove</Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>}{preview && selected && <div><WaterProfile key={selected.id} observation={selected} />{selected.id.startsWith("usgs-") && <StationHistory id={selected.id.slice(5)} />}{!hasMeasurements(selected) && !selected.id.startsWith("usgs-") && <LiveData key={selected.id} lat={selected.lat} lon={selected.lon} />}</div>}
    </div>
  );
}
