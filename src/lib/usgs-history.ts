export const stationRecordUrl = (id: string) => `https://waterdata.usgs.gov/monitoring-location/${encodeURIComponent(id)}/`;
export type HistoryPoint = { time: string; value: number; series: string };
export function normalizeHistory(features: { properties: Record<string, unknown> }[]): HistoryPoint[] {
  const points = features.flatMap(({ properties: p }) => {
    const value = p['value'] == null || p['value'] === '' ? NaN : Number(p['value']);
    const time = String(p['time'] ?? '');
    return Number.isFinite(value) && Number.isFinite(Date.parse(time)) ? [{ time, value, series: String(p['time_series_id'] ?? '') }] : [];
  });
  // A station can report several sensor series for one parameter; chart the series with the most observations.
  const bySeries = new Map<string, HistoryPoint[]>();
  for (const p of points) {
    const list = bySeries.get(p.series) ?? [];
    list.push(p);
    bySeries.set(p.series, list);
  }
  const best = [...bySeries.values()].sort((a, b) => b.length - a.length)[0] ?? [];
  return best.sort((a, b) => Date.parse(a.time) - Date.parse(b.time)).filter((p, i, all) => i === 0 || p.time !== all[i - 1]?.time);
}
