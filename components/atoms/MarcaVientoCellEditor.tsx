"use client";
import { useEffect, useRef, useState } from "react";
import type { CustomCellEditorProps } from "ag-grid-react";
import { formatMarcaInput } from "@/lib/utils/marca";
import { formatVientoInput } from "@/lib/utils/viento";
import type { TipoMarca } from "@/types";

export interface MarcaVientoValue {
  marca: string | null;
  viento: string | null;
}

type Props = CustomCellEditorProps<object, MarcaVientoValue> & {
  tipoMarca: TipoMarca;
};

const MarcaVientoCellEditor = ({
  value,
  onValueChange,
  tipoMarca,
  eventKey,
}: Props) => {
  const marcaRef = useRef<HTMLInputElement>(null);

  const getInitialMarca = (): string => {
    if (eventKey && eventKey.length === 1) {
      if (/\d/.test(eventKey)) return formatMarcaInput("", eventKey, tipoMarca);
      const up = eventKey.toUpperCase();
      if (up === "N" || up === "-") return up;
    }
    return value?.marca ?? "";
  };

  const [marca, setMarca] = useState<string>(getInitialMarca);
  const [viento, setViento] = useState<string>(value?.viento ?? "+0.0");

  useEffect(() => {
    marcaRef.current?.focus();
  }, []);

  useEffect(() => {
    onValueChange({ marca: marca || null, viento: viento || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marca, viento]);

  const handleMarcaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarca(formatMarcaInput(marca, e.target.value, tipoMarca));
  };

  const handleVientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViento(formatVientoInput(viento, e.target.value));
  };

  const stopArrows = (e: React.KeyboardEvent) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.stopPropagation();
    }
  };

  return (
    <div className="flex flex-col justify-center gap-0.5 px-1 w-full h-16">
      <input
        ref={marcaRef}
        value={marca}
        onChange={handleMarcaChange}
        onKeyDown={stopArrows}
        placeholder="marca"
        className="bg-white px-1 border border-slate-200 focus:border-primary rounded outline-none w-full font-mono text-xs"
        maxLength={10}
      />
      <input
        value={viento}
        onChange={handleVientoChange}
        onKeyDown={stopArrows}
        placeholder="+0.0"
        className="bg-white px-1 border border-slate-200 focus:border-primary rounded outline-none w-full font-mono text-xs"
        maxLength={4}
      />
    </div>
  );
};

export default MarcaVientoCellEditor;
