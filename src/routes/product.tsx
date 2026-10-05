import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "AquaSense Treatment Device — Buy" },
      { name: "description", content: "A low-cost aeration and activated-carbon treatment system with sensors that report live to your AquaSense dashboard." },
      { property: "og:title", content: "AquaSense Treatment Device" },
      { property: "og:description", content: "Raise dissolved oxygen, reduce selected contaminants, and watch the results live." },
    ],
  }),
  component: Product,
});

const plans = [
  { id: "basic", name: "AquaSense Basic", price: 149, desc: "Aeration + carbon treatment", items: ["Air pump, tubing & diffuser", "Activated-carbon cartridge", "Ideal for ponds up to ¼ acre"] },
  { id: "connected", name: "AquaSense Connected", price: 349, desc: "Treatment + live monitoring", featured: true, items: ["Everything in Basic", "DO, temperature, pH & turbidity sensors", "ESP32 link to your dashboard", "Change alerts"] },
  { id: "carbon", name: "Carbon refill", price: 29, desc: "Replacement cartridge", items: ["Lasts ~3 months typical use", "Fits Basic & Connected"] },
];

function Product() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const total = plans.reduce((s, p) => s + (cart[p.id] ?? 0) * p.price, 0);
  const add = (id: string, n: number) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + n) }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm uppercase tracking-[0.2em] text-primary">The device</p>
      <h1 className="mt-2 max-w-3xl font-display text-5xl sm:text-6xl">Clearer water you can measure.</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">An air pump pushes air through a diffuser to raise dissolved oxygen, while a separate activated-carbon cartridge reduces selected, validated contaminants. The Connected model reports every reading to your treatment dashboard so you can see whether conditions are improving.</p>

      <div className="mt-10 grid gap-3 rounded-3xl bg-secondary p-6 font-mono text-sm sm:grid-cols-4">
        {["Air pump", "Tubing", "Diffuser", "Water"].map((s, i) => <div key={s} className="rounded-xl bg-card p-4 text-center">{i + 1}. {s}</div>)}
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className={`flex flex-col rounded-3xl border p-7 ${p.featured ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
            <h3 className="font-display text-2xl">{p.name}</h3>
            <p className="text-sm opacity-75">{p.desc}</p>
            <div className="my-5 font-display text-5xl">${p.price}</div>
            <ul className="flex-1 space-y-2 text-sm">
              {p.items.map((i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 shrink-0" />{i}</li>)}
            </ul>
            <div className="mt-6 flex items-center gap-2">
              <button onClick={() => add(p.id, -1)} className="h-10 w-10 rounded-full border border-current/30">−</button>
              <span className="w-6 text-center">{cart[p.id] ?? 0}</span>
              <button onClick={() => add(p.id, 1)} className={`flex-1 rounded-full py-2.5 text-sm font-medium ${p.featured ? "bg-background text-foreground" : "bg-primary text-primary-foreground"}`}>Add to order</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-border bg-card p-7">
        {done ? (
          <p className="font-display text-2xl">Thanks! Your order request is in — we’ll be in touch to confirm shipping and payment.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (total) setDone(true); }} className="flex flex-wrap items-center gap-3">
            <div className="mr-auto">
              <div className="text-sm text-muted-foreground">Order total</div>
              <div className="font-display text-4xl">${total}</div>
            </div>
            <input required type="email" placeholder="Your email" className="rounded-full border border-input bg-background px-5 py-3 outline-none focus:border-primary" />
            <button disabled={!total} className="rounded-full bg-foreground px-6 py-3 text-sm text-background disabled:opacity-40">Place order</button>
          </form>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Intended for appropriate managed waterways such as ponds and resort lakes. Not a substitute for official water-safety advisories.</p>
    </div>
  );
}
