import React, { forwardRef, useMemo } from "react";
import buildColDefs from "./HeatManagementManualGrid.definitions";
import { AthleteForProgression, HeatMode } from "@/types";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";

interface HeatManagementManualGridProps {
  mode: HeatMode;
  athletes: AthleteForProgression[];
}

const HeatManagementManualGrid = forwardRef<
  AgGridReact<AthleteForProgression> | null,
  HeatManagementManualGridProps
>((props, ref) => {
  const { mode, athletes } = props;
  const columnDefs: ColDef<AthleteForProgression>[] = useMemo(
    () => buildColDefs(),
    [],
  );
  return (
    <div className="space-y-3">
      <p className="text-default-600 text-sm">
        Seleccione los atletas que avanzarán a{" "}
        {mode === "create-semifinal" ? "semifinal" : "final"}.
      </p>
      <div className="ag-theme-quartz" style={{ height: 400 }}>
        <AgGridReact
          ref={ref}
          rowData={athletes}
          columnDefs={columnDefs}
          rowSelection="multiple"
          defaultColDef={{ resizable: true }}
        />
      </div>
    </div>
  );
});

HeatManagementManualGrid.displayName = "HeatManagementManualGrid";

export default HeatManagementManualGrid;
