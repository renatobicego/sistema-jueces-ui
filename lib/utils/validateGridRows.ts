import { isMarcaValid } from "@/lib/utils/marca";
import { isVientoValid } from "@/lib/utils/viento";
import type { ConfigPrueba, GridRow } from "@/types";

export interface GridValidationError {
  atletaNombre: string;
  field: string;
  value: string;
}

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

  return errors;
}
