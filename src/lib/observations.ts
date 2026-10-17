import type { Waterway } from "@/lib/waterways";

export type Observation = {
  id: string; name: string; source: string; sample?: boolean;
  lat: number; lon: number; time?: string | undefined;
  oxygen?: number | undefined; temperature?: number | undefined; ph?: number | undefined; turbidity?: number | undefined; conductance?: number | undefined;
  streamflow?: number | undefined;
  metricTimes?: Partial<Record<"oxygen" | "temperature" | "ph" | "turbidity" | "conductance" | "streamflow", string>>;
  previousOxygen?: number | undefined; previousLabel?: string; currentLabel?: string;
};
export const metrics = [
  { key: "oxygen", label: "Dissolved oxygen", unit: "mg/L", max: 15, explanation: "Oxygen dissolved in water supports fish and other aquatic life. Below 5 mg/L can stress many fish; it does not determine drinking or swimming safety." },
  { key: "temperature", label: "Water temperature", unit: "°C", max: 40, explanation: "Water temperature affects aquatic life and how much oxygen water can hold. Suitable temperatures depend on the species and location." },
  { key: "ph", label: "pH", unit: "", max: 14, explanation: "pH describes acidity on a scale of 0–14. A value of 7 is neutral. This reading alone cannot confirm water safety." },
  { key: "turbidity", label: "Turbidity", unit: "NTU", max: 100, explanation: "Turbidity measures cloudiness from suspended particles. Clear water can still contain harmful contaminants." },
  { key: "conductance", label: "Specific conductance", unit: "µS/cm at 25 °C", max: 2000, explanation: "Conductance reflects dissolved ions. Geology, salinity and human activity all affect it; higher values alone do not establish pollution." },
  { key: "streamflow", label: "Streamflow", unit: "ft³/s", max: 10000, explanation: "The volume of water passing the station each second. Compare with local seasonal records; flow alone does not establish water quality." },
] as const;

export function catalogObservation(w: Waterway): Observation {
  return { id: w.id, name: w.name, source: "Waterway catalog · location only", lat: w.lat, lon: w.lon };
}

export function oxygenChange(o: Observation) {
  if (o.oxygen == null || o.previousOxygen == null || !Number.isFinite(o.oxygen) || !Number.isFinite(o.previousOxygen)) return null;
  return Number((o.oxygen - o.previousOxygen).toFixed(2));
}