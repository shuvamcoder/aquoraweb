export type Waterway = {
  id: string; name: string; type: "Lake" | "River" | "Reservoir" | "Pond" | "Bay";
  continent?: string; region: string; lat: number; lon: number;
};
// Named location references, not monitoring stations or measured conditions.
export const waterways: Waterway[] = [
  { id: "lake-superior", name: "Lake Superior", type: "Lake", region: "Ontario / Michigan", continent: "North America", lat: 47.7, lon: -87.5 },
  { id: "mississippi-river", name: "Mississippi River", type: "River", region: "Louisiana, USA", continent: "North America", lat: 29.95, lon: -90.07 },
  { id: "lake-tahoe", name: "Lake Tahoe", type: "Lake", region: "California / Nevada", continent: "North America", lat: 39.09, lon: -120.04 },
  { id: "colorado-river", name: "Colorado River", type: "River", region: "Arizona, USA", continent: "North America", lat: 36.1, lon: -112.1 },
  { id: "chesapeake-bay", name: "Chesapeake Bay", type: "Bay", region: "Maryland, USA", continent: "North America", lat: 38.6, lon: -76.3 },
  { id: "lake-okeechobee", name: "Lake Okeechobee", type: "Lake", region: "Florida, USA", continent: "North America", lat: 26.95, lon: -80.83 },
  { id: "hudson-river", name: "Hudson River", type: "River", region: "New York, USA", continent: "North America", lat: 41.7, lon: -73.95 },
  { id: "lake-winnipeg", name: "Lake Winnipeg", type: "Lake", region: "Manitoba, Canada", continent: "North America", lat: 52.1, lon: -97.3 },
  { id: "lake-chapala", name: "Lake Chapala", type: "Lake", region: "Jalisco, Mexico", continent: "North America", lat: 20.25, lon: -103.0 },
  { id: "amazon-river", name: "Amazon River", type: "River", region: "Manaus, Brazil", continent: "South America", lat: -3.1, lon: -60.0 },
  { id: "lake-titicaca", name: "Lake Titicaca", type: "Lake", region: "Peru / Bolivia", continent: "South America", lat: -15.9, lon: -69.3 },
  { id: "paran-river", name: "Paraná River", type: "River", region: "Rosario, Argentina", continent: "South America", lat: -32.95, lon: -60.63 },
  { id: "lake-maracaibo", name: "Lake Maracaibo", type: "Lake", region: "Zulia, Venezuela", continent: "South America", lat: 9.8, lon: -71.6 },
  { id: "river-thames", name: "River Thames", type: "River", region: "London, UK", continent: "Europe", lat: 51.5, lon: -0.12 },
  { id: "lake-geneva", name: "Lake Geneva", type: "Lake", region: "Switzerland / France", continent: "Europe", lat: 46.45, lon: 6.55 },
  { id: "danube", name: "Danube", type: "River", region: "Budapest, Hungary", continent: "Europe", lat: 47.5, lon: 19.04 },
  { id: "rhine", name: "Rhine", type: "River", region: "Cologne, Germany", continent: "Europe", lat: 50.94, lon: 6.96 },
  { id: "loch-ness", name: "Loch Ness", type: "Lake", region: "Highlands, Scotland", continent: "Europe", lat: 57.3, lon: -4.45 },
  { id: "lake-ladoga", name: "Lake Ladoga", type: "Lake", region: "Leningrad Oblast, Russia", continent: "Europe", lat: 60.8, lon: 31.5 },
  { id: "baltic-sea-gulf-of-finland", name: "Baltic Sea (Gulf of Finland)", type: "Bay", region: "Helsinki, Finland", continent: "Europe", lat: 60.1, lon: 24.9 },
  { id: "nile", name: "Nile", type: "River", region: "Cairo, Egypt", continent: "Africa", lat: 30.05, lon: 31.23 },
  { id: "lake-victoria", name: "Lake Victoria", type: "Lake", region: "Uganda / Kenya / Tanzania", continent: "Africa", lat: -1.0, lon: 33.0 },
  { id: "lake-malawi", name: "Lake Malawi", type: "Lake", region: "Malawi", continent: "Africa", lat: -12.0, lon: 34.5 },
  { id: "zambezi-river", name: "Zambezi River", type: "River", region: "Victoria Falls, Zambia", continent: "Africa", lat: -17.92, lon: 25.86 },
  { id: "lake-chad", name: "Lake Chad", type: "Lake", region: "Chad / Niger / Nigeria", continent: "Africa", lat: 13.2, lon: 14.2 },
  { id: "lake-baikal", name: "Lake Baikal", type: "Lake", region: "Siberia, Russia", continent: "Asia", lat: 53.5, lon: 108.0 },
  { id: "ganges", name: "Ganges", type: "River", region: "Varanasi, India", continent: "Asia", lat: 25.3, lon: 83.0 },
  { id: "yangtze-river", name: "Yangtze River", type: "River", region: "Wuhan, China", continent: "Asia", lat: 30.6, lon: 114.3 },
  { id: "mekong-river", name: "Mekong River", type: "River", region: "Phnom Penh, Cambodia", continent: "Asia", lat: 11.56, lon: 104.93 },
  { id: "lake-biwa", name: "Lake Biwa", type: "Lake", region: "Shiga, Japan", continent: "Asia", lat: 35.25, lon: 136.08 },
  { id: "dal-lake", name: "Dal Lake", type: "Lake", region: "Srinagar, India", continent: "Asia", lat: 34.1, lon: 74.87 },
  { id: "tonl-sap", name: "Tonlé Sap", type: "Lake", region: "Cambodia", continent: "Asia", lat: 12.9, lon: 104.1 },
  { id: "murray-river", name: "Murray River", type: "River", region: "South Australia", continent: "Oceania", lat: -34.2, lon: 140.3 },
  { id: "lake-taup", name: "Lake Taupō", type: "Lake", region: "Waikato, New Zealand", continent: "Oceania", lat: -38.8, lon: 175.9 },
  { id: "sydney-harbour", name: "Sydney Harbour", type: "Bay", region: "New South Wales, Australia", continent: "Oceania", lat: -33.85, lon: 151.25 },
  { id: "great-barrier-reef-lagoon", name: "Great Barrier Reef Lagoon", type: "Bay", region: "Queensland, Australia", continent: "Oceania", lat: -18.3, lon: 147.7 },
];
export const continentOf = (w: Waterway) => w.continent ?? "North America";
export const continents = ["All", "North America", "South America", "Europe", "Africa", "Asia", "Oceania"];
