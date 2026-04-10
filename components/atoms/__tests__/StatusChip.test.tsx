import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusChip } from "../StatusChip";

describe("StatusChip", () => {
  it("renders children", () => {
    render(<StatusChip>Aprobado</StatusChip>);
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
  });

  it("renders with custom content", () => {
    render(<StatusChip color="success">Super Juez</StatusChip>);
    expect(screen.getByText("Super Juez")).toBeInTheDocument();
  });
});
