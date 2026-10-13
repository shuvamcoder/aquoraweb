import { describe, expect, it } from "vitest";
import { catalogObservation, oxygenChange, type Observation } from "@/lib/observations";
import { waterways } from "@/lib/waterways";

describe("Observation profiles", () => {
  const base: Observation = { id: "manual", name: "Pond", source: "Manual", lat: 0, lon: 0 };
  it("does not invent change when historical readings are missing", () => {
    expect(oxygenChange({ ...base, oxygen: 6 })).toBeNull();
  });
  it("accepts zero readings and computes declines", () => {
    expect(oxygenChange({ ...base, oxygen: 0, previousOxygen: 5 })).toBe(-5);
  });
  it("rejects non-finite readings", () => {
    expect(oxygenChange({ ...base, oxygen: NaN, previousOxygen: 5 })).toBeNull();
  });
  it("keeps catalog profiles explicitly marked as samples", () => {
    const first = waterways[0];
    if (!first) throw new Error("Expected a sample waterway");
    const o = catalogObservation(first);
    expect(o.sample).toBe(true);
    expect(o.time).toBeUndefined();
    expect(o.previousLabel).toBe("Sample day 1");
  });
});