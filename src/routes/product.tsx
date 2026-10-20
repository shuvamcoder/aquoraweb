import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/product")({
  beforeLoad: ({ location }) => { throw redirect({ to: "/collection", hash: location.hash, statusCode: 301 }); },
});