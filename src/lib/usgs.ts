import type { Observation } from "@/lib/observations";

export const usgsParameters: Record<string, { label: string; unit: string; key: "oxygen" | "temperature" | "ph" | "conductance" | "streamflow" }> = {
  "00300": { label: "Dissolved oxygen", unit: "mg/L", key: "oxygen" },
  "00010": { label: "Water temperature", unit: "°C", key: "temperature" },
  "00400": { label: "pH", unit: "", key: "ph" },
  "00095": { label: "Specific conductance", unit: "µS/cm at 25 °C", key: "conductance" },
  "00060": { label: "Streamflow", unit: "ft³/s", key: "streamflow" },
};
export type UsgsReading = { code: string; label: string; unit: string; value: number; time: string; approval: string };
export type UsgsRecord = { id: string; lat: number; lon: number; readings: UsgsReading[] };
export type UsgsFeature = { geometry?: { coordinates?: number[] }; properties: Record<string, unknown> };

export function normalizeUsgs(features: UsgsFeature[]): UsgsRecord[] {
  const stations = new Map<string, UsgsRecord>();
  for (const f of features) {
    const p = f.properties, code = String(p['parameter_code'] ?? ''), meta = usgsParameters[code];
    const value = p['value'] == null || String(p['value']).trim() === '' ? NaN : Number(p['value']);
    const lat = f.geometry?.coordinates?.[1], lon = f.geometry?.coordinates?.[0];
    const id = String(p['monitoring_location_id'] ?? ''), time = String(p['time'] ?? '');
    if (!meta || !id || !Number.isFinite(value) || !Number.isFinite(Date.parse(time)) || lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const station = stations.get(id) ?? { id, lat, lon, readings: [] };
    const reading = { code, label: meta.label, unit: meta.unit, value, time, approval: String(p['approval_status'] ?? 'Status not supplied') };
    const index = station.readings.findIndex(r => r.code === code);
    if (index < 0) station.readings.push(reading);
    else if (Date.parse(time) > Date.parse(station.readings[index]?.time ?? '')) station.readings[index] = reading;
    stations.set(id, station);
  }
  return [...stations.values()];
}

export function usgsObservation(station: UsgsRecord, name = `USGS ${station.id}`): Observation {
  const observation: Observation = { id: `usgs-${station.id}`, name, source: 'USGS · latest recorded observations', lat: station.lat, lon: station.lon, time: station.readings.map(r => r.time).sort((a, b) => Date.parse(b) - Date.parse(a))[0], metricTimes: {} };
  for (const r of station.readings) {
    const key = usgsParameters[r.code]?.key;
    if (!key) continue;
    observation[key] = r.value;
    if (observation.metricTimes) observation.metricTimes[key] = r.time;
  }
  return observation;
}

export async function fetchUsgsPages(url: string, fetcher: typeof fetch = fetch) {
  const features: UsgsFeature[] = [];
  let next: string | undefined = url;
  let pages = 0;
  while (next && pages < 5) {
    const response = await fetcher(next, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`USGS responded ${response.status}`);
    const data = await response.json() as { features?: UsgsFeature[]; links?: { rel: string; href: string }[] };
    features.push(...(data.features ?? []));
    const href = data.links?.find(l => l.rel === 'next')?.href;
    next = href && new URL(href).origin === 'https://api.waterdata.usgs.gov' ? href : undefined;
    pages++;
  }
  return { features, partial: Boolean(next) };
}