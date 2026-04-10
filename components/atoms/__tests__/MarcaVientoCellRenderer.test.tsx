import { render, screen } from "@testing-library/react";
import MarcaVientoCellRenderer from "../MarcaVientoCellRenderer";
import { describe, expect, it } from "vitest";
import { CustomCellRendererProps } from "ag-grid-react";

// Minimal stub for CustomCellRendererProps
const baseProps = {
  value: undefined,
  data: {},
  node: {} as never,
  colDef: {} as never,
  column: {} as never,
  api: {} as never,
  context: undefined,
  rowIndex: 0,
  eGridCell: {} as never,
  eParentOfValue: {} as never,
  getValue: () => undefined,
  formatValue: (v: unknown) => String(v),
  refreshCell: () => {},
  registerRowDragger: () => {},
  setTooltip: () => {},
} as unknown as CustomCellRendererProps;

describe("MarcaVientoCellRenderer", () => {
  it("renders dash when no value", () => {
    render(<MarcaVientoCellRenderer {...baseProps} value={undefined} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders dash when marca and viento are both null", () => {
    render(
      <MarcaVientoCellRenderer
        {...baseProps}
        value={{ marca: null, viento: null }}
      />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders marca when present", () => {
    render(
      <MarcaVientoCellRenderer
        {...baseProps}
        value={{ marca: "10.45", viento: null }}
      />,
    );
    expect(screen.getByText("10.45")).toBeInTheDocument();
  });

  it("renders both marca and viento when present", () => {
    render(
      <MarcaVientoCellRenderer
        {...baseProps}
        value={{ marca: "7.89", viento: "+1.2" }}
      />,
    );
    expect(screen.getByText("7.89")).toBeInTheDocument();
    expect(screen.getByText("+1.2")).toBeInTheDocument();
  });

  it("does not render viento span when viento is null", () => {
    render(
      <MarcaVientoCellRenderer
        {...baseProps}
        value={{ marca: "10.45", viento: null }}
      />,
    );
    expect(screen.queryByText("+")).not.toBeInTheDocument();
  });
});
