import { isMarcaValid } from "@/lib/utils/marca";
import { isVientoValid } from "@/lib/utils/viento";
import type { ConfigPrueba, GridRow } from "@/types";

export interface GridValidationError {
  atletaNombre: string;
  field: string;
  value: string;
  message?: string;
}

const hasDuplicates = (arr: (number | null | undefined)[]) => {
  const duplicateIndices: (number | null | undefined)[] = [];

  arr.forEach((value, index) => {
    if (arr.indexOf(value) !== index) {
      duplicateIndices.push(index);
    }
  });
  return duplicateIndices;
};

export function validateGridRows(
  rows: GridRow[],
  config: ConfigPrueba | null | undefined,
): GridValidationError[] {
  const errors: GridValidationError[] = [];
  const tipoMarca = config?.tipoMarca ?? "SPRINT";

  for (const row of rows) {
    const nombre = row.atleta.nombre_apellido;

    // Rows with an observacion are valid as-is
    if (row._observacion) continue;

    if (!config || config.tipoIntentos === "ninguno") {
      const marca = row._marca;
      if (marca && !isMarcaValid(marca, tipoMarca)) {
        errors.push({ atletaNombre: nombre, field: "Marca", value: marca });
      }
      continue;
    }

    if (config.tipoIntentos === "serie") {
      const intentos = row.resultadoAtleta?.intentosSerie ?? [];
      intentos.forEach((intento, i) => {
        if (intento.marca && !isMarcaValid(intento.marca, tipoMarca)) {
          errors.push({
            atletaNombre: nombre,
            field: `Int. ${i + 1} marca`,
            value: intento.marca,
          });
        }
        if (
          config.tieneViento &&
          intento.viento &&
          !isVientoValid(intento.viento)
        ) {
          errors.push({
            atletaNombre: nombre,
            field: `Int. ${i + 1} viento`,
            value: intento.viento,
          });
        }
      });
    }

    // altura: no marca format to validate
  }

  // validate andariveles
  const andariveles = rows
    .filter((row) => row._andarivel)
    .map((row) => row._andarivel);
  const duplicateIndexes = hasDuplicates(andariveles);
  if (duplicateIndexes.length) {
    const rowsDuplicated = duplicateIndexes
      .filter(Boolean)
      .map((index) => rows[index as number]);
    rowsDuplicated.forEach((row) => {
      errors.push({
        atletaNombre: row.atleta.nombre_apellido,
        field: "Andarivel",
        value: row._andarivel?.toString() ?? "",
        message: "andarivel repetido",
      });
    });
  }

  return errors;
}
