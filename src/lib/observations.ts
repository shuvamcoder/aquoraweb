import type { Waterway } from "@/lib/waterways";

export type Observation = {
  id: string; name: string; source: string; sample?: boolean;
  lat: number; lon: number; time?: string;
  oxygen?: number; temperature?: number; ph?: number; turbidity?: number;
  previousOxygen?: number; previousLabel?: string; currentLabel?: string;
};
export const metrics = [
  { key: "oxygen", label: "Dissolved oxygen", unit: "mg/L", max: 15, explanation: "Oxygen dissolved in water supports fish and other aquatic life. Below 5 mg/L can stress many fish; it does not determine drinking or swimming safety." },
  { key: "temperature", label: "Water temperature", unit: "°C", max: 40, explanation: "Water temperature affects aquatic life and how much oxygen water can hold. Suitable temperatures depend on the species and location." },
  { key: "ph", label: "pH", unit: "", max: 14, explanation: "pH describes acidity on a scale of 0–14. A value of 7 is neutral. This reading alone cannot confirm water safety." },
  { key: "turbidity", label: "Turbidity", unit: "NTU", max: 100, explanation: "Turbidity measures cloudiness from suspended particles. Clear water can still contain harmful contaminants." },
] as const;

export function catalogObservation(w: Waterway): Observation {
  return { id: w.id, name: w.name, source: "Aquora sample", sample: true, lat: w.lat, lon: w.lon, oxygen: w.do, temperature: w.temp, ph: w.ph, turbidity: w.turbidity, previousOxygen: w.history[0], previousLabel: "Sample day 1", currentLabel: "Sample day 7" };
}

export function oxygenChange(o: Observation) {
  if (o.oxygen == null || o.previousOxygen == null || !Number.isFinite(o.oxygen) || !Number.isFinite(o.previousOxygen)) return null;
  return Number((o.oxygen - o.previousOxygen).toFixed(2));
}