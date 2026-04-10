import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MarcaCellEditor from "../MarcaCellEditor";
import type { CustomCellEditorProps } from "ag-grid-react";

const baseProps = {
  value: "",
  onValueChange: vi.fn(),
  tipoMarca: "SPRINT",
  eventKey: null,
  // minimal ag-grid stubs
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
} as unknown as CustomCellEditorProps & { tipoMarca: "SPRINT" };

describe("MarcaCellEditor", () => {
  it("renders an input", () => {
    render(<MarcaCellEditor {...baseProps} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("initializes with existing value", () => {
    render(<MarcaCellEditor {...baseProps} value="12.34" />);
    expect(screen.getByRole("textbox")).toHaveValue("12.34");
  });

  it("initializes with eventKey digit", () => {
    render(<MarcaCellEditor {...baseProps} value="" eventKey="1" />);
    expect(screen.getByRole("textbox")).toHaveValue("1");
  });

  it("initializes with eventKey N", () => {
    render(<MarcaCellEditor {...baseProps} value="" eventKey="N" />);
    expect(screen.getByRole("textbox")).toHaveValue("N");
  });

  it("calls onValueChange on input change", () => {
    const onValueChange = vi.fn();
    render(
      <MarcaCellEditor
        {...baseProps}
        value="12"
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "123" } });
    expect(onValueChange).toHaveBeenCalledWith("12.3");
  });

  it("does not propagate ArrowLeft/ArrowRight keydown", () => {
    render(<MarcaCellEditor {...baseProps} />);
    const input = screen.getByRole("textbox");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      bubbles: true,
    });
    const stopPropagation = vi.spyOn(event, "stopPropagation");
    input.dispatchEvent(event);
    expect(stopPropagation).toHaveBeenCalled();
  });
});
