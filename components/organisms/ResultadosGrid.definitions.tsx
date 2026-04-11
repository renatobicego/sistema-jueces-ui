import type {
  ColDef,
  NewValueParams,
  ValueGetterParams,
  ValueSetterParams,
  ICellRendererParams,
  CellClassParams,
  IRowNode,
} from "ag-grid-community";
import { Chip } from "@heroui/react";
import { formatMarcaInput, isMarcaValid } from "@/lib/utils/marca";
import { isVientoValid } from "@/lib/utils/viento";
import MarcaCellEditor from "@/components/atoms/MarcaCellEditor";
import MarcaVientoCellEditor, {
  type MarcaVientoValue,
} from "@/components/atoms/MarcaVientoCellEditor";
import MarcaVientoCellRenderer from "@/components/atoms/MarcaVientoCellRenderer";
import IntentosAlturaCellRenderer, {
  type IntentosAlturaValue,
  toEditorValue,
} from "@/components/atoms/IntentosAlturaCellEditor";
import type { ConfigPrueba, GridRow, IntentoAltura, TipoMarca } from "@/types";

const OBSERVACIONES = ["DNS", "DNF", "NM", "DQ"];

const INVALID_CELL_STYLE = { backgroundColor: "#fee2e2", color: "#991b1b" };

function marcaCellStyle(tipoMarca: TipoMarca) {
  return (p: CellClassParams<GridRow>) => {
    const v: string = p.value ?? "";
    if (v && !isMarcaValid(v, tipoMarca)) return INVALID_CELL_STYLE;
    return { fontFamily: "monospace" };
  };
}

function marcaVientoCellStyle(tipoMarca: TipoMarca) {
  return (p: CellClassParams<GridRow, MarcaVientoValue>) => {
    const marca = p.value?.marca ?? "";
    const viento = p.value?.viento ?? "";
    const marcaInvalid = marca && !isMarcaValid(marca, tipoMarca);
    const vientoInvalid = viento && !isVientoValid(viento);
    if (marcaInvalid || vientoInvalid) return INVALID_CELL_STYLE;
    return {};
  };
}

export function buildColDefs(
  config: ConfigPrueba | undefined | null,
  esSuperJuez: boolean,
  alturas: string[] = [],
): ColDef<GridRow>[] {
  const base: ColDef<GridRow>[] = [
    { field: "numero", headerName: "#", width: 60, sortable: true },
    {
      field: "_puesto",
      colId: "puesto",
      headerName: "Puesto",
      width: 120,
      sortable: true,
      cellStyle: (params) => {
        const baseStyle: Record<string, string | number> = { color: "#0f172a" };
        if (params.value === 99) {
          return { ...baseStyle, color: "#94a3b8", fontStyle: "italic" };
        }
        return { ...baseStyle, fontWeight: "bold" };
      },
      valueFormatter: (params) => {
        if (params.value === 99) return "—";
        return params.value?.toString() ?? "";
      },
    },
    {
      headerName: "Atleta",
      flex: 2,
      minWidth: 250,
      valueGetter: (p) => p.data?.atleta.nombre_apellido ?? "",
      sortable: true,
      filter: true,
    },
    // {
    //   headerName: "MP",
    //   field: "marcaPersonal",
    //   width: 90,
    //   editable: esSuperJuez,
    //   cellStyle: { color: "#64748b", fontSize: "12px" },
    //   onCellValueChanged: (p: NewValueParams<GridRow>) => {
    //     if (p.data) p.data._dirty = true;
    //   },
    // },
    {
      field: "_observacion",
      headerName: "Obs.",
      width: 100,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: ["", ...OBSERVACIONES] },
      onCellValueChanged: (p: NewValueParams<GridRow>) => {
        if (
          p.data?._observacion &&
          (p.data._marca ||
            p.data.resultadoAtleta?.intentosSerie.length ||
            p.data.resultadoAtleta?.intentosAltura.length)
        ) {
          const confirmAction = confirm(
            "¿Está seguro del cambio? Agregar una observación borrará la marca del atleta?",
          );
          if (!confirmAction) {
            p.data._observacion = p.oldValue;
            p.api.refreshCells({
              columns: ["_observacion"],
              rowNodes: [p.node as IRowNode<GridRow>],
              force: true,
            });
            return;
          }
          p.data._dirty = true;
          p.data._marca = "";
          p.data._viento = "";
          p.data.resultadoAtleta = p.data.resultadoAtleta
            ? {
                ...p.data.resultadoAtleta,
                marca: null,
                viento: null,
                observacion: null,
                intentosSerie: [],
                intentosAltura: [],
              }
            : null;
          p.api.refreshCells({
            rowNodes: [p.node as IRowNode<GridRow>],
            force: true,
          });
        }
      },
    },
  ];

  // Add hidden marcaParcial column for sorting (only for serie)
  if (config?.tipoIntentos === "serie") {
    base.push({
      colId: "marcaParcial",
      field: "resultadoAtleta.marcaParcial",
      hide: true,
      sortable: true,
      comparator: (valueA: string | null, valueB: string | null) => {
        // Null values go to the end
        if (!valueA && !valueB) return 0;
        if (!valueA) return 1;
        if (!valueB) return -1;
        // Compare as strings (marca format is sortable as string)
        return valueA.localeCompare(valueB);
      },
    });
  }

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
      cellStyle: marcaCellStyle(tipoMarca),
    });
  }

  if (config?.tipoIntentos === "serie") {
    const maxIntentos = config.maxIntentos || 6;
    const tipoMarca = (config.tipoMarca ?? "DISTANCIA") as TipoMarca;
    const conViento = config.tieneViento;

    for (let i = 0; i < maxIntentos; i++) {
      // Attempts 4-6 are only editable if marcaParcial exists (qualified for final)
      const isFinalAttempt = i >= 3;

      if (conViento) {
        base.push({
          headerName: `Int. ${i + 1}`,
          width: 110,
          editable: (params) => {
            if (!isFinalAttempt) return true;
            return !!params.data?.resultadoAtleta?.marcaParcial;
          },
          autoHeight: true,
          cellEditor: MarcaVientoCellEditor,
          cellEditorParams: { tipoMarca },
          cellRenderer: MarcaVientoCellRenderer,
          cellStyle: (params) => {
            const baseStyle = marcaVientoCellStyle(tipoMarca)(params);
            if (isFinalAttempt && !params.data?.resultadoAtleta?.marcaParcial) {
              return { ...baseStyle, backgroundColor: "#f1f5f9", opacity: 0.5 };
            }
            return baseStyle;
          },
          valueGetter: (p: ValueGetterParams<GridRow>): MarcaVientoValue => ({
            marca: p.data?.resultadoAtleta?.intentosSerie?.[i]?.marca ?? null,
            viento: p.data?.resultadoAtleta?.intentosSerie?.[i]?.viento ?? null,
          }),
          valueSetter: (p: ValueSetterParams<GridRow, MarcaVientoValue>) => {
            if (!p.data) return false;
            // Block editing if it's a final attempt and no marcaParcial
            if (isFinalAttempt && !p.data.resultadoAtleta?.marcaParcial)
              return false;

            if (!p.data.resultadoAtleta) {
              p.data.resultadoAtleta = {
                _id: "",
                marca: null,
                marcaParcial: null,
                viento: null,
                observacion: null,
                puesto: null,
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
            p.data._observacion = "";
            p.data._dirty = true;
            return true;
          },
        });
      } else {
        base.push({
          headerName: `Int. ${i + 1}`,
          width: 90,
          editable: (params) => {
            if (!isFinalAttempt) return true;
            return !!params.data?.resultadoAtleta?.marcaParcial;
          },
          cellStyle: (params) => {
            const baseStyle = marcaCellStyle(tipoMarca)(params);
            if (isFinalAttempt && !params.data?.resultadoAtleta?.marcaParcial) {
              return { ...baseStyle, backgroundColor: "#f1f5f9", opacity: 0.5 };
            }
            return baseStyle;
          },
          cellEditor: MarcaCellEditor,
          cellEditorParams: { tipoMarca },
          valueGetter: (p: ValueGetterParams<GridRow>) =>
            p.data?.resultadoAtleta?.intentosSerie?.[i]?.marca ?? "",
          valueSetter: (p: ValueSetterParams<GridRow>) => {
            if (!p.data) return false;
            // Block editing if it's a final attempt and no marcaParcial
            if (isFinalAttempt && !p.data.resultadoAtleta?.marcaParcial)
              return false;

            if (!p.data.resultadoAtleta) {
              p.data.resultadoAtleta = {
                _id: "",
                marca: null,
                marcaParcial: null,
                viento: null,
                puesto: null,
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
            p.data._observacion = "";
            return true;
          },
        });
      }

      // Add Marca Parcial column after 3rd attempt
      if (i === 2) {
        base.push({
          headerName: "Marca Parcial",
          width: 120,
          editable: false,
          cellStyle: { fontFamily: "monospace", backgroundColor: "#f8fafc" },
          valueGetter: (p: ValueGetterParams<GridRow>) =>
            p.data?.resultadoAtleta?.marcaParcial ?? "—",
        });
      }
    }
  }

  if (config?.tipoIntentos === "altura") {
    // One column per known altura, always showing 3 inline selects via cellRenderer
    for (let i = 0; i < alturas.length; i++) {
      const altura = alturas[i];
      base.push({
        headerName: altura,
        width: 120,
        editable: false,
        sortable: false,
        cellRenderer: IntentosAlturaCellRenderer,
        cellRendererParams: { altura, alturas, alturaIndex: i },
        valueGetter: (p: ValueGetterParams<GridRow>): IntentosAlturaValue => {
          const ia = p.data?.resultadoAtleta?.intentosAltura?.find(
            (x: IntentoAltura) => x.altura === altura,
          );
          return toEditorValue(ia, altura);
        },
      });
    }
  }

  if (config?.tipoIntentos === "serie" || config?.tipoIntentos === "altura") {
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
        p.data._observacion = "";
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
  }

  return base;
}
