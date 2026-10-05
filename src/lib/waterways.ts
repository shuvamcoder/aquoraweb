export type Trend = "Improving" | "Stable" | "Declining";
export type Waterway = {
  id: string;
  name: string;
  type: "Lake" | "River" | "Reservoir" | "Pond";
  region: string;
  do: number; // mg/L
  temp: number; // °C
  ph: number;
  turbidity: number; // NTU
  trend: Trend;
  advisory: string | null;
  fishing: string;
  history: number[]; // 7-day DO
  treated: boolean;
};

export const waterways: Waterway[] = [
  { id: "lake-mirren", name: "Lake Mirren", type: "Lake", region: "Northern Highlands, WI", do: 6.2, temp: 19.4, ph: 7.5, turbidity: 4.1, trend: "Improving", advisory: null, fishing: "Good — walleye and perch active near drop-offs in the morning.", history: [5.1, 5.3, 5.6, 5.8, 5.9, 6.0, 6.2], treated: true },
  { id: "cedar-river", name: "Cedar River", type: "River", region: "Linn County, IA", do: 8.4, temp: 16.8, ph: 7.8, turbidity: 12.6, trend: "Stable", advisory: null, fishing: "Very good — smallmouth bass in riffles below the dam.", history: [8.3, 8.5, 8.4, 8.2, 8.4, 8.5, 8.4], treated: false },
  { id: "pine-hollow", name: "Pine Hollow Pond", type: "Pond", region: "Chester County, PA", do: 3.9, temp: 24.1, ph: 8.4, turbidity: 18.2, trend: "Declining", advisory: "Algae bloom watch issued by county health dept.", fishing: "Poor — low oxygen; fish may be stressed or inactive.", history: [5.2, 4.9, 4.6, 4.4, 4.2, 4.0, 3.9], treated: false },
  { id: "silver-reservoir", name: "Silver Reservoir", type: "Reservoir", region: "Placer County, CA", do: 7.1, temp: 18.2, ph: 7.3, turbidity: 2.4, trend: "Stable", advisory: null, fishing: "Good — trout at 15–25 ft depth.", history: [7.0, 7.2, 7.1, 7.0, 7.1, 7.2, 7.1], treated: false },
  { id: "willow-bay", name: "Willow Bay Resort Lake", type: "Lake", region: "Lake County, FL", do: 5.4, temp: 27.3, ph: 7.9, turbidity: 6.8, trend: "Improving", advisory: null, fishing: "Fair — bass shallow at dawn and dusk.", history: [4.1, 4.4, 4.6, 4.9, 5.0, 5.2, 5.4], treated: true },
  { id: "brandt-creek", name: "Brandt Creek", type: "River", region: "Boulder County, CO", do: 9.2, temp: 11.5, ph: 7.6, turbidity: 1.9, trend: "Stable", advisory: null, fishing: "Excellent — cold, well-oxygenated trout water.", history: [9.1, 9.3, 9.2, 9.2, 9.1, 9.3, 9.2], treated: false },
];

export function doStatus(v: number) {
  if (v >= 6) return { label: "Healthy", tone: "good" as const };
  if (v >= 4) return { label: "Watch", tone: "warn" as const };
  return { label: "Stressed", tone: "bad" as const };
}

export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
