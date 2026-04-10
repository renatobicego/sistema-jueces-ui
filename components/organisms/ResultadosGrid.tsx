"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type {
  ColDef,
  GridApi,
  NewValueParams,
  ValueGetterParams,
  ValueSetterParams,
  ICellRendererParams,
} from "ag-grid-community";
import { Chip } from "@heroui/react";
import { juecesApi } from "@/lib/axios";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { VientoInput } from "@/components/atoms/VientoInput";
import { formatVientoInput } from "@/lib/utils/viento";
import { formatMarcaInput } from "@/lib/utils/marca";
import MarcaCellEditor from "@/components/atoms/MarcaCellEditor";
import MarcaVientoCellEditor, {
  type MarcaVientoValue,
} from "@/components/atoms/MarcaVientoCellEditor";
import MarcaVientoCellRenderer from "@/components/atoms/MarcaVientoCellRenderer";
import { useAuthStore } from "@/store/authStore";
import type {
  GridRow,
  IntentoAltura,
  ResultadosGridProps,
  TipoMarca,
} from "@/types";
import { toGridRow } from "@/lib/utils/grid";

ModuleRegistry.registerModules([AllCommunityModule]);

const OBSERVACIONES = ["DNS", "DNF", "NM", "DQ"];

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
  const [msg, setMsg] = useState("");
  const esSuperJuez = useAuthStore((s) => s.juezSession?.esSuperJuez ?? false);

  const handleVientoChange = (next: string) => {
    setVientoGlobal(formatVientoInput(vientoGlobal, next));
  };

  const rowData = useMemo(() => atletas.map(toGridRow), [atletas]);

  const colDefs = useMemo<ColDef<GridRow>[]>(() => {
    const base: ColDef<GridRow>[] = [
      { field: "numero", headerName: "#", width: 60, sortable: true },
      {
        headerName: "Atleta",
        flex: 2,
        minWidth: 250,
        valueGetter: (p) => p.data?.atleta.nombre_apellido ?? "",
        sortable: true,
        filter: true,
      },
      {
        headerName: "MP",
        field: "marcaPersonal",
        width: 90,
        editable: esSuperJuez,
        cellStyle: { color: "#64748b", fontSize: "12px" },
        onCellValueChanged: (p: NewValueParams<GridRow>) => {
          if (p.data) p.data._dirty = true;
        },
      },
      {
        field: "_observacion",
        headerName: "Obs.",
        width: 100,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: ["", ...OBSERVACIONES] },
        onCellValueChanged: (p: NewValueParams<GridRow>) => {
          if (p.data) p.data._dirty = true;
        },
      },
    ];

    if (!config || config.tipoIntentos === "ninguno") {
      const tipoMarca = (config?.tipoMarca ?? "SPRINT") as TipoMarca;
      base.push({
        field: "_marca",
        headerName: "Marca",
        flex: 1,
        editable: true,
        cellEditor: MarcaCellEditor,
        cellEditorParams: { tipoMarca },
        valueSetter: (p: ValueSetterParams<GridRow>) => {
          if (!p.data) return false;
          p.data._marca = formatMarcaInput(
            p.data._marca,
            p.newValue ?? "",
            tipoMarca,
          );
          p.data._dirty = true;
          return true;
        },
        cellStyle: { fontFamily: "monospace" },
      });
    }

    if (config?.tipoIntentos === "serie") {
      const maxIntentos = config.maxIntentos || 6;
      const tipoMarca = (config.tipoMarca ?? "DISTANCIA") as TipoMarca;
      const conViento = config.tieneViento;

      for (let i = 0; i < maxIntentos; i++) {
        if (conViento) {
          // Combined marca+viento cell
          base.push({
            headerName: `Int. ${i + 1}`,
            width: 110,
            editable: true,
            autoHeight: true,
            cellEditor: MarcaVientoCellEditor,
            cellEditorParams: { tipoMarca },
            cellRenderer: MarcaVientoCellRenderer,
            valueGetter: (p: ValueGetterParams<GridRow>): MarcaVientoValue => ({
              marca: p.data?.resultadoAtleta?.intentosSerie?.[i]?.marca ?? null,
              viento:
                p.data?.resultadoAtleta?.intentosSerie?.[i]?.viento ?? null,
            }),
            valueSetter: (p: ValueSetterParams<GridRow, MarcaVientoValue>) => {
              if (!p.data) return false;
              if (!p.data.resultadoAtleta) {
                p.data.resultadoAtleta = {
                  _id: "",
                  marca: null,
                  viento: null,
                  observacion: null,
                  intentosSerie: [],
                  intentosAltura: [],
                };
              }
              const arr = [...(p.data.resultadoAtleta.intentosSerie ?? [])];
              while (arr.length <= i) arr.push({ marca: null });
              arr[i] = {
                ...arr[i],
                marca: p.newValue?.marca ?? null,
                viento: p.newValue?.viento ?? null,
              };
              p.data.resultadoAtleta.intentosSerie = arr;
              p.data._dirty = true;
              return true;
            },
          });
        } else {
          // Marca only
          base.push({
            headerName: `Int. ${i + 1}`,
            width: 90,
            editable: true,
            cellStyle: { fontFamily: "monospace" },
            cellEditor: MarcaCellEditor,
            cellEditorParams: { tipoMarca },
            valueGetter: (p: ValueGetterParams<GridRow>) =>
              p.data?.resultadoAtleta?.intentosSerie?.[i]?.marca ?? "",
            valueSetter: (p: ValueSetterParams<GridRow>) => {
              if (!p.data) return false;
              if (!p.data.resultadoAtleta) {
                p.data.resultadoAtleta = {
                  _id: "",
                  marca: null,
                  viento: null,
                  observacion: null,
                  intentosSerie: [],
                  intentosAltura: [],
                };
              }
              const arr = [...(p.data.resultadoAtleta.intentosSerie ?? [])];
              while (arr.length <= i) arr.push({ marca: null });
              arr[i] = { ...arr[i], marca: p.newValue || null };
              p.data.resultadoAtleta.intentosSerie = arr;
              p.data._dirty = true;
              return true;
            },
          });
        }
      }

      // Separate viento column only when NOT using combined cell
      if (!conViento) {
        // nothing extra needed
      }
    }

    if (config?.tipoIntentos === "altura") {
      base.push({
        headerName: "Alturas",
        flex: 2,
        editable: false,
        valueGetter: (p: ValueGetterParams<GridRow>) => {
          const intentos = p.data?.resultadoAtleta?.intentosAltura ?? [];
          return intentos
            .map((ia: IntentoAltura) => `${ia.altura}:${ia.intentos.join("")}`)
            .join("  ");
        },
        cellStyle: { fontFamily: "monospace", fontSize: "12px" },
      });
    }

    const isWindSerie = config?.tipoIntentos === "serie" && config.tieneViento;
    base.push({
      headerName: "Mejor Marca",
      width: 150,
      editable: esSuperJuez,
      cellEditor: isWindSerie ? MarcaVientoCellEditor : MarcaCellEditor,
      cellEditorParams: { tipoMarca: config?.tipoMarca ?? "DISTANCIA" },
      valueGetter: (p: ValueGetterParams<GridRow>) => {
        const obs = p.data?._observacion;
        const marca = p.data?._marca || p.data?.resultadoAtleta?.marca;
        if (obs) return;
        if (isWindSerie) {
          return {
            marca,
            viento: p.data?._viento || p.data?.resultadoAtleta?.viento,
          };
        }
        return marca;
      },
      valueSetter: (p: ValueSetterParams<GridRow>) => {
        if (!p.data) return false;
        if (isWindSerie) {
          p.data._marca = p.newValue?.marca ?? null;
          p.data._viento = p.newValue?.viento ?? null;
        } else {
          p.data._marca = formatMarcaInput(
            p.data._marca,
            p.newValue ?? "",
            config?.tipoMarca ?? "DISTANCIA",
          );
        }
        p.data._manualFinalMark = true;
        p.data._dirty = true;
        return true;
      },
      cellRenderer: (p: ICellRendererParams<GridRow>) => {
        const obs = p.data?._observacion;
        const marca = p.data?._marca || p.data?.resultadoAtleta?.marca;
        if (obs)
          return (
            <div className="h-16">
              <Chip size="sm" color="warning" variant="soft">
                {obs}
              </Chip>
            </div>
          );
        if (marca)
          return (
            <div className="h-16">
              <Chip size="sm" color="success" variant="soft">
                {marca}
              </Chip>
            </div>
          );
        return (
          <div className="h-16">
            <Chip size="sm" color="default" variant="soft">
              —
            </Chip>
          </div>
        );
      },
    });

    return base;
  }, [config, esSuperJuez]);

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
    setMsg("");
    try {
      const { data } = await juecesApi.post("/jueces/resultados/batch", {
        resultados,
      });
      setMsg(
        `Guardado: ${data.saved?.length ?? 0} — Errores: ${data.errors?.length ?? 0}`,
      );
      onSaved();
    } catch {
      setMsg("Error al guardar.");
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
        {msg && <span className="text-slate-600 text-sm">{msg}</span>}
      </div>
    </div>
  );
}
