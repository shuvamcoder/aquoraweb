import { useSyncExternalStore } from "react";
import type { Observation } from "./observations";

// Session-only bookmarks intentionally avoid claiming shared or durable storage.
let saved: Observation[] = [];
const empty: Observation[] = [];
const listeners = new Set<() => void>();
const subscribe = (callback: () => void) => { listeners.add(callback); return () => { listeners.delete(callback); }; };
export function useSavedPlaces() {
  const places = useSyncExternalStore(subscribe, () => saved, () => empty);
  const toggle = (o: Observation) => {
    saved = saved.some((s) => s.id === o.id) ? saved.filter((s) => s.id !== o.id) : [...saved, o];
    listeners.forEach((notify) => notify());
  };
  return { places, toggle };
}