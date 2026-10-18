import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, CloudSun, Loader2, Radio } from "lucide-react";
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
              ["Air", w.data.weather.temperature_2m != null ? `${w.data.weather.temperature_2m}°F` : "—"],
              ["Wind", w.data.weather.wind_speed_10m != null ? `${w.data.weather.wind_speed_10m} mph` : "—"],
              ["Rain", `${w.data.weather.precipitation} mm`],
              ["Clouds", w.data.weather.cloud_cover != null ? `${w.data.weather.cloud_cover}%` : "—"],
              ...(w.data.weather.sea_surface_temperature != null ? [["Sea surface", `${w.data.weather.sea_surface_temperature}°F`] as string[]] : []),
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
          <div><p className="mt-2 text-sm text-muted-foreground">Station readings couldn't be loaded right now.</p><Button variant="outline" className="mt-3" onClick={() => u.refetch()}>Try again</Button></div>
        ) : !u.data?.stations.length ? (
          <p className="mt-2 text-sm text-muted-foreground">No live stations reported near this location.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {u.data.stations.map((s) => {
              return (
              <li key={s.id} className="py-2">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2">
                    <span className="text-sm font-medium">{titleCase(s.name)}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">{s.readings.length} readings <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></span>
                  </summary>
                  <ul className="mt-2 space-y-2">
                    {s.readings.map((r) => (
                      <li key={r.code} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
                        <span>{r.label}</span>
                        <span className="flex items-center gap-2"><b>{r.value}</b> <span className="text-xs text-muted-foreground">{r.unit}</span> <MeasurementTag metric={usgsParameters[r.code]?.key ?? "temperature"} value={r.value} /></span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted-foreground">Updated {new Date(usgsObservation(s).time ?? "").toLocaleDateString()}</p>
                  <details className="mt-3"><summary className="cursor-pointer text-sm text-primary">What this water needs</summary><div className="mt-4"><WaterProfile observation={usgsObservation(s, titleCase(s.name))} /></div></details>
                  <details className="mt-2"><summary className="cursor-pointer text-sm text-primary">History</summary><StationHistory id={s.id} /></details>
                </details>
              </li>
              );
            })}
          </ul>
        )}
        {u.data?.partial && <p className="mt-2 text-xs text-warn-foreground">Showing up to 12 nearby stations; response limits may apply.</p>}
        <p className="mt-2 text-xs text-muted-foreground">Source: U.S. Geological Survey</p>
      </div>
    </div>
  );
}

function Loading() {
  return <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading live data…</p>;
}
