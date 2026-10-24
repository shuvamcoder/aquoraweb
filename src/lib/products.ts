import track from "@/assets/aquatrack.jpg";

export const measurementComponents = ["Dissolved oxygen sensor", "Temperature sensor", "pH sensor", "Turbidity sensor", "Covered Bluetooth controller", "Connected smartphone", "Enclosed battery"];
export const products = [
  { id: "aquatrack", name: "AquaTrack", batteryPowered: true, singleUse: true, image: track, description: "Water insight. Connected sensing.", components: measurementComponents, features: ["Oxygen, temperature, pH and clarity", "Bluetooth phone connection", "Battery powered · covered electronics"], limitation: "Readings describe the water at the moment you measure." },
] as const;
