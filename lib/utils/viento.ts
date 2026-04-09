/**
 * Formats a keystroke-by-keystroke viento string.
 * Format: [+/-][digit][.][digit]  e.g. "+1.2", "-9.9"
 *
 * Rules:
 * - pos 0: must be + or -
 * - pos 1: digit 0-9 (auto-inserts . after)
 * - pos 2: always "." (auto-inserted)
 * - pos 3: digit 0-9
 *
 * Returns the sanitized string to display.
 */
export function formatVientoInput(prev: string, next: string): string {
  // Deletion: next is shorter than prev
  if (next.length < prev.length) {
    // If prev was "+1.2" and user deleted last char, go to "+1" (skip the dot)
    if (prev.length === 4 && next === prev.slice(0, 3)) {
      // They deleted the last digit — also remove the dot
      return prev.slice(0, 2);
    }
    // Otherwise just return next as-is (handles deleting sign or first digit)
    return next;
  }

  // Allow clearing or just a sign
  if (next === "" || next === "+" || next === "-") return next;

  // Strip any dots the user may have typed (we insert it ourselves)
  const stripped = next.replace(/\./g, "");

  // pos 0: sign
  const sign = stripped[0];
  if (sign !== "+" && sign !== "-") return prev;

  // pos 1: first digit
  const d1 = stripped[1];
  if (d1 === undefined) return sign;
  if (!/\d/.test(d1)) return sign;

  // pos 2: second digit (after the auto dot)
  const d2 = stripped[2];
  if (d2 === undefined) return `${sign}${d1}.`;
  if (!/\d/.test(d2)) return `${sign}${d1}.`;

  return `${sign}${d1}.${d2}`;
}

export function isVientoValid(v: string): boolean {
  if (!/^[+-]\d\.\d$/.test(v)) return false;
  const num = parseFloat(v);
  return num >= -9.9 && num <= 10.0;
}
