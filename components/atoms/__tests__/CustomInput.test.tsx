import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CustomInput from "../CustomInput";

describe("CustomInput", () => {
  it("renders the label", () => {
    render(<CustomInput label="DNI" onValueChange={vi.fn()} />);
    expect(screen.getByText("DNI")).toBeInTheDocument();
  });

  it("label is linked to input via htmlFor/id", () => {
    render(<CustomInput label="Nombre" onValueChange={vi.fn()} />);
    const input = screen.getByLabelText("Nombre");
    expect(input).toBeInTheDocument();
  });

  it("calls onValueChange with typed value", async () => {
    const onValueChange = vi.fn();
    render(<CustomInput label="DNI" onValueChange={onValueChange} />);
    await userEvent.type(screen.getByLabelText("DNI"), "123");
    expect(onValueChange).toHaveBeenCalledWith("1");
    expect(onValueChange).toHaveBeenCalledWith("12");
    expect(onValueChange).toHaveBeenCalledWith("123");
  });

  it("forwards extra props like placeholder", () => {
    render(
      <CustomInput
        label="DNI"
        onValueChange={vi.fn()}
        placeholder="12345678"
      />,
    );
    expect(screen.getByPlaceholderText("12345678")).toBeInTheDocument();
  });
});
