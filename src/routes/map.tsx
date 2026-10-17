import { createFileRoute } from "@tanstack/react-router";
import { WorldMap } from "@/components/WorldMap";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Atlas — Aquora" },
      { name: "description", content: "Discover U.S. lakes, rivers and ponds with USGS station readings, and pin waterways you know." },
...
      { property: "og:description", content: "An interactive map of U.S. waterways. Explore and add your own." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm uppercase tracking-[0.2em] text-primary">Aquora / Atlas</p>
      <h1 className="mt-2 font-display text-5xl">A world of water.</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Zoom into any region to load named lakes and rivers from OpenStreetMap, search for a place, or pin a waterway you know.</p>
      <div className="mt-8"><WorldMap /></div>
    </div>
  );
}
