import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Wind, Filter, Sandwich, Battery, Thermometer } from "lucide-react";
import lake from "@/assets/lake.jpg";
import river from "@/assets/river.jpg";
import kit from "@/assets/kit-battery.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "The Aquora Kit — Water care for $11.99" },
      { name: "description", content: "A battery-powered aeration and carbon-filter concept kit with manual water-measuring tools, still $11.99." },
      { property: "og:title", content: "The Aquora Kit — $11.99" },
      { property: "og:description", content: "Battery-powered water care with a thermometer, pH strips and sample vial — $11.99." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Product,
});

const PRICE = 11.99;
const SANDWICH = 12.5;

function Product() {
  const [qtyText, setQtyText] = useState("1");
  const [done, setDone] = useState(false);
  const qty = Number(qtyText);
  const qtyValid = /^\d+$/.test(qtyText) && qty >= 1 && qty <= 999;
  const total = ((qtyValid ? qty : 0) * PRICE).toFixed(2);

  return (
    <div>
      <section className="relative overflow-hidden">
        <img src={lake} alt="Clear mountain lake at sunrise" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/40" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 text-foreground sm:py-32">
          <p className="text-sm uppercase tracking-[0.2em] opacity-80">Battery-powered water care</p>
          <h1 className="mt-3 max-w-2xl font-display text-5xl leading-tight sm:text-7xl">The Aquora Kit</h1>
          <p className="mt-5 max-w-xl text-lg opacity-85">Batteries, aeration, carbon filtration and simple water-measuring tools. A little care for your pond — still just ${PRICE}, less than our $12.50 sandwich comparison.</p>
          <Button asChild size="lg" className="mt-8"><a href="#buy">Get the kit — ${PRICE}</a></Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8">
            <Wind className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-3xl">Quiet aeration pump</h3>
            <p className="mt-2 text-muted-foreground">Pushes tiny bubbles into the water to raise dissolved oxygen, so fish stay active and healthy. Battery-powered, with no automatic sensor readings. Keep electrical parts dry; final specifications are subject to verification.</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8">
            <Filter className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-3xl">Activated-carbon filter</h3>
            <p className="mt-2 text-muted-foreground">A carbon cartridge wrapped in fine fabric that traps impurities, odors and cloudiness as water passes through.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-8"><Battery className="h-8 w-8 text-primary" /><h3 className="mt-4 font-display text-3xl">Battery power</h3><p className="mt-2 text-muted-foreground">Batteries and a compact holder are part of the updated kit concept. Runtime and replacement costs depend on the final pump.</p></div>
          <div className="rounded-lg border border-border bg-card p-8"><Thermometer className="h-8 w-8 text-primary" /><h3 className="mt-4 font-display text-3xl">Measure by hand</h3><p className="mt-2 text-muted-foreground">A water thermometer, pH strips and sample vial support simple manual checks. These tools do not measure dissolved oxygen or turbidity.</p></div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img src={river} alt="Clear river flowing over stones" width={1600} height={912} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/75" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-20 text-foreground md:grid-cols-2">
          <div>
            <Sandwich className="h-10 w-10" />
            <h2 className="mt-4 font-display text-5xl">Cheaper than lunch.</h2>
            <p className="mt-3 max-w-md opacity-85">Our illustrative deli sandwich comparison is ${SANDWICH.toFixed(2)}. The full Aquora Kit costs less — with manual measuring tools in the updated concept.</p>
          </div>
          <div className="space-y-4 rounded-3xl bg-background/95 p-7 text-foreground">
            {[["Average sandwich", SANDWICH], ["Aquora Kit", PRICE]].map(([label, p]) => (
              <div key={label as string}>
                <div className="flex justify-between text-sm"><span>{label}</span><span className="font-medium">${(p as number).toFixed(2)}</span></div>
                <div className="mt-1.5 h-3 rounded-full bg-secondary">
                  <div className={`h-3 rounded-full ${label === "Aquora Kit" ? "bg-primary" : "bg-muted-foreground/40"}`} style={{ width: `${((p as number) / SANDWICH) * 100}%` }} />
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">You save ${(SANDWICH - PRICE).toFixed(2)} — on the kit price comparison.</p>
          </div>
        </div>
      </section>

      <section id="buy" className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 md:grid-cols-2 md:p-12">
          <div>
            <img src={kit} alt="Aquora kit concept with batteries, pump, tubing, carbon filter, thermometer, pH strips and sample vial" width={1200} height={1008} loading="lazy" className="mb-6 aspect-[6/5] w-full rounded-2xl object-cover" />
            <p className="mb-3 text-xs text-muted-foreground">Concept illustration · final contents and specifications to be confirmed</p>
            <h2 className="font-display text-4xl">The Aquora Kit</h2>
            <div className="mt-3 font-display text-6xl text-primary">${PRICE}</div>
            <ul className="mt-6 space-y-2 text-sm">
              {["Battery-powered aeration pump", "Batteries and compact holder", "Air tubing & bubble stone", "Activated-carbon filter cartridge", "Water thermometer, pH strips & sample vial", "Record manual readings on the Aquora world map"].map((i) => (
                <li key={i} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />{i}</li>
              ))}
            </ul>
          </div>
          {done ? (
            <div className="flex items-center"><p className="font-display text-3xl">Thanks! Your order is in — we'll email you to confirm shipping and payment.</p></div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (qtyValid) setDone(true); }} className="flex flex-col justify-center gap-4">
              <label className="flex flex-col gap-2 rounded-2xl bg-secondary p-4">
                <span className="text-sm font-medium">Number of Kits</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={qtyText}
                  onChange={(e) => setQtyText(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                  aria-invalid={!qtyValid}
                  className={`rounded-full border bg-background px-5 py-3 outline-none focus:border-primary ${qtyValid ? "border-input" : "border-destructive"}`}
                />
                {!qtyValid && <span className="text-xs text-destructive">Enter a whole number from 1 to 999.</span>}
              </label>
              <div className="flex items-baseline justify-between"><span className="text-muted-foreground">Total</span><span className="font-display text-4xl">${total}</span></div>
              <input required type="email" placeholder="Your email" className="rounded-full border border-input bg-background px-5 py-3 outline-none focus:border-primary" />
              <Button disabled={!qtyValid} size="lg">Buy now</Button>
            </form>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">For ponds and small managed waterways. Manual tools cannot confirm drinking or swimming safety. Concept price remains $11.99; sourcing, battery compatibility and shipping costs must be verified before sale. This purchase form does not collect payment or send an order.</p>
      </section>
    </div>
  );
}
