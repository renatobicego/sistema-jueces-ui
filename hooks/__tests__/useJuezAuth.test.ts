import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach } from "vitest";
import { useJuezAuth } from "../useJuezAuth";
import { resetAuthStore } from "@/tests/helpers/authStore";
import { useAuthStore } from "@/store/authStore";
import { server } from "@/tests/msw/server";
import { http, HttpResponse } from "msw";

vi.mock("@/lib/axios", () => import("@/__mocks__/lib/axios"));

beforeEach(() => {
  resetAuthStore();
});

describe("useJuezAuth", () => {
  describe("loginPorDni", () => {
    it("sets juezSession in store on success", async () => {
      const { result } = renderHook(() => useJuezAuth());

      await act(async () => {
        await result.current.loginPorDni("torneo-1", "12345678", "1234");
      });

      const session = useAuthStore.getState().juezSession;
      expect(session).not.toBeNull();
      expect(session?.juezId).toBe("juez-1");
      expect(session?.esSuperJuez).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("sets error on wrong PIN", async () => {
      const { result } = renderHook(() => useJuezAuth());

      await act(async () => {
        await result.current.loginPorDni("torneo-1", "12345678", "wrong-pin");
      });

      expect(result.current.error).toMatch(/PIN/i);
      expect(useAuthStore.getState().juezSession).toBeNull();
    });
  });

  describe("registrar", () => {
    it("returns registration data on success", async () => {
      const { result } = renderHook(() => useJuezAuth());

      let data: Awaited<ReturnType<typeof result.current.registrar>>;
      await act(async () => {
        data = await result.current.registrar("torneo-1", "Nuevo Juez");
      });

      expect(data!?.nombre).toBe("Nuevo Juez");
      expect(data!?.aprobado).toBe(false);
    });

    it("sets error on server failure", async () => {
      server.use(
        http.post("http://localhost:3002/jueces/registrar/:torneoId", () =>
          HttpResponse.json({ error: "Torneo no encontrado" }, { status: 404 }),
        ),
      );

      const { result } = renderHook(() => useJuezAuth());
      await act(async () => {
        await result.current.registrar("torneo-1", "Juez");
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe("getSavedJuezId", () => {
    it("returns empty string when nothing stored", () => {
      const { result } = renderHook(() => useJuezAuth());
      expect(result.current.getSavedJuezId("torneo-x")).toBe("");
    });

    it("returns stored juezId from localStorage", () => {
      localStorage.setItem("juezId_torneo-1", "juez-stored");
      const { result } = renderHook(() => useJuezAuth());
      expect(result.current.getSavedJuezId("torneo-1")).toBe("juez-stored");
      localStorage.removeItem("juezId_torneo-1");
    });
  });
});
