import type { Observation } from "@/lib/observations";

export type MetricKey = "oxygen" | "temperature" | "ph" | "turbidity" | "conductance" | "streamflow";
export type MeasurementStatus = { tone: "good" | "warn" | "destructive" | "muted"; label: string; reason: string };
export function measurementStatus(key: MetricKey, value: number | undefined): MeasurementStatus {
  if (value == null || !Number.isFinite(value)) return { tone: "muted", label: "No data", reason: "This source has not supplied a value for this measurement." };
  if (key === "oxygen") {
    if (value < 2) return { tone: "destructive", label: "Very low oxygen", reason: "Below 2 mg/L: a severe low-oxygen screening flag for many aquatic organisms." };
    if (value < 5) return { tone: "warn", label: "Low oxygen", reason: "Below 5 mg/L: many fish may experience stress; needs vary by species and life stage." };
    return { tone: "good", label: "Above low-O₂ screen", reason: "At least 5 mg/L. Oxygen requirements vary by species and temperature; this is not a safety verdict." };
  }
  if (key === "ph") return value < 6.5 || value > 9
    ? { tone: "warn", label: "Outside freshwater range", reason: "Outside EPA’s suggested 6.5–9 freshwater aquatic-life range. Local conditions and species matter." }
    : { tone: "good", label: "Within freshwater range", reason: "Within EPA’s suggested 6.5–9 freshwater aquatic-life range, not a drinking-water assessment." };
  return { tone: "muted", label: "Context needed", reason: "There is no universal good/bad cutoff. Compare with local conditions, species needs and agency guidance." };
}

export function hasMeasurements(o: Observation) {
  return (["oxygen", "temperature", "ph", "turbidity", "conductance", "streamflow"] as const).some(k => o[k] != null && Number.isFinite(o[k]));
}