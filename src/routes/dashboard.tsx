import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Cpu, Filter, Wind } from "lucide-react";
import { DoChart } from "@/components/DoChart";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Treatment Dashboard — AquaSense" },
      { name: "description", content: "Live readings from AquaSense aeration and activated-carbon devices, with before-and-after treatment results." },
      { property: "og:title", content: "Treatment Dashboard — AquaSense" },
      { property: "og:description", content: "See whether treatment is improving oxygen and water quality in managed waterways." },
    ],
  }),
  component: Dashboard,
});

const devices = [
  { id: "AS-014", site: "Lake Mirren — North cove", pump: true, carbon: 72, battery: 88 },
  { id: "AS-022", site: "Willow Bay Resort Lake", pump: true, carbon: 41, battery: 64 },
  { id: "AS-031", site: "Hartley Farm Pond", pump: false, carbon: 95, battery: 100 },
];

const series = [4.2, 4.0, 4.3, 4.1, 4.4, 4.9, 5.4, 5.8, 6.1, 6.3, 6.4, 6.6, 6.5, 6.8].map((v, i) => ({ label: `D${i + 1}`, value: v }));

function Dashboard() {
  const [sel, setSel] = useState(devices[0]!.id);
  const [live, setLive] = useState({ do: 6.8, sat: 78, temp: 18.9, ph: 7.4, turb: 3.8 });
  useEffect(() => {
    const t = setInterval(() => setLive((l) => ({ ...l, do: +(l.do + (Math.random() - 0.45) * 0.08).toFixed(2), temp: +(l.temp + (Math.random() - 0.5) * 0.05).toFixed(2) })), 2500);
    return () => clearInterval(t);
  }, []);
  const d = devices.find((x) => x.id === sel)!;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">Treatment dashboard</h1>
          <p className="mt-2 text-muted-foreground">For pond owners, resorts and managed-water sites running AquaSense devices. Demo data.</p>
        </div>
        <select value={sel} onChange={(e) => setSel(e.target.value)} className="rounded-xl border border-input bg-card px-4 py-2.5">
          {devices.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.site}</option>)}
        </select>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[["Dissolved O₂", `${live.do} mg/L`], ["DO saturation", `${live.sat}%`], ["Temperature", `${live.temp}°C`], ["pH", live.ph], ["Turbidity", `${live.turb} NTU`]].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" />{k}</div>
            <div className="mt-1 font-display text-3xl">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Before vs. after treatment</h2>
            <span className="rounded-full bg-good/15 px-3 py-1 text-sm text-good">+59% oxygen</span>
          </div>
          <DoChart data={series} height={280} marker="D5" />
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-secondary p-3"><div className="text-muted-foreground">Avg before</div><div className="font-display text-2xl">4.2 mg/L</div></div>
            <div className="rounded-xl bg-secondary p-3"><div className="text-muted-foreground">Avg after</div><div className="font-display text-2xl">6.3 mg/L</div></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" /><span className="font-medium">{d.id}</span></div>
            <p className="text-sm text-muted-foreground">{d.site}</p>
          </div>
          <Status icon={Wind} label="Aeration pump" value={d.pump ? "Running" : "Paused"} ok={d.pump} />
          <Status icon={Filter} label="Carbon cartridge life" value={`${d.carbon}%`} ok={d.carbon > 30} bar={d.carbon} />
          <Status icon={Activity} label="Battery / ESP32 link" value={`${d.battery}% · online`} ok bar={d.battery} />
        </div>
      </div>
    </div>
  );
}

function Status({ icon: Icon, label, value, ok, bar }: { icon: typeof Wind; label: string; value: string; ok: boolean; bar?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" />{label}</span>
        <span className={ok ? "text-good" : "text-warn-foreground"}>{value}</span>
      </div>
      {bar !== undefined && <div className="mt-3 h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${bar}%` }} /></div>}
    </div>
  );
}
