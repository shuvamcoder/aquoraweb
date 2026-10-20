import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/worldmap")({
  validateSearch: z.object({ q: z.string().optional() }),
  beforeLoad: ({ search, location }) => { throw redirect({ to: "/atlas", search, hash: location.hash, statusCode: 301 }); },
});