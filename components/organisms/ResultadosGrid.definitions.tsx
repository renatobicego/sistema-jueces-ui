import type {
  ColDef,
  NewValueParams,
  ValueGetterParams,
  ValueSetterParams,
  ICellRendererParams,
} from "ag-grid-community";
import { Chip } from "@heroui/react";
import { formatMarcaInput } from "@/lib/utils/marca";
import MarcaCellEditor from "@/components/atoms/MarcaCellEditor";
import MarcaVientoCellEditor, {
  type MarcaVientoValue,
} from "@/components/atoms/MarcaVientoCellEditor";
import MarcaVientoCellRenderer from "@/components/atoms/MarcaVientoCellRenderer";
import type { ConfigPrueba, GridRow, IntentoAltura, TipoMarca } from "@/types";

const OBSERVACIONES = ["DNS", "DNF", "NM", "DQ"];

export function buildColDefs(
  config: ConfigPrueba | undefined | null,
  esSuperJuez: boolean,
): ColDef<GridRow>[] {
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
}
