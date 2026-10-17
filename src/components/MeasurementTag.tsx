import { measurementStatus, type MetricKey } from "@/lib/measurement-status";

const tones = {
  good: "border-good/40 bg-good/10 text-good",
  warn: "border-warn/40 bg-warn/10 text-warn-foreground",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "border-border bg-secondary text-muted-foreground",
};
export function MeasurementTag({ metric, value }: { metric: MetricKey; value?: number | undefined }) {
  const status = measurementStatus(metric, value);
  return <span title={status.reason} className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium ${tones[status.tone]}`}><span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{status.label}</span>;
}