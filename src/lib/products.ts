import track from "@/assets/aquatrack.jpg";
import pure from "@/assets/aquapure.jpg";
import sync from "@/assets/aquasync.jpg";

export const measurementComponents = ["Dissolved oxygen sensor", "Temperature sensor", "pH sensor", "Turbidity sensor", "Covered Bluetooth controller", "Connected smartphone", "Enclosed battery"];
export const treatmentComponents = ["Covered treatment housing", "Mini air pump", "Air tubing and air stone", "Activated-carbon filter cartridge", "Water inlet and outlet", "Enclosed battery"];
export const products = [
  { id: "aquasync", name: "AquaSync", batteryPowered: true, singleUse: true, image: sync, description: "One connection. Sensing and care.", components: [...new Set([...measurementComponents, ...treatmentComponents])], features: ["Four sensors with Bluetooth", "Air pump and carbon filtration", "Battery powered · covered electronics"], limitation: "No single reading or treatment establishes drinking-water safety." },
  { id: "aquatrack", name: "AquaTrack", batteryPowered: true, singleUse: true, image: track, description: "Water insight. Connected sensing.", components: measurementComponents, features: ["Oxygen, temperature, pH and clarity", "Bluetooth phone connection", "Battery powered · covered electronics"], limitation: "Readings describe the water at the moment you measure." },
  { id: "aquapure", name: "AquaPure", batteryPowered: true, singleUse: true, image: pure, description: "Flow renewal. Air and filtration.", components: treatmentComponents, features: ["Air pump and carbon filtration", "Activated-carbon cartridge", "Battery powered · covered electronics"], limitation: "Treatment depends on contaminants and testing; this system does not establish drinking-water safety." },
] as const;
