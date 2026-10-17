import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://api.waterdata.usgs.gov/ogcapi/v0/collections";
const PARAMS: Record<string, { label: string; unit: string }> = {
  "00300": { label: "Dissolved O₂", unit: "mg/L" },
  "00010": { label: "Water temp", unit: "°C" },
  "00400": { label: "pH", unit: "" },
  "00095": { label: "Conductance", unit: "µS/cm" },
  "00060": { label: "Streamflow", unit: "ft³/s" },
};

export type UsgsStation = {
  id: string;
  name: string;
  readings: { code: string; label: string; unit: string; value: number; time: string }[];
};

type Feature = { properties: Record<string, unknown> };

export const getUsgsNearby = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }).parse(d))
  .handler(async ({ data }): Promise<{ stations: UsgsStation[]; error: string | null }> => {
    const key = process.env['USGS_API_KEY'];
    const r = 0.6;
    const bbox = [data.lon - r, data.lat - r, data.lon + r, data.lat + r].map((n) => n.toFixed(3)).join(",");
    const q = (path: string, extra: string) =>
      fetch(`${BASE}/${path}/items?f=json&limit=300&bbox=${bbox}${extra}${key ? `&api_key=${key}` : ""}`).then(async (res) => {
        if (!res.ok) throw new Error(`USGS responded ${res.status}`);
        return ((await res.json()) as { features?: Feature[] }).features ?? [];
      });
    try {
      const latest = await q("latest-continuous", `&parameter_code=${Object.keys(PARAMS).join(",")}`);
      const names = new Map<string, string>();
      const byId = new Map<string, UsgsStation>();
      for (const f of latest) {
        const p = f.properties;
        const v = p['value'] == null ? NaN : Number(p['value']);
        const meta = PARAMS[String(p['parameter_code'])];
        if (!meta || !Number.isFinite(v)) continue;
        const id = String(p['monitoring_location_id']);
        const st = byId.get(id) ?? { id, name: names.get(id) || id, readings: [] };
        if (!st.readings.some((x) => x.code === p['parameter_code']))
          st.readings.push({ code: String(p['parameter_code']), ...meta, value: v, time: String(p['time']) });
        byId.set(id, st);
      }
      const stations = [...byId.values()]
        .sort((a, b) => b.readings.length - a.readings.length)
        .slice(0, 8);
      await Promise.all(stations.map(async (st) => {
        try {
          const r = await fetch(`${BASE}/monitoring-locations/items/${st.id}?f=json${key ? `&api_key=${key}` : ""}`);
          if (r.ok) { const j = (await r.json()) as Feature; const n = j.properties['monitoring_location_name']; if (n) st.name = String(n); }
        } catch { /* keep id as name */ }
      }));
      return { stations, error: null };
    } catch (e) {
      return { stations: [], error: e instanceof Error ? e.message : "USGS data unavailable" };
    }
  });

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ lat: z.number(), lon: z.number() }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env['OPENWEATHERMAP_API_KEY'];
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${data.lat}&lon=${data.lon}&units=metric${key ? `&appid=${key}` : ""}`,
      );
      if (!res.ok) throw new Error(`Weather service responded ${res.status}`);
      const j = (await res.json()) as {
        main?: { temp?: number };
        wind?: { speed?: number };
        rain?: { "1h"?: number };
        clouds?: { all?: number };
        weather?: { description?: string }[];
      };
      let seaTemp: number | null = null;
      try {
        const m = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${data.lat}&longitude=${data.lon}&current=sea_surface_temperature`);
        if (m.ok) { const mj = (await m.json()) as { current?: { sea_surface_temperature?: number | null } }; seaTemp = mj.current?.sea_surface_temperature ?? null; }
      } catch { /* inland waters have no marine data */ }
      return {
        weather: {
          temperature_2m: j.main?.temp ?? null,
          wind_speed_10m: j.wind?.speed != null ? Math.round(j.wind.speed * 3.6 * 10) / 10 : null,
          precipitation: j.rain?.["1h"] ?? 0,
          cloud_cover: j.clouds?.all ?? null,
          description: j.weather?.[0]?.description ?? null,
          sea_surface_temperature: seaTemp,
        },
        error: null,
      };
    } catch (e) {
      return { weather: null, error: e instanceof Error ? e.message : "Weather unavailable" };
    }
  });

export type UsgsPoint = { id: string; lat: number; lon: number; readings: { label: string; unit: string; value: number; time: string }[] };

export const getUsgsInBox = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ w: z.number(), s: z.number(), e: z.number(), n: z.number() }).parse(d))
  .handler(async ({ data }): Promise<{ points: UsgsPoint[]; error: string | null }> => {
    const key = process.env['USGS_API_KEY'];
    const bbox = [data.w, data.s, data.e, data.n].map((x) => x.toFixed(3)).join(",");
    try {
      const res = await fetch(`${BASE}/latest-continuous/items?f=json&limit=10000&bbox=${bbox}&parameter_code=${Object.keys(PARAMS).join(",")}${key ? `&api_key=${key}` : ""}`);
      if (!res.ok) throw new Error(`USGS responded ${res.status}`);
      const j = (await res.json()) as { features?: { geometry?: { coordinates?: number[] }; properties: Record<string, unknown> }[] };
      const byId = new Map<string, UsgsPoint>();
      for (const f of j.features ?? []) {
        const p = f.properties; const c = f.geometry?.coordinates;
        const meta = PARAMS[String(p['parameter_code'])];
        const v = p['value'] == null ? NaN : Number(p['value']);
        if (!meta || !c || !Number.isFinite(v)) continue;
        const id = String(p['monitoring_location_id']);
        const pt = byId.get(id) ?? { id, lat: c[1]!, lon: c[0]!, readings: [] };
        if (!pt.readings.some((r) => r.label === meta.label)) pt.readings.push({ ...meta, value: v, time: String(p['time']) });
        byId.set(id, pt);
      }
      return { points: [...byId.values()], error: null };
    } catch (e) {
      return { points: [], error: e instanceof Error ? e.message : "USGS data unavailable" };
    }
  });

export const getUsgsName = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().regex(/^[A-Za-z0-9-]+$/) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env['USGS_API_KEY'];
    try {
      const r = await fetch(`${BASE}/monitoring-locations/items/${data.id}?f=json${key ? `&api_key=${key}` : ""}`);
      if (!r.ok) return { name: null };
      const j = (await r.json()) as { properties: Record<string, unknown> };
      return { name: j.properties['monitoring_location_name'] ? String(j.properties['monitoring_location_name']) : null };
    } catch { return { name: null }; }
  });
