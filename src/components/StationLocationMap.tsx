import { useEffect, useRef } from "react";

export function StationLocationMap({ lat, lon }: { lat: number; lon: number }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    import("leaflet").then((module) => {
      if (disposed || !container.current) return;
      const L = module.default;
      const map = L.map(container.current, { attributionControl: false }).setView([lat, lon], 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      const color = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      L.circleMarker([lat, lon], { radius: 8, color, fillColor: color, fillOpacity: 1 }).addTo(map);
      const observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(container.current);
      cleanup = () => { observer.disconnect(); map.remove(); };
    });
    return () => { disposed = true; cleanup?.(); };
  }, [lat, lon]);

  return <div ref={container} aria-label="Station location map" className="isolate h-[min(60vh,480px)] w-full overflow-hidden rounded-md bg-secondary" />;
}