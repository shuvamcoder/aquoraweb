import { describe, it, expect } from "vitest";
import { products, measurementComponents } from "@/lib/products";
describe("Product concept requirements", () => {
  it("offers only AquaTrack", () => { expect(products.map(p => p.id)).toEqual(["aquatrack"]); });
  it("makes every product one-time use", () => { for (const p of products) expect(p.singleUse).toBe(true); });
  it("stores no product prices or budgets", () => { for (const p of products) { expect(p).not.toHaveProperty("price"); expect(p).not.toHaveProperty("budget"); } });
  it("powers every product with a covered battery", () => { for (const p of products) { expect(p.batteryPowered).toBe(true); expect(p.components).toContain("Enclosed battery"); expect(p.components).not.toContain("USB power connection"); } });
  it("includes four electronic sensors without a TDS sensor", () => {expect(measurementComponents.filter(c => c.endsWith("sensor"))).toEqual(["Dissolved oxygen sensor","Temperature sensor","pH sensor","Turbidity sensor"]);});
  it("omits manual strips from every product", () => {for (const p of products) {expect(p.components).not.toContain("Supplementary manual strips and color chart");expect(p.components.some(c => /strip|color chart/i.test(c))).toBe(false);expect(p.limitation).not.toMatch(/strip/i);}});

});
