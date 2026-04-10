import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubmitButton } from "../SubmitButton";

describe("SubmitButton", () => {
  it("renders children", () => {
    render(<SubmitButton>Guardar</SubmitButton>);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("defaults to type=submit", () => {
    render(<SubmitButton>Enviar</SubmitButton>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("accepts type=button", () => {
    render(<SubmitButton type="button">Enviar</SubmitButton>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("calls onPress when clicked", async () => {
    const onPress = vi.fn();
    render(
      <SubmitButton type="button" onPress={onPress}>
        Click
      </SubmitButton>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows spinner when submitting", () => {
    render(<SubmitButton submitting>Guardando</SubmitButton>);
    expect(document.querySelector("[data-slot='spinner']")).toBeInTheDocument();
  });
});
