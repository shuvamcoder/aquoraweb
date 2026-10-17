import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CloudSun, Loader2, Radio } from "lucide-react";
import { getUsgsNearby, getWeather } from "@/lib/live-data.functions";
import { StationHistory } from "@/components/StationHistory";
import { WaterProfile } from "@/components/WaterProfile";

import { usgsObservation, usgsParameters } from "@/lib/usgs";
import { MeasurementTag } from "@/components/MeasurementTag";
import { Button } from "@/components/ui/button";

const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\bNr\b/g, "near").replace(/\bAt\b/g, "at");

export function LiveData({ lat, lon }: { lat: number; lon: number }) {
  const usgs = useServerFn(getUsgsNearby);
  const wx = useServerFn(getWeather);
  const u = useQuery({ queryKey: ["usgs", lat, lon], queryFn: () => usgs({ data: { lat, lon } }), staleTime: 5 * 60_000 });
  const w = useQuery({ queryKey: ["wx", lat, lon], queryFn: () => wx({ data: { lat, lon } }), staleTime: 10 * 60_000 });

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-lg border border-border p-5">
        <h4 className="flex items-center gap-2 font-display text-xl"><CloudSun className="h-5 w-5 text-primary" /> Atmosphere</h4>
        {w.isLoading ? <Loading /> : w.data?.weather ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
            {[
              ["Air", w.data.weather.temperature_2m != null ? `${w.data.weather.temperature_2m}°C` : "—"],
              ["Wind", w.data.weather.wind_speed_10m != null ? `${w.data.weather.wind_speed_10m} km/h` : "—"],
              ["Rain", `${w.data.weather.precipitation} mm`],
              ["Clouds", w.data.weather.cloud_cover != null ? `${w.data.weather.cloud_cover}%` : "—"],
              ...(w.data.weather.sea_surface_temperature != null ? [["Sea surface", `${w.data.weather.sea_surface_temperature}°C`] as string[]] : []),
            ].map(([k, v]) => (
              <div key={k} className="rounded-md bg-secondary p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="font-medium">{v}</div></div>
            ))}
          </div>
        ) : <p className="mt-2 text-sm text-muted-foreground">Weather isn't available right now.</p>}
        {w.data?.weather?.description && <p className="mt-2 text-sm capitalize text-muted-foreground">{w.data.weather.description}</p>}
        <p className="mt-2 text-xs text-muted-foreground">Source: OpenWeather</p>
      </div>

      <div className="rounded-lg border border-border p-5">
        <h4 className="flex items-center gap-2 font-display text-xl"><Radio className="h-5 w-5 text-primary" /> Sensing network</h4>
        {u.isLoading ? <Loading /> : u.isError || u.data?.error ? (
          <div><p className="mt-2 text-sm text-muted-foreground">USGS data couldn't be loaded right now.</p><Button variant="outline" className="mt-3" onClick={() => u.refetch()}>Retry USGS</Button></div>
        ) : !u.data?.stations.length ? (
          <p className="mt-2 text-sm text-muted-foreground">No USGS measurements returned near this location. USGS covers U.S. monitoring stations, not every waterway.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {u.data.stations.map((s) => {
              return (
              <li key={s.id} className="py-3">
                <p className="text-sm font-medium">{titleCase(s.name)}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {s.readings.map((r) => (
                    <span key={r.code} className="rounded-md bg-secondary px-2.5 py-1 text-xs">{r.label}: <b>{r.value}</b> {r.unit} <MeasurementTag metric={usgsParameters[r.code]?.key ?? "temperature"} value={r.value} /><span className="ml-2 text-muted-foreground">{r.time && Number.isFinite(Date.parse(r.time)) ? new Date(r.time).toLocaleString() : "Date unavailable"}</span><span className="ml-2 text-muted-foreground">{r.approval}</span></span>
                  ))}
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-primary">Station fingerprint & comparison</summary>
                  <div className="mt-4"><WaterProfile observation={usgsObservation(s, titleCase(s.name))} /></div>
                </details>
                <details className="mt-3"><summary className="cursor-pointer text-sm text-primary">Explore recorded history</summary><StationHistory id={s.id} /></details>
              </li>
              );
            })}
          </ul>
        )}
        {u.data?.partial && <p className="mt-2 text-xs text-warn-foreground">Showing up to 12 nearby stations; response limits may apply.</p>}
        <p className="mt-2 text-xs text-muted-foreground">Source: U.S. Geological Survey · latest recorded readings (may be historical; check each date)</p>
      </div>
    </div>
  );
}

function Loading() {
  return <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading live data…</p>;
}
