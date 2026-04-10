import { renderHook, waitFor, act } from "@testing-library/react";
import { vi } from "vitest";
import { useTorneos } from "../useTorneos";
import { server } from "@/tests/msw/server";
import { http, HttpResponse } from "msw";

vi.mock("@/lib/axios", () => import("@/__mocks__/lib/axios"));

describe("useTorneos", () => {
  it("loads torneos on mount", async () => {
    const { result } = renderHook(() => useTorneos());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.allTorneos).toHaveLength(1);
    expect(result.current.allTorneos[0].nombre).toBe("Torneo Test");
  });

  it("filters to active torneos by default (soloActivos=true)", async () => {
    const { result } = renderHook(() => useTorneos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // The handler returns a torneo with fecha=now, which is within the active window
    expect(result.current.torneos).toHaveLength(1);
  });

  it("shows all torneos when soloActivos is toggled off", async () => {
    const { result } = renderHook(() => useTorneos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSoloActivos(false));
    expect(result.current.torneos).toHaveLength(1);
  });

  it("sets error on fetch failure", async () => {
    server.use(
      http.get("http://localhost:3001/torneo", () =>
        HttpResponse.json({ msg: "Error" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useTorneos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
  });
});
