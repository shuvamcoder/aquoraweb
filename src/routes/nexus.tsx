import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Radio, MapPinned, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import lake from "@/assets/lake.jpg";

export const Route = createFileRoute("/nexus")({
  head: () => ({ meta: [
    { title: "Nexus — The Aquora App" },
    { name: "description", content: "Meet Nexus: Aquora’s connection to waterways, public USGS measurements, station history and your own water observations." },
    { property: "og:title", content: "Nexus — The Aquora App" },
    { property: "og:description", content: "Discover places. Read the signals. Follow recorded change with Aquora." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Nexus,
});

function Nexus() {
  return <div>
    <section className="relative overflow-hidden border-b border-border">
      <img src={lake} alt="Forest and open water" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/85" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <p className="text-sm text-primary">The Aquora app</p>
        <h1 className="mt-4 font-display text-7xl sm:text-8xl">Nexus</h1>
        <p className="mt-6 max-w-xl text-xl">Your connection to water.</p>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">A clearer view of the places you care about. Explore waterways, read public measurements and follow recorded change.</p>
        <Button asChild size="lg" className="mt-8"><Link to="/map">Enter atlas <ArrowRight /></Link></Button>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="grid gap-10 md:grid-cols-3">
        {[{ Icon: MapPinned, title: "Find your place", text: "Explore global waterway locations. Pin a place and add optional measurements of your own." }, { Icon: Radio, title: "Read the signals", text: "See USGS station readings with their units, dates and color-coded context. Coverage and available sensors vary." }, { Icon: ScanLine, title: "Follow the record", text: "Explore recorded station history and compare available measurements. Save place snapshots for this browsing session." }].map(({ Icon, title, text }) => <div key={title} className="border-t border-border pt-6"><Icon className="h-6 w-6 text-primary" /><h2 className="mt-4 font-display text-3xl">{title}</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p></div>)}
      </div>
    </section>
    <section className="border-t border-border bg-secondary"><div className="mx-auto max-w-6xl px-5 py-10"><h2 className="font-display text-3xl">Real sources. Clear boundaries.</h2><p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">USGS supplies U.S. station measurements, not readings for every waterway. OpenStreetMap supplies location references. Weather is separate from water quality. Measurement tags give context for aquatic life, not drinking or swimming clearance. Aquora does not currently receive readings from your hardware.</p><Button asChild variant="outline" className="mt-6"><Link to="/explore">Discover water <ArrowRight /></Link></Button></div></section>
  </div>;
}