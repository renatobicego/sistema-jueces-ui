import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MarcaVientoCellEditor from "../MarcaVientoCellEditor";
import type { CustomCellEditorProps } from "ag-grid-react";
import type { MarcaVientoValue } from "../MarcaVientoCellEditor";

const baseProps = {
  value: { marca: null, viento: null },
  onValueChange: vi.fn(),
  tipoMarca: "DISTANCIA",
  eventKey: null,
  api: {} as never,
  column: {} as never,
  colDef: {} as never,
  node: {} as never,
  data: {},
  rowIndex: 0,
  context: undefined,
  eGridCell: {} as never,
  stopEditing: vi.fn(),
  parseValue: (v: unknown) => v,
  formatValue: (v: unknown) => String(v),
} as unknown as CustomCellEditorProps<object, MarcaVientoValue> & {
  tipoMarca: "DISTANCIA";
};

describe("MarcaVientoCellEditor", () => {
  it("renders two inputs (marca and viento)", () => {
    render(<MarcaVientoCellEditor {...baseProps} />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);
  });

  it("initializes marca from value", () => {
    render(
      <MarcaVientoCellEditor
        {...baseProps}
        value={{ marca: "12.34", viento: "+1.2" }}
      />,
    );
    const [marcaInput, vientoInput] = screen.getAllByRole("textbox");
    expect(marcaInput).toHaveValue("12.34");
    expect(vientoInput).toHaveValue("+1.2");
  });

  it("defaults viento to +0.0 when null", () => {
    render(
      <MarcaVientoCellEditor
        {...baseProps}
        value={{ marca: null, viento: null }}
      />,
    );
    const [, vientoInput] = screen.getAllByRole("textbox");
    expect(vientoInput).toHaveValue("+0.0");
  });

  it("calls onValueChange when marca changes", () => {
    const onValueChange = vi.fn();
    render(
      <MarcaVientoCellEditor
        {...baseProps}
        value={{ marca: "12", viento: "+0.0" }}
        onValueChange={onValueChange}
      />,
    );
    const [marcaInput] = screen.getAllByRole("textbox");
    fireEvent.change(marcaInput, { target: { value: "123" } });
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ marca: "12.3" }),
    );
  });

  it("calls onValueChange when viento changes", () => {
    const onValueChange = vi.fn();
    render(
      <MarcaVientoCellEditor
        {...baseProps}
        value={{ marca: "12.34", viento: "+" }}
        onValueChange={onValueChange}
      />,
    );
    const [, vientoInput] = screen.getAllByRole("textbox");
    fireEvent.change(vientoInput, { target: { value: "+1" } });
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ viento: "+1." }),
    );
  });
});
