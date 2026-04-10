import { describe, it, expect } from "vitest";
import { formatMarcaInput, isMarcaValid } from "../marca";

describe("formatMarcaInput", () => {
  describe("SPRINT (DD.DD, maxLen=5)", () => {
    it("builds mark digit by digit", () => {
      // dot at pos 2 only appears once the digit after it is typed
      expect(formatMarcaInput("", "1", "SPRINT")).toBe("1");
      expect(formatMarcaInput("1", "12", "SPRINT")).toBe("12");
      expect(formatMarcaInput("12", "123", "SPRINT")).toBe("12.3");
      expect(formatMarcaInput("12.3", "12.34", "SPRINT")).toBe("12.34");
    });

    it("auto-inserts dot when third digit is typed", () => {
      expect(formatMarcaInput("12", "123", "SPRINT")).toBe("12.3");
    });

    it("clears on empty string", () => {
      expect(formatMarcaInput("12.34", "", "SPRINT")).toBe("");
    });

    it("handles backspace over dot (removes preceding digit too)", () => {
      // prev="12.3", user deletes to "12." → newLen=3, dots includes 2 not 3, returns "12."
      // prev="12.", user deletes to "12" → newLen=2, dots includes 2, returns "1"
      expect(formatMarcaInput("12.", "12", "SPRINT")).toBe("1");
    });

    it("rejects non-digit input", () => {
      expect(formatMarcaInput("12.", "12.a", "SPRINT")).toBe("12.");
    });

    it("accepts N (nulo)", () => {
      expect(formatMarcaInput("", "N", "SPRINT")).toBe("N");
      expect(formatMarcaInput("", "n", "SPRINT")).toBe("N");
    });

    it("accepts - (pasada)", () => {
      expect(formatMarcaInput("", "-", "SPRINT")).toBe("-");
    });

    it("resets from special value N when typing digits", () => {
      // prev="N", next="N1" → upper="N1" not special, prev is "N" so recurse with ("", "N1", tipo)
      // upper of "N1" is "N1" — not "N" or "-", so falls through to digit logic
      // digits = "N1".replace(/\./g,"") = "N1", fails /^\d*$/ → returns prev=""
      expect(formatMarcaInput("N", "N1", "SPRINT")).toBe("");
    });

    it("resets from special value - when typing digits", () => {
      // prev="-", next="-1" → upper="-1" not special, prev is "-" so recurse with ("", "-1", tipo)
      // upper of "-1" is "-1" — not "N" or "-", digits="-1", fails /^\d*$/ → returns ""
      expect(formatMarcaInput("-", "-1", "SPRINT")).toBe("");
    });
  });

  describe("LARGO (D.DD, maxLen=4)", () => {
    it("dot at position 1 appears when second digit is typed", () => {
      // dots=[1]: pos0→digit, pos1→dot (only if di<len), pos2→digit
      // typing "7": digits="7", pos0→"7", pos1→dot but di=1===len=1 → loop exits → "7"
      expect(formatMarcaInput("", "7", "LARGO")).toBe("7");
      // typing "78": digits="78", pos0→"7", pos1→dot, pos2→"8" → "7.8"
      expect(formatMarcaInput("7", "78", "LARGO")).toBe("7.8");
    });

    it("builds full mark", () => {
      expect(formatMarcaInput("7.8", "7.89", "LARGO")).toBe("7.89");
    });
  });

  describe("MEDIO_FONDO (D.DD.DD, maxLen=7)", () => {
    it("inserts dots at correct positions", () => {
      // dots=[1,4]
      // "4": digits="4", pos0→"4", pos1→dot but di=1===len=1 → "4"
      expect(formatMarcaInput("", "4", "MEDIO_FONDO")).toBe("4");
      // "41": digits="41", pos0→"4", pos1→dot, pos2→"1" → "4.1"
      expect(formatMarcaInput("4", "41", "MEDIO_FONDO")).toBe("4.1");
      expect(formatMarcaInput("4.1", "4.12", "MEDIO_FONDO")).toBe("4.12");
      // "4.123": digits="4123", pos0→"4", pos1→dot, pos2→"1", pos3→"2", pos4→dot, pos5→"3" → "4.12.3"
      expect(formatMarcaInput("4.12", "4.123", "MEDIO_FONDO")).toBe("4.12.3");
      expect(formatMarcaInput("4.12.3", "4.12.34", "MEDIO_FONDO")).toBe(
        "4.12.34",
      );
    });
  });

  describe("PUNTOS (digits only, maxLen=5)", () => {
    it("accepts digits without dots", () => {
      expect(formatMarcaInput("", "1", "PUNTOS")).toBe("1");
      expect(formatMarcaInput("1", "12", "PUNTOS")).toBe("12");
      expect(formatMarcaInput("12", "123", "PUNTOS")).toBe("123");
    });
  });
});

describe("isMarcaValid", () => {
  it("validates SPRINT marks", () => {
    expect(isMarcaValid("12.34", "SPRINT")).toBe(true);
    expect(isMarcaValid("9.99", "SPRINT")).toBe(false); // wrong length (4 vs 5)
    expect(isMarcaValid("12.3", "SPRINT")).toBe(false);
    expect(isMarcaValid("", "SPRINT")).toBe(false);
  });

  it("validates LARGO marks", () => {
    expect(isMarcaValid("7.89", "LARGO")).toBe(true);
    expect(isMarcaValid("7.8", "LARGO")).toBe(false);
  });

  it("accepts special values N and -", () => {
    expect(isMarcaValid("N", "SPRINT")).toBe(true);
    expect(isMarcaValid("-", "SPRINT")).toBe(true);
  });

  it("rejects marks with wrong dot positions", () => {
    expect(isMarcaValid("1234.", "SPRINT")).toBe(false);
  });

  it("validates PUNTOS (digits only)", () => {
    expect(isMarcaValid("12345", "PUNTOS")).toBe(true);
    expect(isMarcaValid("1234.", "PUNTOS")).toBe(false);
  });

  it("validates MEDIO_FONDO marks", () => {
    expect(isMarcaValid("4.12.34", "MEDIO_FONDO")).toBe(true);
    expect(isMarcaValid("4.12.3", "MEDIO_FONDO")).toBe(false);
  });
});
