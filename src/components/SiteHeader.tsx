import { Link } from "@tanstack/react-router";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/atlas", label: "Atlas" },
  { to: "/collection", label: "Collection" },
  { to: "/nexus", label: "Nexus" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl text-foreground">
          <Droplets className="h-6 w-6 text-primary" /> Aquora
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
  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 font-display text-2xl"><Droplets className="h-5 w-5 text-primary" /> Aquora</p>
            <p className="mt-3 text-sm text-muted-foreground">Water Intelligence for a Healthier Use.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Explore Aquora</p>
            <nav aria-label="Footer navigation" className="mt-3 flex flex-col items-start gap-1">
              <Button asChild variant="ghost" className="h-8 px-0 text-muted-foreground"><Link to="/">Home</Link></Button>
              {links.map(l => <Button key={l.to} asChild variant="ghost" className="h-8 px-0 text-muted-foreground"><Link to={l.to}>{l.label}</Link></Button>)}
            </nav>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Data sources</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>USGS Water Data — public monitoring stations</li>
              <li>OpenWeather — atmosphere</li>
              <li>OpenStreetMap & Esri — waterway geography</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          <p>Hardware images and phone readings are illustrative concepts, not verified devices or performance results. No single measurement or treatment establishes drinking or swimming safety — follow local guidance and appropriate testing.</p>
          <p className="mt-3">© {new Date().getFullYear()} Aquora. Measure → Understand → Treat → Measure again.</p>
        </div>
      </div>
    </footer>
  );
}
