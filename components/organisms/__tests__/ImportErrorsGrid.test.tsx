import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ImportErrorsGrid from "../ImportErrorsGrid";
import type { FilaFallida } from "@/types";

vi.mock("ag-grid-react", () => ({
  AgGridReact: () => <div data-testid="ag-grid" />,
}));

const mockWriteFile = vi.fn();
const mockJsonToSheet = vi.fn(() => ({ "!cols": [], A1: { v: "" } }));
const mockBookNew = vi.fn(() => ({}));
const mockBookAppendSheet = vi.fn();

vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: (...args: unknown[]) => mockJsonToSheet(...args),
    book_new: () => mockBookNew(),
    book_append_sheet: (...args: unknown[]) => mockBookAppendSheet(...args),
    encode_cell: ({ r, c }: { r: number; c: number }) =>
      `${String.fromCharCode(65 + c)}${r + 1}`,
  },
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
}));

const rows: FilaFallida[] = [
  {
    fila: 2,
    dni: "12345678",
    nombre: "Juan Pérez",
    prueba: "100m",
    categoria: "Sub-18",
    motivo: "DNI duplicado",
  },
  {
    fila: 5,
    dni: "87654321",
    nombre: "Ana García",
    prueba: "200m",
    categoria: "Sub-20",
    motivo: "Categoría inválida",
  },
];

describe("ImportErrorsGrid", () => {
  it("renders the export button", () => {
    render(<ImportErrorsGrid rows={rows} />);
    expect(
      screen.getByRole("button", { name: /exportar errores/i }),
    ).toBeInTheDocument();
  });

  it("renders the grid", () => {
    render(<ImportErrorsGrid rows={rows} />);
    expect(screen.getByTestId("ag-grid")).toBeInTheDocument();
  });

  it("renders with empty rows without crashing", () => {
    render(<ImportErrorsGrid rows={[]} />);
    expect(screen.getByTestId("ag-grid")).toBeInTheDocument();
  });

  describe("export", () => {
    beforeEach(() => {
      mockWriteFile.mockClear();
      mockJsonToSheet.mockClear();
    });

    it("calls writeFile when export button is clicked", async () => {
      render(<ImportErrorsGrid rows={rows} />);
      await userEvent.click(
        screen.getByRole("button", { name: /exportar errores/i }),
      );
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.anything(),
        "errores_importacion.xlsx",
      );
    });

    it("passes all rows to json_to_sheet", async () => {
      render(<ImportErrorsGrid rows={rows} />);
      await userEvent.click(
        screen.getByRole("button", { name: /exportar errores/i }),
      );
      expect(mockJsonToSheet).toHaveBeenCalledWith(rows, expect.anything());
    });
  });
});
