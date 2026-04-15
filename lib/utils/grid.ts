import type { AtletaEntry, GridRow } from "@/types";

/**
 * Converts an AtletaEntry to a GridRow for use in ResultadosGrid.
 */
export function toGridRow(e: AtletaEntry): GridRow {
  const ra = e.resultadoAtleta;
  return {
    ...e,
    _marca: ra?.marca ?? "",
    _viento: ra?.viento ?? "",
    _observacion: ra?.observacion ?? "",
    _puesto: ra?.puesto ?? undefined,
    _dirty: false,
    _andarivel: ra?.andarivel,
  };
}

/**
 * Returns the pending assignment for a juez, falling back to their current assignments.
 */
export function getAssignedPruebas(
  pendingAssignments: Record<string, string[]>,
  juezId: string,
  current: string[],
): string[] {
  return pendingAssignments[juezId] ?? current;
}
