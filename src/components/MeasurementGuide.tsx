import { metrics } from "@/lib/observations";
import { Droplets } from "lucide-react";

export function MeasurementGuide() {
  return <section className="mx-auto max-w-6xl px-5 py-16"><p className="text-xs uppercase tracking-widest text-primary">Water quality, in plain language</p><h2 className="mt-3 font-display text-4xl">Four measurements. More context.</h2><div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{metrics.map((m) => <div key={m.key} className="border-t border-border pt-5"><Droplets className="h-5 w-5 text-primary" /><h3 className="mt-4 font-medium">{m.label} {m.unit && <span className="text-muted-foreground">({m.unit})</span>}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.explanation}</p></div>)}</div><p className="mt-8 text-sm text-muted-foreground">No single reading establishes water safety. Interpretation needs local standards, location context and other relevant evidence.</p></section>;
}