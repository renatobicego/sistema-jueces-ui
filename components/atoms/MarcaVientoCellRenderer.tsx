"use client";
import type { CustomCellRendererProps } from "ag-grid-react";
import type { MarcaVientoValue } from "./MarcaVientoCellEditor";

const MarcaVientoCellRenderer = ({
  value,
}: CustomCellRendererProps<object, MarcaVientoValue>) => {
  if (!value?.marca && !value?.viento)
    return <span className="text-slate-300">—</span>;
  return (
    <div className="flex flex-col justify-center h-16 leading-tight">
      <span className="font-mono text-xs">{value?.marca ?? "—"}</span>
      {value?.viento && (
        <span className="font-mono text-slate-400 text-xs">{value.viento}</span>
      )}
    </div>
  );
};

export default MarcaVientoCellRenderer;
