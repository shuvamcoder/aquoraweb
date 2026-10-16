import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CloudSun, Loader2, Radio } from "lucide-react";
import { getUsgsNearby, getWeather } from "@/lib/live-data.functions";
import { StationHistory } from "@/components/StationHistory";
import { stationRecordUrl } from "@/lib/usgs-history";
import { WaterProfile } from "@/components/WaterProfile";

export function LiveData({ lat, lon }: { lat: number; lon: number }) {
  const usgs = useServerFn(getUsgsNearby);
  const wx = useServerFn(getWeather);
  const u = useQuery({ queryKey: ["usgs", lat, lon], queryFn: () => usgs({ data: { lat, lon } }), staleTime: 5 * 60_000 });
  const w = useQuery({ queryKey: ["wx", lat, lon], queryFn: () => wx({ data: { lat, lon } }), staleTime: 10 * 60_000 });

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-lg border border-border p-5">
        <h4 className="flex items-center gap-2 font-display text-xl"><CloudSun className="h-5 w-5 text-primary" /> Weather right now</h4>
        {w.isLoading ? <Loading /> : w.data?.weather ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
            {[["Air", `${w.data.weather.temperature_2m}°C`], ["Wind", `${w.data.weather.wind_speed_10m} km/h`], ["Rain", `${w.data.weather.precipitation} mm`], ["Clouds", `${w.data.weather.cloud_cover}%`], ...(w.data.weather.sea_surface_temperature != null ? [["Sea surface", `${w.data.weather.sea_surface_temperature}°C`]] : [])].map(([k, v]) => (
              <div key={k} className="rounded-md bg-secondary p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="font-medium">{v}</div></div>
            ))}
          </div>
        ) : <p className="mt-2 text-sm text-muted-foreground">Weather isn't available right now.</p>}
        <p className="mt-2 text-xs text-muted-foreground">Source: Open-Meteo</p>
      </div>

      <div className="rounded-lg border border-border p-5">
        <h4 className="flex items-center gap-2 font-display text-xl"><Radio className="h-5 w-5 text-primary" /> Live USGS monitoring stations nearby</h4>
        {u.isLoading ? <Loading /> : u.data?.error ? (
          <p className="mt-2 text-sm text-muted-foreground">USGS data couldn't be loaded right now. Please try again later or open USGS Water Data directly.</p>
        ) : !u.data?.stations.length ? (
          <p className="mt-2 text-sm text-muted-foreground">No active USGS stations reporting near this waterway.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {u.data.stations.map((s) => (
              <li key={s.id} className="py-3">
                <a href={stationRecordUrl(s.id)} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary underline">{s.name} ↗</a>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {s.readings.map((r) => (
                    <span key={r.code} className="rounded-full bg-secondary px-2.5 py-1 text-xs">{r.label}: <b>{r.value}</b> {r.unit}<span className="ml-2 text-muted-foreground">{r.time && Number.isFinite(Date.parse(r.time)) ? new Date(r.time).toLocaleString() : "Date unavailable"}</span></span>
                  ))}
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-primary">Station fingerprint & comparison</summary>
                  <div className="mt-4"><WaterProfile observation={{ id: `usgs-${s.id}`, name: s.name, source: "USGS · provisional", lat, lon, time: s.readings[0]?.time, oxygen: s.readings.find((r) => r.code === "00300")?.value != null ? Number(s.readings.find((r) => r.code === "00300")?.value) : undefined, temperature: s.readings.find((r) => r.code === "00010")?.value != null ? Number(s.readings.find((r) => r.code === "00010")?.value) : undefined, ph: s.readings.find((r) => r.code === "00400")?.value != null ? Number(s.readings.find((r) => r.code === "00400")?.value) : undefined }} /></div>
                </details>
                <details className="mt-3"><summary className="cursor-pointer text-sm text-primary">Explore recorded history</summary><StationHistory id={s.id} /></details>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted-foreground">Source: U.S. Geological Survey Water Data (provisional, latest readings)</p>
      </div>
    </div>
  );
}

function Loading() {
  return <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading live data…</p>;
}
