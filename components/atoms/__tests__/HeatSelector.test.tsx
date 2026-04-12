import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { HeatSelector } from "../HeatSelector";
import { useAuthStore } from "@/store/authStore";

const JUECES_URL = "http://localhost:3002/api";

describe("HeatSelector", () => {
  const mockOnHeatChange = vi.fn();
  const defaultProps = {
    torneoId: "torneo-1",
    pruebaId: "prueba-1",
    categoriaId: "cat-1",
    selectedHeat: "Final_A",
    onHeatChange: mockOnHeatChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ amaToken: "fake-token" });
  });

  it("fetches heats on mount", async () => {
    server.use(
      http.get(
        `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId/heats`,
        () => {
          return HttpResponse.json({
            heats: ["Serie_1", "Serie_2", "Final_A"],
          });
        },
      ),
    );

    render(<HeatSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando heats...")).not.toBeInTheDocument();
    });
  });

  it("displays loading state initially", () => {
    server.use(
      http.get(
        `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId/heats`,
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ heats: ["Final_A"] });
        },
      ),
    );

    render(<HeatSelector {...defaultProps} />);
    expect(screen.getByText("Cargando heats...")).toBeInTheDocument();
  });

  it("defaults to Final_A on error", async () => {
    server.use(
      http.get(
        `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId/heats`,
        () => {
          return HttpResponse.json({ error: "Server error" }, { status: 500 });
        },
      ),
    );

    render(<HeatSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando heats...")).not.toBeInTheDocument();
    });
  });

  it("calls onHeatChange when selection changes", async () => {
    const user = userEvent.setup();

    server.use(
      http.get(
        `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId/heats`,
        () => {
          return HttpResponse.json({
            heats: ["Serie_1", "Serie_2", "Final_A"],
          });
        },
      ),
    );

    render(<HeatSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando heats...")).not.toBeInTheDocument();
    });

    // Find and click the select trigger
    const selectTrigger = screen.getByRole("button");
    await user.click(selectTrigger);

    // Wait for the listbox to appear and select an option
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const serie1Option = screen.getByRole("option", { name: "Serie_1" });
    await user.click(serie1Option);

    expect(mockOnHeatChange).toHaveBeenCalledWith("Serie_1");
  });

  it("does not fetch heats when token is missing", async () => {
    useAuthStore.setState({ amaToken: null });

    render(<HeatSelector {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando heats...")).not.toBeInTheDocument();
    });
  });
});
