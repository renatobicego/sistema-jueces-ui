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
import type { AtletaEntry, ConfigPrueba, IntentoAltura } from "@/types";

ModuleRegistry.registerModules([AllCommunityModule]);

const OBSERVACIONES = ["DNS", "DNF", "NM", "DQ"];

interface Props {
  atletas: AtletaEntry[];
  config: ConfigPrueba | null;
  resultadoId: string | null;
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: "M" | "F";
  onSaved: () => void;
}

// Row shape used inside the grid
interface GridRow extends AtletaEntry {
  _marca: string;
  _viento: string;
  _observacion: string;
  _dirty: boolean;
}

function toGridRow(e: AtletaEntry): GridRow {
  const ra = e.resultadoAtleta;
  return {
    ...e,
    _marca: ra?.marca ?? "",
    _viento: ra?.viento ?? "",
    _observacion: ra?.observacion ?? "",
    _dirty: false,
  };
}

export default function ResultadosGrid({
  atletas,
  config,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resultadoId: _resultadoId,
  pruebaId,
  categoriaId,
  sexo,
  onSaved,
}: Props) {
  const gridRef = useRef<AgGridReact<GridRow>>(null);
  const [vientoGlobal, setVientoGlobal] = useState("+0.0");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

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
        valueGetter: (p) => p.data?.atleta.nombre_apellido ?? "",
        sortable: true,
        filter: true,
      },
      {
        headerName: "MP",
        field: "marcaPersonal",
        width: 90,
        cellStyle: { color: "#64748b", fontSize: "12px" },
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
      base.push({
        field: "_marca",
        headerName: "Marca",
        flex: 1,
        editable: true,
        onCellValueChanged: (p: NewValueParams<GridRow>) => {
          if (p.data) p.data._dirty = true;
        },
      });
    }

    if (config?.tipoIntentos === "serie") {
      const maxIntentos = config.maxIntentos || 6;
      for (let i = 0; i < maxIntentos; i++) {
        base.push({
          headerName: `Int. ${i + 1}`,
          width: 90,
          editable: true,
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
      if (config.tieneViento) {
        base.push({
          field: "_viento",
          headerName: "Viento",
          width: 90,
          editable: true,
          valueSetter: (p: ValueSetterParams<GridRow>) => {
            if (!p.data) return false;
            p.data._viento = formatVientoInput(
              p.data._viento,
              p.newValue ?? "",
            );
            p.data._dirty = true;
            return true;
          },
          cellStyle: { fontFamily: "monospace" },
        });
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

    base.push({
      headerName: "Estado",
      width: 100,
      cellRenderer: (p: ICellRendererParams<GridRow>) => {
        const obs = p.data?._observacion;
        const marca = p.data?._marca || p.data?.resultadoAtleta?.marca;
        if (obs)
          return (
            <Chip size="sm" color="warning" variant="soft">
              {obs}
            </Chip>
          );
        if (marca)
          return (
            <Chip size="sm" color="success" variant="soft">
              {marca}
            </Chip>
          );
        return (
          <Chip size="sm" color="default" variant="soft">
            —
          </Chip>
        );
      },
    });

    return base;
  }, [config]);

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
  }, [config, pruebaId, categoriaId, sexo, vientoGlobal, onSaved]);

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
