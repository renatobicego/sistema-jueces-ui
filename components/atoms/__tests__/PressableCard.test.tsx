import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, expect, it } from "vitest";
import { PressableCard } from "../PressableCard";

describe("PressableCard", () => {
  it("renders children", () => {
    render(<PressableCard>Contenido</PressableCard>);
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("renders as a button when isPressable and onPress are provided", () => {
    render(
      <PressableCard isPressable onPress={vi.fn()}>
        Click me
      </PressableCard>,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onPress when clicked", async () => {
    const onPress = vi.fn();
    render(
      <PressableCard isPressable onPress={onPress}>
        Click me
      </PressableCard>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not render a button when isPressable is false", () => {
    render(<PressableCard>Static</PressableCard>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
