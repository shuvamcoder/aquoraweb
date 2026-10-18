import type { Observation } from "@/lib/observations";

export type MetricKey = "oxygen" | "temperature" | "ph" | "turbidity" | "conductance" | "streamflow";
export type MeasurementStatus = { tone: "good" | "warn" | "destructive" | "muted"; label: string; reason: string };
export function measurementStatus(key: MetricKey, value: number | undefined): MeasurementStatus {
  if (value == null || !Number.isFinite(value)) return { tone: "muted", label: "Not measured", reason: "This source has not supplied a value for this measurement." };
  if (key === "oxygen") {
    if (value < 2) return { tone: "destructive", label: "Starved", reason: "Below 2 mg/L: severely low oxygen. Most aquatic life cannot survive here." };
    if (value < 5) return { tone: "warn", label: "Low", reason: "Below 5 mg/L: many fish experience stress at this level." };
    if (value < 8) return { tone: "good", label: "Healthy", reason: "A comfortable oxygen level for most aquatic life." };
    return { tone: "good", label: "Rich", reason: "Plenty of dissolved oxygen for aquatic life." };
  }
  if (key === "ph") {
    if (value < 5) return { tone: "destructive", label: "Very acidic", reason: "Far below the 6.5–9 freshwater range; harmful to most aquatic life." };
    if (value < 6.5) return { tone: "warn", label: "Acidic", reason: "Below the 6.5–9 freshwater range suggested for aquatic life." };
    if (value <= 9) return { tone: "good", label: "Balanced", reason: "Within the 6.5–9 freshwater range suggested for aquatic life." };
    return { tone: "warn", label: "Alkaline", reason: "Above the 6.5–9 freshwater range suggested for aquatic life." };
  }
  if (key === "temperature") {
    if (value < 41) return { tone: "muted", label: "Cold", reason: "Cold water holds more oxygen but slows aquatic life." };
    if (value < 59) return { tone: "muted", label: "Cool", reason: "Cool water, typical of healthy streams and deep lakes." };
    if (value < 77) return { tone: "muted", label: "Mild", reason: "A mild temperature comfortable for many species." };
    if (value < 90) return { tone: "warn", label: "Warm", reason: "Warm water holds less oxygen; some species feel stress." };
    return { tone: "destructive", label: "Hot", reason: "Very warm water holds little oxygen and stresses most aquatic life." };
  }
  if (key === "turbidity") {
    if (value < 10) return { tone: "good", label: "Clear", reason: "Very little suspended material; light reaches underwater plants." };
    if (value < 50) return { tone: "muted", label: "Hazy", reason: "Some suspended material; common after rain or flow changes." };
    return { tone: "warn", label: "Cloudy", reason: "Heavy suspended material; can clog filters and stress aquatic life." };
  }
  if (key === "conductance") {
    if (value < 100) return { tone: "muted", label: "Soft", reason: "Few dissolved minerals; typical of rain-fed mountain water." };
    if (value < 800) return { tone: "muted", label: "Moderate", reason: "A moderate level of dissolved minerals, common in fresh water." };
    return { tone: "warn", label: "Mineral-rich", reason: "High dissolved minerals or salts; worth comparing with local records." };
  }
  // streamflow
  if (value < 10) return { tone: "muted", label: "Slow", reason: "A gentle flow for this station." };
  if (value < 500) return { tone: "muted", label: "Steady", reason: "A steady flow for this station." };
  return { tone: "muted", label: "Strong", reason: "A strong flow for this station." };
}

export function hasMeasurements(o: Observation) {
  return (["oxygen", "temperature", "ph", "turbidity", "conductance", "streamflow"] as const).some(k => o[k] != null && Number.isFinite(o[k]));
}

export type KitAdvice = { title: string; body: string };
export function kitAdvice(o: Observation): KitAdvice[] {
  const advice: KitAdvice[] = [];
  if (o.oxygen != null && Number.isFinite(o.oxygen) && o.oxygen < 5) {
    advice.push({ title: "This water needs air", body: "Oxygen is low. The AquaPure air pump pushes fresh air into the water to bring it back up." });
  }
  if (o.turbidity != null && Number.isFinite(o.turbidity) && o.turbidity >= 50) {
    advice.push({ title: "This water is cloudy", body: "The AquaPure carbon filter cartridge traps fine particles and helps clear the water." });
  }
  if (o.ph != null && Number.isFinite(o.ph) && (o.ph < 6.5 || o.ph > 9)) {
    advice.push({ title: "pH is out of balance", body: "Track it over time with AquaTrack before treating — a single reading can shift on its own." });
  }
  if (advice.length === 0 && hasMeasurements(o)) {
    advice.push({ title: "Looking good", body: "Nothing here calls for treatment. Keep an eye on it with AquaTrack and measure again later." });
  }
  return advice;
}
