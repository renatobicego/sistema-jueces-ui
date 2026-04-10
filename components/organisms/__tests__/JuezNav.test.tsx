import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import JuezNav from "../JuezNav";
import {
  resetAuthStore,
  seedJuezSession,
  seedSuperJuezSession,
} from "@/tests/helpers/authStore";
import { useAuthStore } from "@/store/authStore";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  resetAuthStore();
  mockPush.mockClear();
});

describe("JuezNav", () => {
  describe("without session", () => {
    it("renders brand link to /juez/login", () => {
      render(<JuezNav />);
      expect(
        screen.getByRole("link", { name: /sistema jueces/i }),
      ).toHaveAttribute("href", "/juez/login");
    });

    it("does not render juez name", () => {
      render(<JuezNav />);
      // only the Salir button should be visible, no name
      expect(screen.queryByText(/ana/i)).not.toBeInTheDocument();
    });

    it("does not show Super Juez chip", () => {
      render(<JuezNav />);
      expect(screen.queryByText("Super Juez")).not.toBeInTheDocument();
    });

    it("still renders the Salir button", () => {
      render(<JuezNav />);
      expect(
        screen.getByRole("button", { name: /salir/i }),
      ).toBeInTheDocument();
    });
  });

  describe("with regular juez session", () => {
    it("renders juez name", () => {
      seedJuezSession({ nombre: "Ana López" });
      render(<JuezNav />);
      expect(screen.getByText("Ana López")).toBeInTheDocument();
    });

    it("does not show Super Juez chip", () => {
      seedJuezSession({ esSuperJuez: false });
      render(<JuezNav />);
      expect(screen.queryByText("Super Juez")).not.toBeInTheDocument();
    });

    it("links to pruebas page for the session torneo", () => {
      seedJuezSession({ torneoId: "torneo-abc" });
      render(<JuezNav />);
      expect(
        screen.getByRole("link", { name: /sistema jueces/i }),
      ).toHaveAttribute("href", "/juez/torneo-abc/pruebas");
    });

    it("clears juezSession on logout", async () => {
      seedJuezSession();
      render(<JuezNav />);
      await userEvent.click(screen.getByRole("button", { name: /salir/i }));
      expect(useAuthStore.getState().juezSession).toBeNull();
    });

    it("redirects to /juez/login on logout", async () => {
      seedJuezSession();
      render(<JuezNav />);
      await userEvent.click(screen.getByRole("button", { name: /salir/i }));
      expect(mockPush).toHaveBeenCalledWith("/juez/login");
    });
  });

  describe("with super juez session", () => {
    it("shows Super Juez chip", () => {
      seedSuperJuezSession({ nombre: "Super Admin" });
      render(<JuezNav />);
      expect(screen.getByText("Super Juez")).toBeInTheDocument();
    });

    it("renders the super juez name", () => {
      seedSuperJuezSession({ nombre: "Super Admin" });
      render(<JuezNav />);
      expect(screen.getByText("Super Admin")).toBeInTheDocument();
    });
  });
});
