import { render, screen } from "@testing-library/react";
import { ErrorText } from "../ErrorText";
import { describe, expect, it } from "vitest";

describe("ErrorText", () => {
  it("renders the message", () => {
    render(<ErrorText message="Algo salió mal" />);
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
  });

  it("applies danger text style", () => {
    render(<ErrorText message="Error" />);
    expect(screen.getByText("Error")).toHaveClass("text-danger");
  });
});
