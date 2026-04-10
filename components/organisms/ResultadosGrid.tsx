"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { ColDef, GridApi } from "ag-grid-community";
import { juecesApi } from "@/lib/axios";
import { toast } from "@heroui/react";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { VientoInput } from "@/components/atoms/VientoInput";
import { formatVientoInput } from "@/lib/utils/viento";
import { useAuthStore } from "@/store/authStore";
import type { GridRow, ResultadosGridProps } from "@/types";
import { toGridRow } from "@/lib/utils/grid";
import { buildColDefs } from "./ResultadosGrid.definitions";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ResultadosGrid({
  atletas,
  config,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resultadoId: _resultadoId,
  pruebaId,
  categoriaId,
  sexo,
  onSaved,
}: ResultadosGridProps) {
  const gridRef = useRef<AgGridReact<GridRow>>(null);
  const [vientoGlobal, setVientoGlobal] = useState("+0.0");
  const [saving, setSaving] = useState(false);
  const esSuperJuez = useAuthStore((s) => s.juezSession?.esSuperJuez ?? false);

  const handleVientoChange = (next: string) => {
    setVientoGlobal(formatVientoInput(vientoGlobal, next));
  };

  const rowData = useMemo(() => atletas.map(toGridRow), [atletas]);

  const colDefs = useMemo<ColDef<GridRow>[]>(
    () => buildColDefs(config, esSuperJuez),
    [config, esSuperJuez],
  );

  const handleSaveAll = useCallback(async () => {
    const api: GridApi<GridRow> | undefined = gridRef.current?.api;
    if (!api) return;

    const rows: GridRow[] = [];
    api.forEachNode((node: { data?: GridRow }) => {
      if (node.data) rows.push(node.data);
    });

    const resultados = rows.map((row) => {
      const base = {
        pruebaAtletaId: row.pruebaAtletaId,
        atletaId: row.atleta._id,
        pruebaId,
        categoriaId,
        sexo,
        observacion: row._observacion || undefined,
        ...(esSuperJuez &&
          row._manualFinalMark && {
            marcaPersonal: row._marca,
            viento: row._viento,
          }),
      };

      if (config?.tipoIntentos === "serie") {
        return {
          ...base,
          intentosSerie: row.resultadoAtleta?.intentosSerie ?? [],
        };
      }
      if (config?.tipoIntentos === "altura") {
        return {
          ...base,
          intentosAltura: row.resultadoAtleta?.intentosAltura ?? [],
        };
      }
      return {
        ...base,
        marca: row._marca || undefined,
        viento: config?.tieneViento ? vientoGlobal : undefined,
      };
    });

    setSaving(true);
    try {
      const { data } = await juecesApi.post("/jueces/resultados/batch", {
        resultados,
      });
      toast.success(
        `Guardado: ${data.saved?.length ?? 0} — Errores: ${data.errors?.length ?? 0}`,
      );
      onSaved();
    } catch {
      toast.danger("Error al guardar.");
    } finally {
      setSaving(false);
    }
  }, [
    pruebaId,
    categoriaId,
    sexo,
    esSuperJuez,
    config?.tipoIntentos,
    config?.tieneViento,
    vientoGlobal,
    onSaved,
  ]);

  return (
    <div className="space-y-3 pt-2">
      {config?.tieneViento && config.tipoIntentos === "ninguno" && (
        <VientoInput
          label="Viento de la carrera"
          value={vientoGlobal}
          onChange={handleVientoChange}
        />
      )}

      <div className="ag-theme-quartz" style={{ height: 420 }}>
        <AgGridReact<GridRow>
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          rowHeight={44}
          defaultColDef={{ resizable: true }}
          stopEditingWhenCellsLoseFocus
          singleClickEdit
        />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton
          type="button"
          variant="primary"
          submitting={saving}
          fullWidth={false}
          onPress={handleSaveAll}
        >
          Guardar todo
        </SubmitButton>
      </div>
    </div>
  );
}
