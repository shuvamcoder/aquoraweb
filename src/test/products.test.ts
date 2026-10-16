import { describe, it, expect } from "vitest";
import { products, measurementComponents, treatmentComponents } from "@/lib/products";
describe("Product concept requirements", () => {
  it("keeps three preliminary budgets rather than complete-product prices", () => {expect(products.map(p => [p.id,p.budget,p.plus])).toEqual([["aquatrack",15,true],["aquapure",7,false],["aquasync",15,true]]);});
  it("requires pump and carbon filtration in both treatment concepts", () => {for (const p of products.filter(p => p.id !== "aquatrack")) {expect(p.components).toContain("Mini air pump");expect(p.components).toContain("Activated-carbon filter cartridge");}});
  it("includes four electronic sensors without a TDS sensor", () => {expect(measurementComponents.filter(c => c.endsWith("sensor"))).toEqual(["Dissolved oxygen sensor","Temperature sensor","pH sensor","Turbidity sensor"]);expect(treatmentComponents).not.toContain("TDS sensor");});
});