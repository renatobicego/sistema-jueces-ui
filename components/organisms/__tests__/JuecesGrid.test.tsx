import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import JuecesGrid from "../JuecesGrid";
import type { AccesoJuez, Prueba } from "@/types";

// Capture the props passed to AgGridReact so we can test column/row logic
let capturedProps: Record<string, unknown> = {};
vi.mock("ag-grid-react", () => ({
  AgGridReact: (props: Record<string, unknown>) => {
    capturedProps = props;
    return <div data-testid="ag-grid" />;
  },
}));

const jueces: AccesoJuez[] = [
  {
    _id: "j1",
    torneo: "t1",
    nombre: "Ana López",
    aprobado: false,
    esSuperJuez: false,
    pruebasAsignadas: [],
  },
  {
    _id: "j2",
    torneo: "t1",
    nombre: "Carlos Ruiz",
    aprobado: true,
    esSuperJuez: true,
    pruebasAsignadas: ["p1"],
  },
];

const pruebas: Prueba[] = [
  { _id: "p1", nombre: "100m Llanos", tipo: "velocidad", categorias: [] },
];

const defaultProps = {
  jueces,
  pruebas,
  onAprobar: vi.fn(),
  onEliminar: vi.fn(),
};

beforeEach(() => {
  capturedProps = {};
  defaultProps.onAprobar.mockClear();
  defaultProps.onEliminar.mockClear();
});

describe("JuecesGrid", () => {
  it("renders the grid", () => {
    render(<JuecesGrid {...defaultProps} />);
    expect(screen.getByTestId("ag-grid")).toBeInTheDocument();
  });

  it("passes all jueces as rowData", () => {
    render(<JuecesGrid {...defaultProps} />);
    expect(capturedProps.rowData).toEqual(jueces);
  });

  it("renders with empty jueces list without crashing", () => {
    render(<JuecesGrid {...defaultProps} jueces={[]} />);
    expect(screen.getByTestId("ag-grid")).toBeInTheDocument();
    expect(capturedProps.rowData).toEqual([]);
  });

  it("defines 4 column definitions", () => {
    render(<JuecesGrid {...defaultProps} />);
    expect((capturedProps.columnDefs as unknown[]).length).toBe(4);
  });

  it("sets rowHeight to 52", () => {
    render(<JuecesGrid {...defaultProps} />);
    expect(capturedProps.rowHeight).toBe(52);
  });

  it("re-renders when jueces prop changes", () => {
    const { rerender } = render(<JuecesGrid {...defaultProps} />);
    const newJueces = [...jueces, { ...jueces[0], _id: "j3", nombre: "Nuevo" }];
    rerender(<JuecesGrid {...defaultProps} jueces={newJueces} />);
    expect(capturedProps.rowData).toHaveLength(3);
  });
});
