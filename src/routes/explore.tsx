import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

// Discover was merged into Atlas; keep old links working.
export const Route = createFileRoute("/explore")({
  validateSearch: z.object({ q: z.string().optional() }),
  beforeLoad: ({ search }) => { throw redirect({ to: "/atlas", search: { q: search.q }, hash: "featured", statusCode: 301 }); },
});
