import { useState } from "react";
import { Bookmark, Check, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { metrics, oxygenChange, type Observation } from "@/lib/observations";
import { useSavedPlaces } from "@/lib/saved-places";


import { MeasurementTag } from "@/components/MeasurementTag";
import { measurementStatus, hasMeasurements, kitAdvice } from "@/lib/measurement-status";

export function WaterProfile({ observation, onSelect }: { observation: Observation; onSelect?: (o: Observation) => void }) {
  const [compareId, setCompareId] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const { places, toggle } = useSavedPlaces();
  const isSaved = places.some((p) => p.id === observation.id);
  const candidates = places.filter((p, i, all) => p.id !== observation.id && all.findIndex((x) => x.id === p.id) === i);
  const comparison = candidates.find((o) => o.id === compareId);
  const change = oxygenChange(observation);
  return <div className="min-w-0 space-y-6">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0"><h3 className="font-display text-2xl break-words">Water fingerprint</h3><p className="mt-1 text-xs text-muted-foreground">{observation.source}{observation.time ? ` · ${new Date(observation.time).toLocaleString()}` : " · Date not supplied"}</p></div>
      <Button size="icon" variant={isSaved ? "secondary" : "outline"} aria-label={isSaved ? "Unsave place" : "Save place"} title={isSaved ? "Unsave place" : "Save place"} onClick={() => toggle(observation)}>{isSaved ? <Check /> : <Bookmark />}</Button>
    </div>
    {observation.sample && <p className="text-xs text-warn-foreground">Illustrative sample measurements — not observed water conditions.</p>}
    {!hasMeasurements(observation) && <p className="text-sm text-muted-foreground">This is a location reference, not a monitoring station. Nearby live readings appear separately when available.</p>}
    <div className="space-y-3">{metrics.filter((m) => observation[m.key] != null && Number.isFinite(observation[m.key])).map((m) => {
      const value = observation[m.key];
      return <details key={m.key} className="border-b border-border pb-3"><summary className="cursor-pointer text-sm"><span className="inline-flex w-[90%] flex-wrap justify-between gap-2"><span>{m.label}</span><b>{`${value} ${m.unit}`}</b><MeasurementTag metric={m.key} value={value} /></span></summary><meter aria-label={`${m.label} profile`} min={0} max={m.max} value={Math.max(0, value ?? 0)} className="mt-2 h-2 w-full accent-primary" /><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.explanation} {measurementStatus(m.key, value).reason}</p>{observation.metricTimes?.[m.key] && <p className="mt-2 text-xs text-muted-foreground">Recorded {new Date(observation.metricTimes[m.key] ?? "").toLocaleString()}</p>}</details>;
    })}</div>
    {hasMeasurements(observation) && <section className="rounded-lg border border-border bg-card p-4"><h4 className="font-medium">What this water needs</h4><ul className="mt-2 space-y-2">{kitAdvice(observation).map((a) => <li key={a.title} className="text-sm"><p className="font-medium text-primary">{a.title}</p><p className="text-muted-foreground">{a.body}</p></li>)}</ul></section>}
    <section className="border-t border-border pt-4"><h4 className="font-medium">What changed?</h4>{change == null ? <p className="mt-2 text-sm text-muted-foreground">No comparable earlier oxygen measurement is available.</p> : <><p className="mt-2 text-sm">{observation.sample ? "In this sample, dissolved" : "Dissolved"} oxygen {change === 0 ? "was unchanged" : `${change > 0 ? "increased" : "decreased"} by ${Math.abs(change)} mg/L`}.</p><p className="mt-1 text-xs text-muted-foreground">{observation.previousLabel ?? "Earlier reading (date not supplied)"}: {observation.previousOxygen} mg/L → {observation.currentLabel ?? "Current reading (date not supplied)"}: {observation.oxygen} mg/L</p><p className="mt-1 text-xs text-muted-foreground">A change alone does not establish treatment effectiveness.</p></>}</section>
    <section className="border-t border-border pt-4"><h4 className="flex items-center gap-2 font-medium"><GitCompareArrows className="h-4 w-4 text-primary" />Compare waters</h4>
      <select aria-label="Compare with another waterway" value={compareId} onChange={(e) => setCompareId(e.target.value)} className="mt-3 w-full min-w-0 rounded-md border border-input bg-background p-2 text-sm"><option value="">Choose another waterway</option>{candidates.map((p) => <option key={p.id} value={p.id}>{p.name}{p.sample ? " (sample)" : ""}</option>)}</select>
      {comparison && <div className="mt-3 space-y-2 text-sm"><p className="break-words font-medium">{observation.name} / {comparison.name}</p><p className="text-xs text-muted-foreground">{comparison.source} · {comparison.time ? new Date(comparison.time).toLocaleString() : "Date not supplied"}. {observation.sample || comparison.sample ? "Includes sample data; not a current-condition comparison." : "Different dates or methods may not be directly comparable."}</p>{metrics.filter((m) => observation[m.key] != null && comparison[m.key] != null).map((m) => { const a = observation[m.key], b = comparison[m.key]; return <div key={m.key} className="flex flex-wrap justify-between gap-2 border-b border-border py-2"><span>{m.label}</span><b>{a == null || b == null ? "Not comparable" : `${Number((a - b).toFixed(2)) > 0 ? "+" : ""}${Number((a - b).toFixed(2))} ${m.unit}`}</b>{showDetails && <p className="w-full text-xs text-muted-foreground">{a ?? "Not measured"} / {b ?? "Not measured"} {m.unit}</p>}</div>; })}<Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>{showDetails ? "Hide values" : "Show both values"}</Button></div>}
    </section>
    <section className="border-t border-border pt-4"><h4 className="font-medium">My water places <span className="text-muted-foreground">({places.length})</span></h4><p className="mt-1 text-xs text-muted-foreground">Saved for this browsing session. No automatic observation alerts.</p>{places.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No saved places yet.</p> : <ul className="mt-2 space-y-1">{places.map((p) => <li key={p.id} className="flex items-center justify-between gap-2"><Button variant="link" className="h-auto min-w-0 whitespace-normal px-0 text-left" onClick={() => onSelect?.(p)} disabled={!onSelect}>{p.name}</Button><Button size="icon" variant="ghost" aria-label={`Remove saved ${p.name}`} title="Remove saved place" onClick={() => toggle(p)}><Bookmark /></Button></li>)}</ul>}</section>
  </div>;
}