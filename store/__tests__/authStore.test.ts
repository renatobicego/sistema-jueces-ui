import { beforeEach, describe, it, expect } from "vitest";
import { useAuthStore } from "../authStore";
import { resetAuthStore } from "@/tests/helpers/authStore";

beforeEach(() => {
  resetAuthStore();
  localStorage.clear();
});

describe("authStore", () => {
  describe("setAmaAuth", () => {
    it("stores user and token", () => {
      useAuthStore.getState().setAmaAuth(
        {
          uid: "u1",
          nombre_apellido: "Admin",
          dni: "12345678",
          role: "ADMIN_ROLE",
          isEditor: false,
        },
        "my-token",
      );

      const state = useAuthStore.getState();
      expect(state.amaUser?.uid).toBe("u1");
      expect(state.amaToken).toBe("my-token");
    });
  });

  describe("setJuezSession", () => {
    it("stores session and persists juezId to localStorage", () => {
      useAuthStore.getState().setJuezSession({
        token: "juez-token",
        juezId: "juez-1",
        nombre: "Juez",
        torneoId: "torneo-1",
        esSuperJuez: false,
        pruebasAsignadas: [],
      });

      const state = useAuthStore.getState();
      expect(state.juezSession?.juezId).toBe("juez-1");
      expect(localStorage.getItem("juezId_torneo-1")).toBe("juez-1");
    });
  });

  describe("clearJuezSession", () => {
    it("removes juez session", () => {
      useAuthStore.getState().setJuezSession({
        token: "t",
        juezId: "j1",
        nombre: "J",
        torneoId: "t1",
        esSuperJuez: false,
        pruebasAsignadas: [],
      });

      useAuthStore.getState().clearJuezSession();
      expect(useAuthStore.getState().juezSession).toBeNull();
    });
  });

  describe("logout", () => {
    it("clears all auth state", () => {
      useAuthStore
        .getState()
        .setAmaAuth(
          {
            uid: "u1",
            nombre_apellido: "A",
            dni: "1",
            role: "ADMIN_ROLE",
            isEditor: false,
          },
          "token",
        );
      useAuthStore.getState().setJuezSession({
        token: "t",
        juezId: "j1",
        nombre: "J",
        torneoId: "t1",
        esSuperJuez: false,
        pruebasAsignadas: [],
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.amaUser).toBeNull();
      expect(state.amaToken).toBeNull();
      expect(state.juezSession).toBeNull();
    });
  });
});
