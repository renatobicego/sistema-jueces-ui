"use client";
import { useId } from "react";
import { Label } from "@heroui/react";
import { formatVientoInput, isVientoValid } from "@/lib/utils/viento";

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  className?: string;
}

export function VientoInput({
  value,
  onChange,
  label = "Viento",
  className,
}: Props) {
  const id = useId();
  const isValid = isVientoValid(value);
  const showError = value.length === 4 && !isValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(formatVientoInput(value, e.target.value));
  };

  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={handleChange}
        placeholder="+0.0"
        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-[90px] font-mono text-sm"
      />
      {showError && <span className="text-red-500 text-xs">-9.9 a +10.0</span>}
    </div>
  );
}
