"use client";
import { useEffect, useRef, useState } from "react";
import type { CustomCellEditorProps } from "ag-grid-react";
import { formatMarcaInput } from "@/lib/utils/marca";
import type { TipoMarca } from "@/types";

type Props = CustomCellEditorProps & { tipoMarca: TipoMarca };

const MarcaCellEditor = ({
  value,
  onValueChange,
  tipoMarca,
  eventKey,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const getInitial = (): string => {
    if (eventKey && eventKey.length === 1) {
      if (/\d/.test(eventKey)) return formatMarcaInput("", eventKey, tipoMarca);
      const up = eventKey.toUpperCase();
      if (up === "N" || up === "-") return up;
    }
    return value ?? "";
  };

  const [current, setCurrent] = useState<string>(getInitial);

  useEffect(() => {
    onValueChange(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = formatMarcaInput(current, e.target.value, tipoMarca);
    setCurrent(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent grid navigation on arrow keys so cursor moves inside input
    if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.stopPropagation();
    }
  };

  return (
    <input
      ref={inputRef}
      value={current}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="bg-white px-2 border-0 outline-none w-full h-full font-mono text-sm"
      maxLength={10}
    />
  );
};

export default MarcaCellEditor;
