"use client";
import { useMemo, useState } from "react";
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
  const [pendingAssignments, setPendingAssignments] = useState<
    Record<string, string[]>
  >({});

  const colDefs = useMemo(
    () =>
      buildJuecesColDefs(
        pruebas,
        pendingAssignments,
        setPendingAssignments,
        onAprobar,
        onEliminar,
      ),
    [pruebas, pendingAssignments, onAprobar, onEliminar],
  );

  return (
    <div className="ag-theme-quartz" style={{ height: 400 }}>
      <AgGridReact
        rowData={jueces}
        columnDefs={colDefs}
        rowHeight={52}
        defaultColDef={{ resizable: true }}
      />
    </div>
  );
}
