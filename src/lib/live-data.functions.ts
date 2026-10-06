import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://api.waterdata.usgs.gov/ogcapi/v0/collections";
const PARAMS: Record<string, { label: string; unit: string }> = {
  "00300": { label: "Dissolved O₂", unit: "mg/L" },
  "00010": { label: "Water temp", unit: "°C" },
  "00400": { label: "pH", unit: "" },
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
    const key = process.env.USGS_API_KEY;
    const r = 0.6;
    const bbox = [data.lon - r, data.lat - r, data.lon + r, data.lat + r].map((n) => n.toFixed(3)).join(",");
    const q = (path: string, extra: string) =>
      fetch(`${BASE}/${path}/items?f=json&limit=300&bbox=${bbox}${extra}${key ? `&api_key=${key}` : ""}`).then(async (res) => {
        if (!res.ok) throw new Error(`USGS responded ${res.status}`);
        return ((await res.json()) as { features?: Feature[] }).features ?? [];
      });
    try {
      const [latest, sites] = await Promise.all([
        q("latest-continuous", `&parameter_code=${Object.keys(PARAMS).join(",")}`),
        q("monitoring-locations", "&properties=id,monitoring_location_name"),
      ]);
      const names = new Map(sites.map((f) => [String(f.properties.id), String(f.properties.monitoring_location_name ?? "")]));
      const byId = new Map<string, UsgsStation>();
      for (const f of latest) {
        const p = f.properties;
        const v = p.value == null ? NaN : Number(p.value);
        const meta = PARAMS[String(p.parameter_code)];
        if (!meta || !Number.isFinite(v)) continue;
        const id = String(p.monitoring_location_id);
        const st = byId.get(id) ?? { id, name: names.get(id) || id, readings: [] };
        if (!st.readings.some((x) => x.code === p.parameter_code))
          st.readings.push({ code: String(p.parameter_code), ...meta, value: v, time: String(p.time) });
        byId.set(id, st);
      }
      const stations = [...byId.values()]
        .sort((a, b) => b.readings.length - a.readings.length)
        .slice(0, 8);
      return { stations, error: null };
    } catch (e) {
      return { stations: [], error: e instanceof Error ? e.message : "USGS data unavailable" };
    }
  });

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ lat: z.number(), lon: z.number() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}&current=temperature_2m,wind_speed_10m,precipitation,cloud_cover`,
      );
      if (!res.ok) throw new Error(`Weather service responded ${res.status}`);
      const j = (await res.json()) as { current: { temperature_2m: number; wind_speed_10m: number; precipitation: number; cloud_cover: number } };
      return { weather: j.current, error: null };
    } catch (e) {
      return { weather: null, error: e instanceof Error ? e.message : "Weather unavailable" };
    }
  });
