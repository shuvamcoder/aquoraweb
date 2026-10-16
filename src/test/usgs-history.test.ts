import { describe, it, expect } from "vitest";
import { normalizeHistory } from "@/lib/usgs-history";
describe("Actual USGS history", () => {
 it("does not turn absent observations into zero readings", () => {expect(normalizeHistory([{properties:{value:null,time:"2026-10-16T12:00:00Z"}}])).toEqual([]);});
 it("keeps zero values and separates distinct sensor series", () => {expect(normalizeHistory([{properties:{value:"0",time:"2026-10-16T12:00:00Z",time_series_id:"a"}},{properties:{value:"5",time:"2026-10-16T12:00:00Z",time_series_id:"b"}}])).toEqual([{value:0,time:"2026-10-16T12:00:00Z",series:"a"}]);});
});