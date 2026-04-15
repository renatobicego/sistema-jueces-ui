import type { GridApi } from "ag-grid-community";
import type { ConfigPrueba, GridRow } from "@/types";
import { validateGridRows } from "./validateGridRows";
import { Dispatch, SetStateAction } from "react";

/**
 * Apply sorting to the grid by marcaParcial when "Rearmar Orden" is enabled
 */
export function applySortingByMarcaParcial(
  api: GridApi | undefined,
  rearmarOrden: boolean,
  config: ConfigPrueba | null | undefined,
) {
  if (!api || config?.tipoIntentos !== "serie") return;

  if (rearmarOrden) {
    // Sort by marcaParcial ascending (best first - higher marks come first)
    api.applyColumnState({
      state: [
        {
          colId: "marcaParcial",
          sort: "asc",
          sortIndex: 0,
        },
      ],
      defaultState: { sort: null },
    });
  } else {
    // Clear sorting - return to original order (by numero)
    api.applyColumnState({
      state: [
        {
          colId: "numero",
          sort: "asc",
          sortIndex: 0,
        },
      ],
      defaultState: { sort: null },
    });
  }
}

/**
 * Get row style for non-qualified athletes when "Rearmar Orden" is enabled
 */
export function getRowStyleForNonQualified(
  rearmarOrden: boolean,
  config: ConfigPrueba | null | undefined,
  hasMarcaParcial: boolean,
) {
  if (rearmarOrden && config?.tipoIntentos === "serie" && !hasMarcaParcial) {
    return {
      backgroundColor: "#f8fafc",
      opacity: 0.6,
      pointerEvents: "none" as const,
    };
  }
  return undefined;
}

/**
 * Determine if a TipoMarca should be sorted descending (higher is better)
 * or ascending (lower is better)
 */
function shouldSortDescending(tipoMarca: string): boolean {
  const descendingTypes = ["DISTANCIA", "LARGO", "ALTURA", "PUNTOS"];
  return descendingTypes.includes(tipoMarca);
}

/**
 * Calculate final positions for all athletes based on their marks
 * Returns the updated rows with positions assigned
 */
export function calculatePuestos(
  rows: GridRow[],
  config: ConfigPrueba | null | undefined,
): GridRow[] {
  if (!config?.tipoMarca) return [];

  const isDescending = shouldSortDescending(config.tipoMarca);

  // Separate athletes with valid marks from those without
  const withMarks = rows.filter((row) => {
    const marca = row._marca || row.resultadoAtleta?.marca;
    const obs = row._observacion || row.resultadoAtleta?.observacion;
    return marca && !obs;
  });

  const withoutMarks = rows.filter((row) => {
    const marca = row._marca || row.resultadoAtleta?.marca;
    const obs = row._observacion || row.resultadoAtleta?.observacion;
    return !marca || obs;
  });

  // Sort athletes with marks
  withMarks.sort((a, b) => {
    const marcaA = a._marca || a.resultadoAtleta?.marca || "";
    const marcaB = b._marca || b.resultadoAtleta?.marca || "";

    const comparison = marcaA.localeCompare(marcaB);
    return isDescending ? -comparison : comparison;
  });

  // Assign positions
  withMarks.forEach((row, index) => {
    row._puesto = index + 1;
  });

  withoutMarks.forEach((row) => {
    row._puesto = 99;
  });

  // Return all rows with updated positions
  return rows;
}

export const createBatchPayload = (
  data: {
    config: ConfigPrueba | null | undefined;
    pruebaId: string;
    categoriaId: string;
    sexo: string;
    esSuperJuez: boolean;
    vientoGlobal: string;
  },
  handlers: {
    api: GridApi<GridRow> | undefined;
    setSaveErrors: Dispatch<
      SetStateAction<
        {
          atletaNombre: string;
          error: string;
        }[]
      >
    >;
    openErrorModal: () => void;
  },
  shouldCalculatePuestos?: boolean,
) => {
  const { config, pruebaId, categoriaId, sexo, esSuperJuez, vientoGlobal } =
    data;
  const { api, setSaveErrors, openErrorModal } = handlers;
  if (!api) return;
  let rows: GridRow[] = [];

  api.forEachNode((node: { data?: GridRow }) => {
    if (node.data) rows.push(node.data);
  });

  rows = shouldCalculatePuestos ? calculatePuestos(rows, config) : rows;

  const validationErrors = validateGridRows(rows, config);
  if (validationErrors.length > 0) {
    setSaveErrors(
      validationErrors.map(({ atletaNombre, field, value, message }) => ({
        atletaNombre,
        error: `${field}: "${value}" ${message ?? "tiene formato incorrecto"}`,
      })),
    );
    openErrorModal();
    return;
  }

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
      ...(shouldCalculatePuestos && {
        puesto: row._puesto,
      }),
      andarivel: row._andarivel,
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
  return { resultados, rows };
};
