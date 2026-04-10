import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SuperJuezGuard } from "../SuperJuezGuard";
import {
  resetAuthStore,
  seedJuezSession,
  seedSuperJuezSession,
} from "@/tests/helpers/authStore";

vi.mock("@/lib/axios", () => import("@/__mocks__/lib/axios"));

beforeEach(() => {
  resetAuthStore();
});

describe("SuperJuezGuard", () => {
  describe("when already authorized", () => {
    it("renders children when session matches torneoId and is super juez", () => {
      seedSuperJuezSession({ torneoId: "torneo-1" });
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>Contenido protegido</p>
        </SuperJuezGuard>,
      );
      expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    });

    it("does not render the login form when authorized", () => {
      seedSuperJuezSession({ torneoId: "torneo-1" });
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>x</p>
        </SuperJuezGuard>,
      );
      expect(
        screen.queryByText(/se requiere acceso de super juez/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("when not authorized", () => {
    it("shows login form when no session", () => {
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>Oculto</p>
        </SuperJuezGuard>,
      );
      expect(screen.queryByText("Oculto")).not.toBeInTheDocument();
      expect(
        screen.getByText(/se requiere acceso de super juez/i),
      ).toBeInTheDocument();
    });

    it("shows login form when session belongs to a different torneo", () => {
      seedSuperJuezSession({ torneoId: "otro-torneo" });
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>Oculto</p>
        </SuperJuezGuard>,
      );
      expect(screen.queryByText("Oculto")).not.toBeInTheDocument();
      expect(
        screen.getByText(/se requiere acceso de super juez/i),
      ).toBeInTheDocument();
    });

    it("shows login form when session is not super juez", () => {
      seedJuezSession({ torneoId: "torneo-1", esSuperJuez: false });
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>Oculto</p>
        </SuperJuezGuard>,
      );
      expect(screen.queryByText("Oculto")).not.toBeInTheDocument();
    });

    it("renders DNI and PIN inputs", () => {
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>x</p>
        </SuperJuezGuard>,
      );
      expect(screen.getByLabelText("DNI")).toBeInTheDocument();
      expect(screen.getByLabelText("PIN del torneo")).toBeInTheDocument();
    });

    it("renders the Autenticar button", () => {
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>x</p>
        </SuperJuezGuard>,
      );
      expect(
        screen.getByRole("button", { name: /autenticar/i }),
      ).toBeInTheDocument();
    });

    it("renders the helper description text", () => {
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>x</p>
        </SuperJuezGuard>,
      );
      expect(screen.getByText(/ingresá tu DNI y el PIN/i)).toBeInTheDocument();
    });
  });

  describe("login interaction", () => {
    it("shows error message on failed login", async () => {
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>x</p>
        </SuperJuezGuard>,
      );
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.type(
        screen.getByLabelText("PIN del torneo"),
        "wrong-pin",
      );
      await userEvent.click(
        screen.getByRole("button", { name: /autenticar/i }),
      );
      await waitFor(() =>
        expect(screen.getByText("PIN incorrecto")).toBeInTheDocument(),
      );
    });

    it("does not show children after failed login", async () => {
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>Contenido protegido</p>
        </SuperJuezGuard>,
      );
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.type(
        screen.getByLabelText("PIN del torneo"),
        "wrong-pin",
      );
      await userEvent.click(
        screen.getByRole("button", { name: /autenticar/i }),
      );
      await waitFor(() => screen.getByText("PIN incorrecto"));
      expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    });

    it("renders children after successful login", async () => {
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>Contenido protegido</p>
        </SuperJuezGuard>,
      );
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.type(screen.getByLabelText("PIN del torneo"), "1234");
      await userEvent.click(
        screen.getByRole("button", { name: /autenticar/i }),
      );
      await waitFor(() =>
        expect(screen.getByText("Contenido protegido")).toBeInTheDocument(),
      );
    });

    it("hides the login form after successful login", async () => {
      render(
        <SuperJuezGuard torneoId="torneo-1">
          <p>Contenido protegido</p>
        </SuperJuezGuard>,
      );
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.type(screen.getByLabelText("PIN del torneo"), "1234");
      await userEvent.click(
        screen.getByRole("button", { name: /autenticar/i }),
      );
      await waitFor(() => screen.getByText("Contenido protegido"));
      expect(
        screen.queryByText(/se requiere acceso de super juez/i),
      ).not.toBeInTheDocument();
    });
  });
});
