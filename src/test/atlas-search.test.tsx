import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ComponentType } from "react";
import { Route } from "@/routes/atlas";

vi.mock("@/components/WorldMap", () => ({ WorldMap: () => null }));
vi.mock("@/components/LiveData", () => ({ LiveData: ({ lat, lon }: { lat: number; lon: number }) => <output data-testid="coordinates">{lat},{lon}</output> }));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => ({ options, useSearch: () => ({}) }) }));

afterEach(() => vi.unstubAllGlobals());

describe("Atlas independent water search", () => {
  it("geocodes a popular name without selecting or filtering popular waters", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ display_name: "Lake Ontario, New York", lat: "43.7", lon: "-77.8" }] });
    vi.stubGlobal("fetch", fetch);
    const Page = Route.options.component as ComponentType;
    render(<Page />);
    const list = screen.getByRole("list", { name: "Popular waters" });
    const count = list.querySelectorAll("li").length;
    fireEvent.change(screen.getByRole("textbox", { name: "Search anywhere" }), { target: { value: "Lake Ontario" } });
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    await waitFor(() => expect(screen.getByTestId("coordinates")).toHaveTextContent("43.7,-77.8"));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("q=Lake%20Ontario"));
    expect(list.querySelectorAll("li")).toHaveLength(count);
    expect(list.querySelector('[aria-pressed="true"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Lake Superior/ }));
    expect(screen.getByTestId("coordinates")).toHaveTextContent("47.7,-87.5");
  });
});