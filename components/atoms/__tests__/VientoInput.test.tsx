import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VientoInput } from "../VientoInput";

describe("VientoInput", () => {
  it("renders with default label", () => {
    render(<VientoInput value="+0.0" onChange={vi.fn()} />);
    expect(screen.getByText("Viento")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(
      <VientoInput value="+0.0" onChange={vi.fn()} label="Viento carrera" />,
    );
    expect(screen.getByText("Viento carrera")).toBeInTheDocument();
  });

  it("shows current value in input", () => {
    render(<VientoInput value="+1.5" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("+1.5");
  });

  it("calls onChange with formatted value", async () => {
    const onChange = vi.fn();
    render(<VientoInput value="+" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "3");
    expect(onChange).toHaveBeenCalledWith("+3.");
  });

  it("shows error when value is 4 chars and invalid", () => {
    render(<VientoInput value="+a.b" onChange={vi.fn()} />);
    expect(screen.getByText("-9.9 a +10.0")).toBeInTheDocument();
  });

  it("does not show error for valid 4-char value", () => {
    render(<VientoInput value="+1.5" onChange={vi.fn()} />);
    expect(screen.queryByText("-9.9 a +10.0")).not.toBeInTheDocument();
  });

  it("does not show error when value is shorter than 4 chars", () => {
    render(<VientoInput value="+1." onChange={vi.fn()} />);
    expect(screen.queryByText("-9.9 a +10.0")).not.toBeInTheDocument();
  });
});
