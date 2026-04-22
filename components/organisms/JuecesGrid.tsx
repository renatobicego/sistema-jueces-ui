"use client";
import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { JuecesGridProps } from "@/types";
import { buildJuecesColDefs } from "./JuecesGrid.definitions";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function JuecesGrid({
  jueces,
  pruebas,
  onAprobar,
  onEliminar,
}: JuecesGridProps) {
  const colDefs = useMemo(
    () => buildJuecesColDefs(pruebas, onAprobar, onEliminar),
    [pruebas, onAprobar, onEliminar],
  );

  // Initialize row data with pendingPruebasAsignadas field
  const rowData = useMemo(
    () =>
      jueces.map((juez) => ({
        ...juez,
        pendingPruebasAsignadas: juez.pruebasAsignadas,
      })),
    [jueces],
  );

  return (
    <div className="ag-theme-quartz" style={{ height: 400 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        rowHeight={52}
        defaultColDef={{ resizable: true }}
      />
    </div>
  );
}
