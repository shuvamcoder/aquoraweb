import { createFileRoute } from "@tanstack/react-router";
import { WorldMap } from "@/components/WorldMap";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "World Waterway Map — AquaSense" },
      { name: "description", content: "Discover lakes, rivers and ponds anywhere in the world, and pin waterways you know." },
      { property: "og:title", content: "World Waterway Map — AquaSense" },
      { property: "og:description", content: "An interactive map of the world's waterways. Explore and add your own." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm uppercase tracking-[0.2em] text-primary">World map</p>
      <h1 className="mt-2 font-display text-5xl">Discover waterways everywhere</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Zoom into any region to load named lakes and rivers from OpenStreetMap, search for a place, or pin a waterway you know.</p>
      <div className="mt-8"><WorldMap /></div>
    </div>
  );
}
