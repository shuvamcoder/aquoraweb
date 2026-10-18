import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play, Radio, MapPinned, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import phone from "@/assets/nexus-phone.jpg";
import icon from "@/assets/nexus-icon.jpg";

export const Route = createFileRoute("/nexus")({
  head: () => ({ meta: [
    { title: "Nexus — The Aquora App" },
    { name: "description", content: "Meet Nexus: Aquora’s connection to U.S. waterways, public USGS measurements, station history and your own water observations." },
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
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-7xl sm:text-8xl">Nexus</h1>
          <p className="mt-6 max-w-xl text-xl">Your connection to water.</p>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">A clearer view of the places you care about. Explore U.S. waterways, read public measurements and follow recorded change — from your phone.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
              <img src={icon} alt="Nexus app icon" width={816} height={816} className="h-12 w-12 rounded-xl" />
              <div>
                <p className="text-xs text-muted-foreground">Download on the</p>
                <p className="font-display text-xl leading-tight">Apple App Store</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
              <Play className="h-8 w-8 text-primary" fill="currentColor" />
              <div>
                <p className="text-xs text-muted-foreground">Get it on</p>
                <p className="font-display text-xl leading-tight">Google Play</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <img src={phone} alt="Nexus app on a smartphone showing live water readings and a map" width={1024} height={1280} className="mx-auto w-full max-w-md rounded-2xl border border-border object-cover" />
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="grid gap-10 md:grid-cols-3">
        {[{ Icon: MapPinned, title: "Find your place", text: "Explore U.S. waterway locations. Pin a place and add optional measurements of your own." }, { Icon: Radio, title: "Read the signals", text: "See live station readings with their units, dates and plain-language labels. Coverage and available sensors vary." }, { Icon: ScanLine, title: "Follow the record", text: "Explore recorded station history and compare available measurements. Save place snapshots for this browsing session." }].map(({ Icon, title, text }) => <div key={title} className="border-t border-border pt-6"><Icon className="h-6 w-6 text-primary" /><h2 className="mt-4 font-display text-3xl">{title}</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p></div>)}
      </div>
    </section>
    <section className="border-t border-border bg-secondary"><div className="mx-auto max-w-6xl px-5 py-10"><h2 className="font-display text-3xl">Real sources. Clear boundaries.</h2><p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">Live station measurements cover the United States, so Aquora is U.S.-only for now — global waterways are a future addition. Weather is separate from water quality. Measurement labels describe conditions for aquatic life, not drinking or swimming clearance. Aquora does not currently receive readings from your hardware.</p><Button asChild variant="outline" className="mt-6"><Link to="/map">Open atlas <ArrowRight /></Link></Button></div></section>
  </div>;
}
