import { describe, expect, it } from "vitest";
import { fetchUsgsPages, normalizeUsgs, usgsObservation } from "@/lib/usgs";
import { measurementStatus } from "@/lib/measurement-status";

const feature = (code: string, value: unknown, time = "2026-10-17T22:30:00Z") => ({geometry:{coordinates:[-119.97,38.92]}, properties:{monitoring_location_id:"USGS-10336780",parameter_code:code,value,time,approval_status:"Provisional"}});
describe("USGS measurement normalization", () => {
  it("maps all supported agency parameters into a profile", () => {
    const station = normalizeUsgs([feature("00300","9.7"),feature("00010","9.6"),feature("00400","7.5"),feature("00095","123"),feature("00060","0")])[0];
    if (!station) throw new Error("Expected station");
    expect(usgsObservation(station)).toMatchObject({lat:38.92,lon:-119.97,oxygen:9.7,temperature:9.6,ph:7.5,conductance:123,streamflow:0});
  });
  it("drops missing values rather than inventing zero readings", () => { expect(normalizeUsgs([feature("00300",null),feature("00010",""),feature("00400","NaN")])).toEqual([]); });
  it("keeps the newest reading for each parameter and its date", () => {
    const station = normalizeUsgs([feature("00300","2","2026-10-16T22:30:00Z"),feature("00300","9.7")])[0];
    if (!station) throw new Error("Expected station");
    expect(usgsObservation(station).oxygen).toBe(9.7);
    expect(usgsObservation(station).metricTimes?.oxygen).toBe("2026-10-17T22:30:00Z");
  });
  it("follows the next agency page", async () => {
    let calls = 0;
    const fetcher = (async () => { calls++; return Response.json({features:[feature(calls === 1 ? "00300" : "00010",9.7)],links:calls === 1 ? [{rel:"next",href:"https://api.waterdata.usgs.gov/page2"}] : []}); }) as typeof fetch;
    const data = await fetchUsgsPages("https://api.waterdata.usgs.gov/page1",fetcher);
    expect(calls).toBe(2); expect(data.features).toHaveLength(2); expect(data.partial).toBe(false);
  });
  it("discloses a page-budget limit", async () => {
    const fetcher = (async () => Response.json({features:[],links:[{rel:"next",href:"https://api.waterdata.usgs.gov/page"}]})) as typeof fetch;
    expect((await fetchUsgsPages("https://api.waterdata.usgs.gov/page",fetcher)).partial).toBe(true);
  });
});
describe("Aquatic-life screening, not water safety", () => {
  it("flags oxygen below 2 mg/L as very low", () => { expect(measurementStatus("oxygen",1.9).tone).toBe("destructive"); expect(measurementStatus("oxygen",2).tone).toBe("warn"); });
  it("screens low oxygen below 5 mg/L", () => { expect(measurementStatus("oxygen",4.9).tone).toBe("warn"); expect(measurementStatus("oxygen",5).tone).toBe("good"); });
  it("uses the freshwater pH range 6.5–9 inclusive", () => { expect(measurementStatus("ph",6.5).tone).toBe("good"); expect(measurementStatus("ph",9).tone).toBe("good"); expect(measurementStatus("ph",6.4).tone).toBe("warn"); expect(measurementStatus("ph",9.1).tone).toBe("warn"); });
  it("does not invent universal thresholds for context-dependent parameters", () => { for (const key of ["temperature","conductance","turbidity","streamflow"] as const) expect(measurementStatus(key,20).tone).toBe("muted"); });
  it("does not assess missing or non-finite observations", () => { expect(measurementStatus("oxygen",undefined).tone).toBe("muted"); expect(measurementStatus("ph",NaN).tone).toBe("muted"); });
});