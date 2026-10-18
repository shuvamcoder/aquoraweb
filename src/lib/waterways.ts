export type Waterway = {
  id: string; name: string; type: "Lake" | "River" | "Reservoir" | "Pond" | "Bay";
  region: string; lat: number; lon: number;
};
// Named U.S. location references, not monitoring stations or measured conditions.
// USGS measurements cover the United States; global coverage is a future addition.
export const waterways: Waterway[] = [
  { id: "lake-ontario", name: "Lake Ontario", type: "Lake", region: "New York", lat: 43.6, lon: -77.9 },
  { id: "lake-superior", name: "Lake Superior", type: "Lake", region: "Minnesota / Michigan / Wisconsin", lat: 47.7, lon: -87.5 },
  { id: "lake-michigan", name: "Lake Michigan", type: "Lake", region: "Michigan / Wisconsin / Illinois", lat: 43.9, lon: -87.2 },
  { id: "lake-huron", name: "Lake Huron", type: "Lake", region: "Michigan", lat: 44.9, lon: -82.4 },
  { id: "lake-erie", name: "Lake Erie", type: "Lake", region: "Ohio / Pennsylvania / New York", lat: 42.2, lon: -81.2 },
  { id: "mississippi-river", name: "Mississippi River", type: "River", region: "Louisiana", lat: 29.95, lon: -90.07 },
  { id: "missouri-river", name: "Missouri River", type: "River", region: "Missouri", lat: 38.82, lon: -90.12 },
  { id: "lake-tahoe", name: "Lake Tahoe", type: "Lake", region: "California / Nevada", lat: 39.09, lon: -120.04 },
  { id: "colorado-river", name: "Colorado River", type: "River", region: "Arizona", lat: 36.1, lon: -112.1 },
  { id: "chesapeake-bay", name: "Chesapeake Bay", type: "Bay", region: "Maryland / Virginia", lat: 38.6, lon: -76.3 },
  { id: "lake-okeechobee", name: "Lake Okeechobee", type: "Lake", region: "Florida", lat: 26.95, lon: -80.83 },
  { id: "hudson-river", name: "Hudson River", type: "River", region: "New York", lat: 41.7, lon: -73.95 },
  { id: "great-salt-lake", name: "Great Salt Lake", type: "Lake", region: "Utah", lat: 41.15, lon: -112.55 },
  { id: "lake-mead", name: "Lake Mead", type: "Reservoir", region: "Nevada / Arizona", lat: 36.15, lon: -114.4 },
  { id: "columbia-river", name: "Columbia River", type: "River", region: "Washington / Oregon", lat: 45.65, lon: -121.1 },
  { id: "rio-grande", name: "Rio Grande", type: "River", region: "Texas", lat: 29.1, lon: -101.9 },
  { id: "lake-champlain", name: "Lake Champlain", type: "Lake", region: "Vermont / New York", lat: 44.55, lon: -73.35 },
  { id: "puget-sound", name: "Puget Sound", type: "Bay", region: "Washington", lat: 47.6, lon: -122.4 },
  { id: "snake-river", name: "Snake River", type: "River", region: "Idaho", lat: 43.6, lon: -116.2 },
  { id: "lake-pontchartrain", name: "Lake Pontchartrain", type: "Lake", region: "Louisiana", lat: 30.2, lon: -90.15 },
];
