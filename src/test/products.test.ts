import { describe, it, expect } from "vitest";
import { products, measurementComponents, treatmentComponents } from "@/lib/products";
describe("Product concept requirements", () => {
  it("makes every product one-time use", () => { for (const p of products) expect(p.singleUse).toBe(true); });
  it("stores no product prices or budgets", () => { for (const p of products) { expect(p).not.toHaveProperty("price"); expect(p).not.toHaveProperty("budget"); } });
  it("lists AquaSync first", () => { expect(products[0]?.id).toBe("aquasync"); });
  it("powers every product with a covered battery", () => { for (const p of products) { expect(p.batteryPowered).toBe(true); expect(p.components).toContain("Enclosed battery"); expect(p.components).not.toContain("USB power connection"); } });
  it("requires pump and carbon filtration in both treatment concepts", () => {for (const p of products.filter(p => p.id !== "aquatrack")) {expect(p.components).toContain("Mini air pump");expect(p.components).toContain("Activated-carbon filter cartridge");}});
  it("includes four electronic sensors without a TDS sensor", () => {expect(measurementComponents.filter(c => c.endsWith("sensor"))).toEqual(["Dissolved oxygen sensor","Temperature sensor","pH sensor","Turbidity sensor"]);expect(treatmentComponents).not.toContain("TDS sensor");});
  it("omits manual strips from every product", () => {for (const p of products) {expect(p.components).not.toContain("Supplementary manual strips and color chart");expect(p.components.some(c => /strip|color chart/i.test(c))).toBe(false);expect(p.limitation).not.toMatch(/strip/i);}});

});