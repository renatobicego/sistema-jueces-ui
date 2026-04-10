"use client";
import { useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import * as XLSX from "xlsx";
import { Button } from "@heroui/react";
import type { FilaFallida } from "@/types";
import { importErrorsColDefs } from "./ImportErrorsGrid.definitions";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ImportErrorsGrid({ rows }: { rows: FilaFallida[] }) {
  const colDefs = importErrorsColDefs;

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
