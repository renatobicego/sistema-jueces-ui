import { renderHook, waitFor, act } from "@testing-library/react";
import { vi } from "vitest";
import { useEventoAtletas } from "../useEventoAtletas";
import { server } from "@/tests/msw/server";
import { http, HttpResponse } from "msw";

vi.mock("@/lib/axios", () => import("@/__mocks__/lib/axios"));

describe("useEventoAtletas", () => {
  it("loads evento data on mount", async () => {
    const { result } = renderHook(() =>
      useEventoAtletas("torneo-1", "cat-1", "prueba-1"),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.masculino.atletas).toHaveLength(1);
    expect(
      result.current.data?.masculino.atletas[0].atleta.nombre_apellido,
    ).toBe("Juan Pérez");
  });

  it("does not fetch when params are empty", async () => {
    const { result } = renderHook(() => useEventoAtletas("", "", ""));
    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.data).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    server.use(
      http.get(
        "http://localhost:3002/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId",
        () => HttpResponse.json({ error: "Error" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() =>
      useEventoAtletas("torneo-1", "cat-1", "prueba-1"),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
  });

  it("reloads data when reload() is called", async () => {
    const { result } = renderHook(() =>
      useEventoAtletas("torneo-1", "cat-1", "prueba-1"),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.data).not.toBeNull();
  });
});
