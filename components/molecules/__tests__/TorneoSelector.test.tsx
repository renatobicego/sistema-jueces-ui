import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TorneoSelector from "../TorneoSelector";
import type { Torneo } from "@/types";

const torneo: Torneo = {
  _id: "t1",
  nombre: "Torneo Vendimia",
  lugar: "Mendoza",
  fecha: new Date().toISOString(),
  cantidadDias: 1,
  inscripcionesAbiertas: true,
  pruebasDisponibles: [],
  categoriasDisponibles: [],
};

const defaultProps = {
  torneos: [torneo],
  loading: false,
  selected: null,
  onSelect: vi.fn(),
  soloActivos: true,
  onToggleActivos: vi.fn(),
};

describe("TorneoSelector", () => {
  it("shows loading spinner when loading", () => {
    render(<TorneoSelector {...defaultProps} loading={true} />);
    expect(document.querySelector("[data-slot='spinner']")).toBeInTheDocument();
  });

  it("renders the Torneo label", () => {
    render(<TorneoSelector {...defaultProps} />);
    expect(screen.getByText("Torneo")).toBeInTheDocument();
  });

  it("renders the Solo activos checkbox", () => {
    render(<TorneoSelector {...defaultProps} />);
    expect(screen.getByText("Solo activos")).toBeInTheDocument();
  });

  it("renders the select placeholder", () => {
    render(<TorneoSelector {...defaultProps} />);
    expect(screen.getByText("Seleccioná un torneo")).toBeInTheDocument();
  });
});
