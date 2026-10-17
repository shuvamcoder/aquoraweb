import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { normalizeHistory } from "@/lib/usgs-history";
import { Button } from "@/components/ui/button";

export function StationHistory({ id }: { id: string }) {
  const [code,setCode] = useState("00300"); const [days,setDays] = useState("7");
  const params = [{code:"00300",label:"Dissolved oxygen",unit:"mg/L"},{code:"00010",label:"Temperature",unit:"°C"},{code:"00400",label:"pH",unit:""},{code:"00095",label:"Specific conductance",unit:"µS/cm"},{code:"00060",label:"Streamflow",unit:"ft³/s"}];
  const param = params.find(p => p.code === code) ?? params[0];
  const q = useQuery({queryKey:["usgs-history",id,code,days],queryFn:async () => {
    const end = new Date();
    const start = new Date(end.getTime() - Number(days) * 86400000);
    const query = new URLSearchParams({f:"json",limit:"10000",monitoring_location_id:id,parameter_code:code,datetime:`${start.toISOString()}/${end.toISOString()}`});
    const r = await fetch(`https://api.waterdata.usgs.gov/ogcapi/v0/collections/continuous/items?${query}`, {signal: AbortSignal.timeout(20000)});
    if (!r.ok) throw new Error("History unavailable");
    const data = await r.json() as {features?: {properties:Record<string,unknown>}[]; links?: {rel:string}[]};
    return {points:normalizeHistory(data.features ?? []), partial: data.links?.some(l => l.rel === "next") ?? false};
  },staleTime:300000,retry:1});
  return <section className="mt-5 border-t border-border pt-5"><h3 className="font-medium">Station history</h3><div className="mt-3 flex flex-wrap gap-2"><select aria-label="History measurement" value={code} onChange={e => setCode(e.target.value)} className="min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm">{params.map(p => <option value={p.code} key={p.code}>{p.label}{p.unit ? ` (${p.unit})` : ""}</option>)}</select><select aria-label="History date range" value={days} onChange={e => setDays(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="1">Last 24 hours</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></div>
  {q.isPending ? <p role="status" className="mt-4 text-sm text-muted-foreground">Loading recorded measurements…</p> : q.isError ? <div className="mt-4"><p className="text-sm text-muted-foreground">History could not be loaded. You can try again.</p><Button variant="outline" size="sm" className="mt-2" onClick={() => q.refetch()}>Retry history</Button></div> : !q.data?.points.length ? <p className="mt-4 text-sm text-muted-foreground">No recorded values for this measurement and date range.</p> : <><div className="mt-5 h-60 w-full" aria-label={`${param?.label} history chart`}><ResponsiveContainer><LineChart data={q.data.points} margin={{left:0,right:10,top:10,bottom:5}}><CartesianGrid stroke="var(--border)" vertical={false}/><XAxis dataKey="time" tickFormatter={v => new Date(v).toLocaleDateString(undefined,{month:"short",day:"numeric"})} stroke="var(--muted-foreground)" fontSize={11} minTickGap={35}/><YAxis stroke="var(--muted-foreground)" fontSize={11} width={45} domain={["auto","auto"]}/><Tooltip labelFormatter={v => new Date(v).toLocaleString()} formatter={v => [`${v} ${param?.unit ?? ""}`,param?.label]} contentStyle={{background:"var(--card)",border:"1px solid var(--border)"}}/><Line type="linear" dataKey="value" stroke="var(--primary)" dot={false} strokeWidth={2} isAnimationActive={false}/></LineChart></ResponsiveContainer></div><p className="mt-2 text-xs text-muted-foreground">{param?.label} {param?.unit} · {q.data.points.length} observations · one USGS series. {q.data.partial ? "Partial response; view the source for the full record." : ""} Provisional data may be revised.</p></>}
  <p className="mt-4 text-xs text-muted-foreground">Source: USGS station record {id}</p></section>;
}