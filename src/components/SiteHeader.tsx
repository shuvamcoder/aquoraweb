import { Link } from "@tanstack/react-router";
import { Droplets } from "lucide-react";

const links = [
  { to: "/explore", label: "Explore waterways" },
  { to: "/dashboard", label: "Treatment dashboard" },
  { to: "/product", label: "The device" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl text-foreground">
          <Droplets className="h-6 w-6 text-primary" /> AquaSense
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-secondary text-foreground" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <span className="font-display text-lg text-foreground">There is no ‘fear’ when it’s clear.</span>
        <span>Measure → Understand → Treat</span>
      </div>
    </footer>
  );
}
