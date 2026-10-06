import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CloudSun, Loader2, Radio } from "lucide-react";
import { getUsgsNearby, getWeather } from "@/lib/live-data.functions";

export function LiveData({ lat, lon }: { lat: number; lon: number }) {
  const usgs = useServerFn(getUsgsNearby);
  const wx = useServerFn(getWeather);
  const u = useQuery({ queryKey: ["usgs", lat, lon], queryFn: () => usgs({ data: { lat, lon } }), staleTime: 5 * 60_000 });
  const w = useQuery({ queryKey: ["wx", lat, lon], queryFn: () => wx({ data: { lat, lon } }), staleTime: 10 * 60_000 });

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-2xl border border-border p-5">
        <h4 className="flex items-center gap-2 font-display text-xl"><CloudSun className="h-5 w-5 text-primary" /> Weather right now</h4>
        {w.isLoading ? <Loading /> : w.data?.weather ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
            {[["Air", `${w.data.weather.temperature_2m}°C`], ["Wind", `${w.data.weather.wind_speed_10m} km/h`], ["Rain", `${w.data.weather.precipitation} mm`], ["Clouds", `${w.data.weather.cloud_cover}%`]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-secondary p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="font-medium">{v}</div></div>
            ))}
          </div>
        ) : <p className="mt-2 text-sm text-muted-foreground">Weather isn't available right now.</p>}
        <p className="mt-2 text-xs text-muted-foreground">Source: Open-Meteo</p>
      </div>

      <div className="rounded-2xl border border-border p-5">
        <h4 className="flex items-center gap-2 font-display text-xl"><Radio className="h-5 w-5 text-primary" /> Live USGS monitoring stations nearby</h4>
        {u.isLoading ? <Loading /> : u.data?.error ? (
          <p className="mt-2 text-sm text-muted-foreground">USGS data couldn't be loaded right now. Please try again later.</p>
        ) : !u.data?.stations.length ? (
          <p className="mt-2 text-sm text-muted-foreground">No active USGS stations reporting near this waterway.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {u.data.stations.map((s) => (
              <li key={s.id} className="py-3">
                <div className="text-sm font-medium">{s.name}</div>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {s.readings.map((r) => (
                    <span key={r.code} className="rounded-full bg-secondary px-2.5 py-1 text-xs">{r.label}: <b>{r.value}</b> {r.unit}</span>
                  ))}
                </div>
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
