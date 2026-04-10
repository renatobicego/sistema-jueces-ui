import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingCenter } from "../LoadingCenter";

describe("LoadingCenter", () => {
  it("renders a spinner", () => {
    render(<LoadingCenter />);
    // HeroUI Spinner renders with data-slot="spinner"
    expect(document.querySelector("[data-slot='spinner']")).toBeInTheDocument();
  });
});
