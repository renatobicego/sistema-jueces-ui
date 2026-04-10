import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { usePruebas } from "../usePruebas";
import { server } from "@/tests/msw/server";
import { http, HttpResponse } from "msw";

vi.mock("@/lib/axios", () => import("@/__mocks__/lib/axios"));

describe("usePruebas", () => {
  it("loads pruebas for a given torneoId", async () => {
    const { result } = renderHook(() => usePruebas("torneo-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pruebas).toHaveLength(1);
    expect(result.current.pruebas[0].nombre).toBe("100m Llanos");
  });

  it("does not fetch when torneoId is empty", async () => {
    const { result } = renderHook(() => usePruebas(""));

    // loading stays true because the effect returns early
    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.pruebas).toHaveLength(0);
  });

  it("sets error on fetch failure", async () => {
    server.use(
      http.get("http://localhost:3002/jueces/torneo/:torneoId/pruebas", () =>
        HttpResponse.json({ error: "Error" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => usePruebas("torneo-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
  });
});
