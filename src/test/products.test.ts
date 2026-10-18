import { describe, it, expect } from "vitest";
import { products, measurementComponents, treatmentComponents } from "@/lib/products";
describe("Product concept requirements", () => {
  it("lists AquaSync first", () => { expect(products[0]?.id).toBe("aquasync"); });
  it("prices AquaTrack at $8.99", () => { expect(products.find(p => p.id === "aquatrack")?.price).toBe(8.99); });
  it("prices AquaPure at $9.99", () => { expect(products.find(p => p.id === "aquapure")?.price).toBe(9.99); });
  it("prices AquaSync at $16.99", () => { expect(products.find(p => p.id === "aquasync")?.price).toBe(16.99); });
  it("powers every product with a covered battery", () => { for (const p of products) { expect(p.batteryPowered).toBe(true); expect(p.components).toContain("Enclosed rechargeable battery"); expect(p.components).not.toContain("USB power connection"); } });
  it("keeps three preliminary budgets rather than complete-product prices", () => {expect(products.map(p => [p.id,p.budget,p.plus])).toEqual([["aquasync",15,true],["aquatrack",15,true],["aquapure",7,false]]);});
  it("requires pump and carbon filtration in both treatment concepts", () => {for (const p of products.filter(p => p.id !== "aquatrack")) {expect(p.components).toContain("Mini air pump");expect(p.components).toContain("Activated-carbon filter cartridge");}});
  it("includes four electronic sensors without a TDS sensor", () => {expect(measurementComponents.filter(c => c.endsWith("sensor"))).toEqual(["Dissolved oxygen sensor","Temperature sensor","pH sensor","Turbidity sensor"]);expect(treatmentComponents).not.toContain("TDS sensor");});
  it("omits manual strips from every product", () => {for (const p of products) {expect(p.components).not.toContain("Supplementary manual strips and color chart");expect(p.components.some(c => /strip|color chart/i.test(c))).toBe(false);expect(p.limitation).not.toMatch(/strip/i);}});

});