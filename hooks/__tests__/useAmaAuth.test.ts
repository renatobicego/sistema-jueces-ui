import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach } from "vitest";
import { useAmaAuth } from "../useAmaAuth";
import { resetAuthStore } from "@/tests/helpers/authStore";
import { server } from "@/tests/msw/server";
import { http, HttpResponse } from "msw";

vi.mock("@/lib/axios", () => import("@/__mocks__/lib/axios"));

beforeEach(() => {
  resetAuthStore();
});

describe("useAmaAuth", () => {
  it("starts with loading=false and no error", () => {
    const { result } = renderHook(() => useAmaAuth());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns loading=false after login completes", async () => {
    const { result } = renderHook(() => useAmaAuth());

    await act(async () => {
      await result.current.login("12345678", "pass");
    });

    expect(result.current.loading).toBe(false);
  });

  it("returns user and sets store on successful login", async () => {
    const { result } = renderHook(() => useAmaAuth());

    let user: Awaited<ReturnType<typeof result.current.login>>;
    await act(async () => {
      user = await result.current.login("12345678", "pass");
    });

    expect(user!).not.toBeNull();
    expect(user!?.nombre_apellido).toBe("Admin Test");
    expect(result.current.error).toBeNull();
  });

  it("sets error on failed login (401)", async () => {
    const { result } = renderHook(() => useAmaAuth());

    await act(async () => {
      await result.current.login("99999999", "wrong");
    });

    expect(result.current.error).toBeTruthy();
  });

  it("sets error when user lacks permissions", async () => {
    server.use(
      http.post("http://localhost:3001/auth/login", () =>
        HttpResponse.json({
          token: "t",
          usuario: {
            uid: "u1",
            nombre_apellido: "Sin Permisos",
            dni: "11111111",
            role: "USER_ROLE",
            isEditor: false,
          },
        }),
      ),
    );

    const { result } = renderHook(() => useAmaAuth());
    let user: Awaited<ReturnType<typeof result.current.login>>;
    await act(async () => {
      user = await result.current.login("11111111", "pass");
    });

    expect(user!).toBeNull();
    expect(result.current.error).toMatch(/permisos/i);
  });
});
