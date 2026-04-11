"use client";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { ColDef, GridApi, GridState } from "ag-grid-community";
import { juecesApi } from "@/lib/axios";
import { toast, Modal, Button, useOverlayState } from "@heroui/react";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { VientoInput } from "@/components/atoms/VientoInput";
import AlturaInput from "@/components/atoms/AlturaInput";
import { formatVientoInput } from "@/lib/utils/viento";
import { useAuthStore } from "@/store/authStore";
import type { GridRow, ResultadosGridProps } from "@/types";
import { toGridRow } from "@/lib/utils/grid";
import { buildColDefs } from "./ResultadosGrid.definitions";
import { MARCA_FORMAT_HINT } from "@/lib/utils/marca";
import {
  applySortingByMarcaParcial,
  getRowStyleForNonQualified,
  createBatchPayload,
} from "@/lib/utils/resultadosGrid";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ResultadosGrid({
  atletas,
  config,
  pruebaId,
  categoriaId,
  sexo,
  onSaved,
}: ResultadosGridProps) {
  const gridRef = useRef<AgGridReact<GridRow>>(null);
  const [vientoGlobal, setVientoGlobal] = useState("+0.0");
  const [saving, setSaving] = useState(false);
  const [rearmarOrden, setRearmarOrden] = useState(false);
  const [mostrarSoloFinal, setMostrarSoloFinal] = useState(false);
  const esSuperJuez = useAuthStore((s) => s.juezSession?.esSuperJuez ?? false);
  const errorModal = useOverlayState();
  const { open: openErrorModal } = errorModal;
  const [saveErrors, setSaveErrors] = useState<
    { atletaNombre: string; error: string }[]
  >([]);

  const initialState: GridState = useMemo(() => {
    return {
      sort: {
        sortModel: [{ colId: "puesto", sort: "asc", type: "default" }],
      },
      partialColumnState: true,
    };
  }, []);

  const handleVientoChange = (next: string) => {
    setVientoGlobal(formatVientoInput(vientoGlobal, next));
  };

  const rowData = useMemo(() => {
    let rows = atletas.map(toGridRow);

    // Apply filtering if "Mostrar Solo Final" is enabled
    if (mostrarSoloFinal && config?.tipoIntentos === "serie") {
      rows = rows.filter((row) => !!row.resultadoAtleta?.marcaParcial);
    }

    return rows;
  }, [atletas, mostrarSoloFinal, config]);

  // Collect all known alturas across all athletes, sorted numerically
  const [extraAlturas, setExtraAlturas] = useState<string[]>([]);

  const alturas = useMemo(() => {
    if (config?.tipoIntentos !== "altura") return [];
    const set = new Set<string>(extraAlturas);
    for (const row of rowData) {
      for (const ia of row.resultadoAtleta?.intentosAltura ?? []) {
        set.add(ia.altura);
      }
    }
    return Array.from(set).sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [rowData, config, extraAlturas]);

  const handleAddAltura = useCallback((altura: string) => {
    setExtraAlturas((prev) =>
      prev.includes(altura) ? prev : [...prev, altura],
    );
  }, []);

  const colDefs = useMemo<ColDef<GridRow>[]>(
    () => buildColDefs(config, esSuperJuez, alturas),
    [config, esSuperJuez, alturas],
  );

  // Apply sorting via grid API when "Rearmar Orden" changes
  useEffect(() => {
    applySortingByMarcaParcial(gridRef.current?.api, rearmarOrden, config);
  }, [rearmarOrden, config]);

  const handleCalcularPuestos = useCallback(async () => {
    // Prepare batch update with positions
    const resultados = createBatchPayload(
      {
        categoriaId,
        config,
        esSuperJuez,
        pruebaId,
        sexo,
        vientoGlobal,
      },
      { api: gridRef.current?.api, openErrorModal, setSaveErrors },
      true,
    );
    try {
      await juecesApi.post("/jueces/resultados/batch", {
        resultados: resultados?.resultados,
      });
      toast.success("Puestos calculados y guardados");
      await onSaved(); // Refresh data
    } catch {
      toast.danger("Error al guardar puestos");
    }
  }, [
    categoriaId,
    config,
    esSuperJuez,
    pruebaId,
    sexo,
    vientoGlobal,
    openErrorModal,
    onSaved,
  ]);

  const handleSaveAll = useCallback(async () => {
    const api: GridApi<GridRow> | undefined = gridRef.current?.api;
    if (!api) return;

    const resultados = createBatchPayload(
      {
        categoriaId,
        config,
        esSuperJuez,
        pruebaId,
        sexo,
        vientoGlobal,
      },
      { api: gridRef.current?.api, openErrorModal, setSaveErrors },
    );
    if (!resultados?.resultados) return;
    setSaving(true);
    try {
      const { data } = await juecesApi.post("/jueces/resultados/batch", {
        resultados: resultados.resultados,
      });

      const errorCount: number = data.errors?.length ?? 0;

      if (errorCount > 0) {
        const errorDetails = (
          data.errors as { index: number; error: string }[]
        ).map(({ index, error }) => ({
          atletaNombre:
            resultados.rows[index]?.atleta.nombre_apellido ?? `#${index + 1}`,
          error,
        }));
        setSaveErrors(errorDetails);
        openErrorModal();
        toast.warning(
          `Guardado: ${data.saved?.length ?? 0} — Errores: ${errorCount}`,
        );
      } else {
        toast.success(`Guardado: ${data.saved?.length ?? 0}`);
        onSaved();
      }
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
    config,
    vientoGlobal,
    onSaved,
    openErrorModal,
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

      {config?.tipoIntentos === "altura" && (
        <div className="flex items-center gap-2">
          <label className="text-default-600 text-sm">Agregar altura:</label>
          <AlturaInput
            onAdd={handleAddAltura}
            maxAltura={
              alturas.length > 0 ? parseFloat(alturas[alturas.length - 1]) : 0
            }
          />
        </div>
      )}

      {config?.tipoIntentos === "serie" && config.maxIntentos > 3 && (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rearmarOrden}
              onChange={(e) => setRearmarOrden(e.target.checked)}
              className="border-slate-300 rounded focus:ring-primary w-4 h-4 text-primary"
            />
            <span className="text-default-600 text-sm">
              Rearmar Orden para Final
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarSoloFinal}
              onChange={(e) => setMostrarSoloFinal(e.target.checked)}
              className="border-slate-300 rounded focus:ring-primary w-4 h-4 text-primary"
            />
            <span className="text-default-600 text-sm">
              Mostrar Solo Atletas Final
            </span>
          </label>
        </div>
      )}

      {config?.tipoMarca && (
        <p className="text-default-400 text-xs">
          Formato marca:{" "}
          <span className="font-mono">
            {MARCA_FORMAT_HINT[config.tipoMarca]}
          </span>
          {config.tieneViento && (
            <span className="ml-3">
              Viento: <span className="font-mono">±D.D — ej: +1.2</span>
            </span>
          )}
        </p>
      )}

      <div className="ag-theme-quartz" style={{ height: 420 }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          rowHeight={config?.tipoIntentos === "altura" ? 50 : 44}
          defaultColDef={{ resizable: true }}
          stopEditingWhenCellsLoseFocus
          initialState={initialState}
          singleClickEdit
          getRowStyle={(params) => {
            return getRowStyleForNonQualified(
              rearmarOrden,
              config,
              !!params.data?.resultadoAtleta?.marcaParcial,
            );
          }}
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
        <Button
          type="button"
          variant="secondary"
          onPress={handleCalcularPuestos}
        >
          Calcular Puestos
        </Button>
      </div>

      <Modal state={errorModal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>
                  Errores al guardar ({saveErrors.length})
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="mb-2 text-default-500 text-sm">
                  Los siguientes atletas no pudieron guardarse. Los datos se
                  mantienen en la grilla para que puedas corregirlos.
                </p>
                <ul className="space-y-2">
                  {saveErrors.map((e, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{e.atletaNombre}</span>
                      <span className="ml-2 text-danger">— {e.error}</span>
                    </li>
                  ))}
                </ul>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onPress={errorModal.close}>
                  Entendido
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
