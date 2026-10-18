import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://api.waterdata.usgs.gov/ogcapi/v0/collections";
import { fetchUsgsPages, normalizeUsgs, usgsParameters, type UsgsRecord } from "@/lib/usgs";
export type UsgsStation = UsgsRecord & { name: string };
const latestUrl = (bbox: string) => `${BASE}/latest-continuous/items?${new URLSearchParams({ f: "json", limit: "10000", bbox, parameter_code: Object.keys(usgsParameters).join(",") })}`;

export const getUsgsNearby = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }).parse(d))
  .handler(async ({ data }): Promise<{ stations: UsgsStation[]; error: string | null; partial: boolean }> => {
    const bbox = [Math.max(-180, data.lon - 0.6), Math.max(-90, data.lat - 0.6), Math.min(180, data.lon + 0.6), Math.min(90, data.lat + 0.6)].join(",");
    try {
      const response = await fetchUsgsPages(latestUrl(bbox));
      const all = normalizeUsgs(response.features).sort((a,b) => {
        const distance = (s: UsgsRecord) => (s.lat-data.lat)**2 + ((s.lon-data.lon)*Math.cos(data.lat*Math.PI/180))**2;
        return distance(a)-distance(b);
      });
      const stations: UsgsStation[] = all.slice(0, 12).map(s => ({...s, name: s.id}));
      await Promise.all(stations.map(async st => {
        try {
          const r = await fetch(`${BASE}/monitoring-locations/items/${encodeURIComponent(st.id)}?f=json`, {signal: AbortSignal.timeout(10000)});
          if (r.ok) { const j = await r.json() as {properties: Record<string,unknown>}; const name = j.properties['monitoring_location_name']; if (name) st.name = String(name); }
        } catch { /* retain the station identifier */ }
      }));
      return { stations, error: null, partial: response.partial || all.length > stations.length };
    } catch (e) {
      return { stations: [], error: e instanceof Error ? e.message : "USGS unavailable", partial: false };
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
        if (m.ok) { const mj = (await m.json()) as { current?: { sea_surface_temperature?: number | null } }; const sst = mj.current?.sea_surface_temperature; seaTemp = sst != null ? Math.round((sst * 9 / 5 + 32) * 10) / 10 : null; }
      } catch { /* inland waters have no marine data */ }
      return {
        weather: {
          temperature_2m: j.main?.temp != null ? Math.round((j.main.temp * 9 / 5 + 32) * 10) / 10 : null,
          wind_speed_10m: j.wind?.speed != null ? Math.round(j.wind.speed * 2.23694 * 10) / 10 : null,
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

export type UsgsPoint = UsgsRecord;
export const getUsgsInBox = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ w: z.number().min(-180).max(180), s: z.number().min(-90).max(90), e: z.number().min(-180).max(180), n: z.number().min(-90).max(90) }).parse(d))
  .handler(async ({ data }): Promise<{ points: UsgsPoint[]; error: string | null; partial: boolean }> => {
    try {
      const response = await fetchUsgsPages(latestUrl([data.w,data.s,data.e,data.n].join(",")));
      return {points: normalizeUsgs(response.features), error: null, partial: response.partial};
    } catch (e) { return {points: [], error: e instanceof Error ? e.message : "USGS unavailable", partial: false}; }
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
