"use client";
import { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import * as XLSX from "xlsx";
import { Button } from "@heroui/react";
import type { FilaFallida } from "@/types";

ModuleRegistry.registerModules([AllCommunityModule]);

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

  const handleExport = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(rows, {
      header: ["fila", "dni", "nombre", "prueba", "categoria", "motivo"],
    });
    ws["!cols"] = [8, 14, 30, 20, 16, 50].map((wch) => ({ wch }));
    // Rename headers to Spanish
    ["Fila", "DNI", "Nombre", "Prueba", "Categoría", "Motivo"].forEach(
      (label, i) => {
        const cell = XLSX.utils.encode_cell({ r: 0, c: i });
        if (ws[cell]) ws[cell].v = label;
      },
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errores");
    XLSX.writeFile(wb, "errores_importacion.xlsx");
  }, [rows]);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" onPress={handleExport}>
          Exportar errores (.xlsx)
        </Button>
      </div>
      <div className="ag-theme-quartz" style={{ height: 300 }}>
        <AgGridReact rowData={rows} columnDefs={colDefs} />
      </div>
    </div>
  );
}
