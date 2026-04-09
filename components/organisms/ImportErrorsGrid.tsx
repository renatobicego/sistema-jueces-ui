"use client";
import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

interface FilaFallida {
  fila: number;
  dni: string;
  nombre: string;
  prueba: string;
  categoria: string;
  motivo: string;
}

export default function ImportErrorsGrid({ rows }: { rows: FilaFallida[] }) {
  const colDefs = useMemo<ColDef<FilaFallida>[]>(
    () => [
      { field: "fila", headerName: "Fila", width: 70 },
      { field: "dni", headerName: "DNI", width: 110 },
      { field: "nombre", headerName: "Nombre", flex: 2 },
      { field: "prueba", headerName: "Prueba", flex: 1 },
      { field: "categoria", headerName: "Categoría", flex: 1 },
      { field: "motivo", headerName: "Motivo", flex: 3 },
    ],
    [],
  );

  return (
    <div className="ag-theme-quartz" style={{ height: 300 }}>
      <AgGridReact rowData={rows} columnDefs={colDefs} />
    </div>
  );
}
