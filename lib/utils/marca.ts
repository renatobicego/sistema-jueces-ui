import type { TipoMarca } from "@/types";

/**
 * Describes the dot positions and max length for each TipoMarca.
 * dots: array of 0-based positions (in the final string) where dots are auto-inserted.
 * maxLen: total length of the complete mark string.
 *
 * Examples:
 *   SPRINT:      DD.DD       dots=[2]      maxLen=5
 *   DISTANCIA:   DD.DD       dots=[2]      maxLen=5
 *   LARGO:       D.DD        dots=[1]      maxLen=4
 *   ALTURA:      D.DD        dots=[1]      maxLen=4
 *   MEDIO_FONDO: D.DD.DD     dots=[1,4]    maxLen=7
 *   FONDO:       DD.DD.DD    dots=[2,5]    maxLen=8
 *   MARCHA:      DD.DD.DD    dots=[2,5]    maxLen=8  (simplified to most common)
 *   PUNTOS:      digits only dots=[]       maxLen=5
 */
const MARCA_FORMAT: Record<TipoMarca, { dots: number[]; maxLen: number }> = {
  SPRINT: { dots: [2], maxLen: 5 },
  DISTANCIA: { dots: [2], maxLen: 5 },
  LARGO: { dots: [1], maxLen: 4 },
  ALTURA: { dots: [1], maxLen: 4 },
  MEDIO_FONDO: { dots: [1, 4], maxLen: 7 },
  FONDO: { dots: [2, 5], maxLen: 8 },
  MARCHA: { dots: [2, 5], maxLen: 8 },
  PUNTOS: { dots: [], maxLen: 5 },
};

/**
 * Formats a keystroke-by-keystroke marca string for a given TipoMarca.
 * Dots are auto-inserted at the correct positions.
 * Non-digit characters (except auto-dots) are rejected.
 * Backspace over a dot also removes the preceding digit.
 */
export function formatMarcaInput(
  prev: string,
  next: string,
  tipo: TipoMarca,
): string {
  const fmt = MARCA_FORMAT[tipo];
  if (!fmt) return next;

  // Allow clearing
  if (next === "") return "";

  // Special single-char values for serie attempts: N (nulo) and - (pasada)
  const upper = next.toUpperCase();
  if (upper === "N" || upper === "-") return upper;

  // If prev was a special value and user types more, start fresh
  if (prev === "N" || prev === "-") {
    return formatMarcaInput("", next, tipo);
  }

  // Deletion
  if (next.length < prev.length) {
    const newLen = next.length;
    if (fmt.dots.includes(newLen)) {
      return next.slice(0, newLen - 1);
    }
    return next;
  }

  // Strip all dots from what the user typed — we manage them
  const digits = next.replace(/\./g, "");

  // Reject non-digits
  if (!/^\d*$/.test(digits)) return prev;

  // Rebuild the string inserting dots at the right positions
  let result = "";
  let di = 0;
  for (let pos = 0; pos < fmt.maxLen && di < digits.length; pos++) {
    if (fmt.dots.includes(pos)) {
      result += ".";
    } else {
      result += digits[di++];
    }
  }

  return result;
}

export const MARCA_FORMAT_HINT: Record<TipoMarca, string> = {
  SPRINT: "DD.DD — ej: 10.45",
  DISTANCIA: "DD.DD — ej: 10.45",
  LARGO: "D.DD — ej: 7.85",
  ALTURA: "D.DD — ej: 2.10",
  MEDIO_FONDO: "D.DD.DD — ej: 3.45.67",
  FONDO: "DD.DD.DD — ej: 14.23.45",
  MARCHA: "DD.DD.DD — ej: 20.15.30",
  PUNTOS: "hasta 5 dígitos — ej: 8500",
};

export function isMarcaValid(v: string, tipo: TipoMarca): boolean {
  if (!v) return false;
  if (v === "N" || v === "-") return true;
  const fmt = MARCA_FORMAT[tipo];
  if (!fmt) return false;
  if (v.length !== fmt.maxLen) return false;
  for (let i = 0; i < v.length; i++) {
    if (fmt.dots.includes(i)) {
      if (v[i] !== ".") return false;
    } else {
      if (!/\d/.test(v[i])) return false;
    }
  }
  return true;
}
