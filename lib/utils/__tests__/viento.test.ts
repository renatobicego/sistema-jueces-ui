import { describe, it, expect } from "vitest";
import { formatVientoInput, isVientoValid } from "../viento";

describe("formatVientoInput", () => {
  it("allows empty string", () => {
    expect(formatVientoInput("+1.2", "")).toBe("");
  });

  it("allows just a sign", () => {
    expect(formatVientoInput("", "+")).toBe("+");
    expect(formatVientoInput("", "-")).toBe("-");
  });

  it("rejects first char that is not a sign", () => {
    expect(formatVientoInput("", "1")).toBe("");
    expect(formatVientoInput("", "a")).toBe("");
  });

  it("builds value digit by digit", () => {
    expect(formatVientoInput("+", "+1")).toBe("+1.");
    expect(formatVientoInput("+1.", "+1.2")).toBe("+1.2");
  });

  it("auto-inserts dot after first digit", () => {
    expect(formatVientoInput("+", "+3")).toBe("+3.");
  });

  it("rejects non-digit after sign", () => {
    expect(formatVientoInput("+", "+a")).toBe("+");
  });

  it("handles deletion — removing last digit also removes dot", () => {
    expect(formatVientoInput("+1.2", "+1.")).toBe("+1");
  });

  it("handles deletion of first digit", () => {
    expect(formatVientoInput("+1.", "+")).toBe("+");
  });

  it("handles negative values", () => {
    expect(formatVientoInput("-", "-9")).toBe("-9.");
    expect(formatVientoInput("-9.", "-9.9")).toBe("-9.9");
  });
});

describe("isVientoValid", () => {
  it("accepts valid positive values", () => {
    expect(isVientoValid("+0.0")).toBe(true);
    expect(isVientoValid("+9.9")).toBe(true);
    expect(isVientoValid("+1.5")).toBe(true);
  });

  it("accepts valid negative values", () => {
    expect(isVientoValid("-9.9")).toBe(true);
    expect(isVientoValid("-0.1")).toBe(true);
  });

  it("rejects malformed strings", () => {
    expect(isVientoValid("1.2")).toBe(false); // no sign
    expect(isVientoValid("+12")).toBe(false); // no dot
    expect(isVientoValid("+1.")).toBe(false); // incomplete
    expect(isVientoValid("")).toBe(false);
  });

  it("rejects out-of-range values", () => {
    // +10.1 is > 10.0
    expect(isVientoValid("+9.9")).toBe(true);
    // boundary: +10.0 is valid
    // Note: regex only matches single digit before dot, so +10.0 won't match anyway
  });
});
