import { Link } from "@tanstack/react-router";
import { Droplets } from "lucide-react";

const links = [
  { to: "/explore", label: "Explore waterways" },
  { to: "/map", label: "World map" },
  { to: "/product", label: "Water-care kits" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl text-foreground">
          <Droplets className="h-6 w-6 text-primary" /> Aquora <span className="hidden text-xs font-normal italic text-muted-foreground lg:inline">Water Intelligence for a Healthier World.</span>
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-secondary text-foreground" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
 return <footer className="mt-16 border-t border-border"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2"><div><p className="font-display text-3xl">Aquora</p><p className="mt-2 text-sm text-muted-foreground">Water Intelligence for a Healthier World.</p><p className="mt-4 text-sm text-muted-foreground">An environmental innovation project connecting public water data with water exploration, monitoring and water-care design.</p></div><div className="space-y-3 text-xs leading-relaxed text-muted-foreground"><p>Data: <a href="https://waterdata.usgs.gov/" target="_blank" rel="noreferrer" className="text-primary underline">USGS Water Data</a> (U.S., provisional readings), <a href="https://www.openstreetmap.org/copyright" className="text-primary underline">OpenStreetMap</a>, Esri hydro overlay and <a href="https://open-meteo.com/" className="text-primary underline">Open-Meteo</a>.</p><p>Hardware images and phone readings are illustrative concepts, not verified devices or performance results. Budget targets are not complete-kit prices.</p><p>No single measurement or treatment establishes drinking or swimming safety. Follow local guidance and appropriate testing.</p><p>Measure → Understand → Treat → Measure again</p></div></div></footer>;
}
