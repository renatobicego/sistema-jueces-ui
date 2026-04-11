"use client";
import { Button } from "@heroui/react";
import { useState } from "react";

interface AlturaInputProps {
  onAdd: (altura: string) => void;
  maxAltura?: number;
}

export default function AlturaInput({
  onAdd,
  maxAltura = 0,
}: AlturaInputProps) {
  const [value, setValue] = useState("");

  const formatAltura = (prev: string, next: string): string => {
    if (next === "") return "";
    // Strip dots
    const digits = next.replace(/\./g, "");
    // Only digits allowed
    if (!/^\d*$/.test(digits)) return prev;
    // Max 3 digits: D.DD
    if (digits.length > 3) return prev;
    // Insert dot after first digit
    if (digits.length === 0) return "";
    if (digits.length === 1) return digits;
    return `${digits[0]}.${digits.slice(1)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatAltura(value, e.target.value));
  };

  const handleAdd = () => {
    if (value.length !== 4) return;

    const numValue = parseFloat(value);
    if (numValue <= maxAltura) {
      alert(`La altura debe ser mayor a ${maxAltura.toFixed(2)}`);
      return;
    }

    onAdd(value);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="ej: 1.80"
        className="px-2 py-1 border border-slate-300 focus:border-primary rounded outline-none w-28 font-mono text-sm"
        maxLength={4}
      />
      <Button
        onClick={handleAdd}
        variant="primary"
        isIconOnly
        isDisabled={value.length !== 4}
        type="button"
      >
        +
      </Button>
    </div>
  );
}
